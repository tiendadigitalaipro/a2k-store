-- ============================================================
-- A2K Store — Security Hardening (Fase 3)
-- ============================================================
-- Additive migration. Do not edit previously applied migrations.

-- ------------------------------------------------------------
-- PROFILES: prevent privilege escalation from client updates
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_profile_privileged_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- auth.uid() is NULL for trusted auth-trigger/service contexts.
  -- Authenticated users must not change privileged profile fields.
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.is_active IS DISTINCT FROM OLD.is_active
       OR NEW.email_verified IS DISTINCT FROM OLD.email_verified
       OR NEW.two_factor_enabled IS DISTINCT FROM OLD.two_factor_enabled THEN
      RAISE EXCEPTION 'Protected profile fields cannot be modified by this user';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_guard_profile_privileged_fields ON public.profiles;
CREATE TRIGGER trg_guard_profile_privileged_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_privileged_fields();

-- ------------------------------------------------------------
-- CUSTOMERS: prevent ownership/privilege field tampering
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.guard_customer_protected_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    IF NEW.profile_id IS DISTINCT FROM OLD.profile_id
       OR NEW.is_wholesale IS DISTINCT FROM OLD.is_wholesale
       OR NEW.notes IS DISTINCT FROM OLD.notes THEN
      RAISE EXCEPTION 'Protected customer fields cannot be modified by this user';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_guard_customer_protected_fields ON public.customers;
CREATE TRIGGER trg_guard_customer_protected_fields
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.guard_customer_protected_fields();

-- ------------------------------------------------------------
-- AUTH SIGNUP: create profile + customer atomically
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_whatsapp TEXT;
BEGIN
  v_whatsapp := COALESCE(NEW.raw_user_meta_data ->> 'whatsapp', '');

  INSERT INTO public.profiles (id, email, full_name, whatsapp, role, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(v_whatsapp, ''),
    'customer',
    CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.customers (profile_id, whatsapp)
  VALUES (NEW.id, v_whatsapp)
  ON CONFLICT (profile_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ------------------------------------------------------------
-- STOCK RPC: enforce authorization and order ownership
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_stock_reservation(
  p_product_id UUID,
  p_variant_id UUID,
  p_order_id UUID,
  p_quantity INTEGER,
  p_expires_at TIMESTAMPTZ
) RETURNS UUID AS $$
DECLARE
  v_stock INTEGER;
  v_reserved INTEGER;
  v_reservation_id UUID;
  v_customer_id UUID;
  v_order_customer UUID;
  v_order_status public.order_status;
BEGIN
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive';
  END IF;

  IF p_expires_at <= now() OR p_expires_at > now() + interval '60 minutes' THEN
    RAISE EXCEPTION 'Invalid reservation expiration';
  END IF;

  SELECT customer_id, status INTO v_order_customer, v_order_status
  FROM public.orders WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  v_customer_id := public.get_customer_id();

  IF NOT (public.is_admin() OR public.has_role('inventory'::public.user_role)) THEN
    IF v_customer_id IS NULL OR v_order_customer IS DISTINCT FROM v_customer_id THEN
      RAISE EXCEPTION 'Not authorized for this order';
    END IF;

    IF v_order_status <> 'pending_payment'::public.order_status THEN
      RAISE EXCEPTION 'Order is not reservable';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM public.order_items oi
      WHERE oi.order_id = p_order_id
        AND oi.product_id = p_product_id
        AND oi.variant_id IS NOT DISTINCT FROM p_variant_id
        AND oi.quantity >= p_quantity
    ) THEN
      RAISE EXCEPTION 'Product is not part of this order';
    END IF;
  END IF;

  IF p_variant_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.product_variants pv
      WHERE pv.id = p_variant_id AND pv.product_id = p_product_id
    ) THEN
      RAISE EXCEPTION 'Variant does not belong to product';
    END IF;

    SELECT stock, stock_reserved INTO v_stock, v_reserved
    FROM public.product_variants WHERE id = p_variant_id FOR UPDATE;
  ELSE
    SELECT stock, stock_reserved INTO v_stock, v_reserved
    FROM public.products WHERE id = p_product_id FOR UPDATE;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product or variant not found';
  END IF;

  IF (v_stock - v_reserved) < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock for reservation';
  END IF;

  INSERT INTO public.stock_reservations (
    product_id, variant_id, order_id, quantity, status, expires_at
  ) VALUES (
    p_product_id, p_variant_id, p_order_id, p_quantity, 'active', p_expires_at
  ) RETURNING id INTO v_reservation_id;

  RETURN v_reservation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.decrement_stock(
  p_product_id UUID,
  p_variant_id UUID,
  p_quantity INTEGER,
  p_order_id UUID,
  p_performed_by UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_table TEXT;
  v_id UUID;
  v_current_stock INTEGER;
  v_customer_id UUID;
  v_order_customer UUID;
  v_order_status public.order_status;
  v_order_qty INTEGER;
  v_already_sold INTEGER;
BEGIN
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive';
  END IF;

  IF NOT (public.is_admin() OR public.has_role('inventory'::public.user_role)) THEN
    RAISE EXCEPTION 'Not authorized to decrement stock';
  END IF;

  SELECT customer_id, status INTO v_order_customer, v_order_status
  FROM public.orders WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order_status NOT IN ('payment_approved','preparing','shipped','delivered') THEN
    RAISE EXCEPTION 'Order status does not allow stock decrement';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.order_items oi
    WHERE oi.order_id = p_order_id
      AND oi.product_id = p_product_id
      AND oi.variant_id IS NOT DISTINCT FROM p_variant_id
  ) THEN
    RAISE EXCEPTION 'Product is not part of this order';
  END IF;

  SELECT COALESCE(SUM(oi.quantity), 0) INTO v_order_qty
  FROM public.order_items oi
  WHERE oi.order_id = p_order_id
    AND oi.product_id = p_product_id
    AND oi.variant_id IS NOT DISTINCT FROM p_variant_id;

  SELECT COALESCE(SUM(-im.quantity), 0) INTO v_already_sold
  FROM public.inventory_movements im
  WHERE im.reference_id = p_order_id
    AND im.reference_type = 'order'
    AND im.product_id = p_product_id
    AND im.variant_id IS NOT DISTINCT FROM p_variant_id
    AND im.movement_type = 'sale';

  IF v_already_sold + p_quantity > v_order_qty THEN
    RAISE EXCEPTION 'Stock already decremented for this order/item';
  END IF;

  IF p_variant_id IS NOT NULL THEN
    v_table := 'product_variants';
    v_id := p_variant_id;
    UPDATE public.product_variants
    SET stock = stock - p_quantity
    WHERE id = v_id AND stock >= p_quantity;
  ELSE
    v_table := 'products';
    v_id := p_product_id;
    UPDATE public.products
    SET stock = stock - p_quantity
    WHERE id = v_id AND stock >= p_quantity;
  END IF;

  IF NOT FOUND THEN
    IF p_variant_id IS NOT NULL THEN
      SELECT stock INTO v_current_stock FROM public.product_variants WHERE id = v_id;
    ELSE
      SELECT stock INTO v_current_stock FROM public.products WHERE id = v_id;
    END IF;
    RAISE EXCEPTION 'Insufficient stock. Available: %, requested: %', v_current_stock, p_quantity;
  END IF;

  INSERT INTO public.inventory_movements (
    product_id, variant_id, movement_type, quantity,
    reason, reference_id, reference_type, performed_by
  ) VALUES (
    p_product_id, p_variant_id, 'sale', -p_quantity,
    'Order delivered', p_order_id, 'order', COALESCE(auth.uid(), p_performed_by)
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Reservation expiration remains backend/service only.
REVOKE EXECUTE ON FUNCTION public.expire_overdue_reservations() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.expire_overdue_reservations() TO service_role;

-- Customers need reservation RPC during checkout, but only with the
-- authorization checks implemented above. Stock decrement is staff-only.
GRANT EXECUTE ON FUNCTION public.create_stock_reservation(UUID, UUID, UUID, INTEGER, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock(UUID, UUID, INTEGER, UUID, UUID) TO authenticated;
