-- ============================================================
-- A2K Store — Atomic stock RPC functions
-- ============================================================
-- These functions replace read-then-write patterns in the
-- service layer with atomic database operations to prevent
-- race conditions under concurrent access.

-- ============================================================
-- Atomic stock decrement (called when order is delivered)
-- Only this function permanently reduces stock.
-- ============================================================

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
BEGIN
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive, got: %', p_quantity;
  END IF;

  IF p_variant_id IS NOT NULL THEN
    v_table := 'product_variants';
    v_id := p_variant_id;
  ELSE
    v_table := 'products';
    v_id := p_product_id;
  END IF;

  -- Atomic: UPDATE ... WHERE stock >= quantity, check row count
  IF v_table = 'product_variants' THEN
    UPDATE public.product_variants
    SET stock = stock - p_quantity
    WHERE id = v_id AND stock >= p_quantity;

    IF NOT FOUND THEN
      -- Fetch current stock for error message
      SELECT stock INTO v_current_stock
      FROM public.product_variants WHERE id = v_id;
      RAISE EXCEPTION 'Insufficient stock. Available: %, requested: %',
        v_current_stock, p_quantity;
    END IF;
  ELSE
    UPDATE public.products
    SET stock = stock - p_quantity
    WHERE id = v_id AND stock >= p_quantity;

    IF NOT FOUND THEN
      SELECT stock INTO v_current_stock
      FROM public.products WHERE id = v_id;
      RAISE EXCEPTION 'Insufficient stock. Available: %, requested: %',
        v_current_stock, p_quantity;
    END IF;
  END IF;

  -- Record inventory movement
  INSERT INTO public.inventory_movements (
    product_id, variant_id, movement_type, quantity,
    reason, reference_id, reference_type, performed_by
  ) VALUES (
    p_product_id, p_variant_id, 'sale', -p_quantity,
    'Order delivered', p_order_id, 'order', p_performed_by
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ============================================================
-- Atomic stock reservation (for checkout)
-- Combines availability check + reservation insert atomically
-- ============================================================

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
BEGIN
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive, got: %', p_quantity;
  END IF;

  -- Lock the product/variant row to prevent concurrent reservations
  IF p_variant_id IS NOT NULL THEN
    SELECT stock, stock_reserved INTO v_stock, v_reserved
    FROM public.product_variants
    WHERE id = p_variant_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Variant not found: %', p_variant_id;
    END IF;
  ELSE
    SELECT stock, stock_reserved INTO v_stock, v_reserved
    FROM public.products
    WHERE id = p_product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', p_product_id;
    END IF;
  END IF;

  IF (v_stock - v_reserved) < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock for reservation. Available: %, requested: %',
      (v_stock - v_reserved), p_quantity;
  END IF;

  -- Insert reservation (trigger will update stock_reserved)
  INSERT INTO public.stock_reservations (
    product_id, variant_id, order_id, quantity, status, expires_at
  ) VALUES (
    p_product_id, p_variant_id, p_order_id, p_quantity, 'active', p_expires_at
  )
  RETURNING id INTO v_reservation_id;

  RETURN v_reservation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ============================================================
-- Expire overdue reservations (for cron/edge function)
-- ============================================================

CREATE OR REPLACE FUNCTION public.expire_overdue_reservations()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.stock_reservations
  SET
    status = 'expired',
    released_at = now(),
    released_reason = 'expired'
  WHERE status = 'active'
    AND expires_at < now();

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- ============================================================
-- Grant execute to authenticated users
-- ============================================================

GRANT EXECUTE ON FUNCTION public.decrement_stock TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_stock_reservation TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_overdue_reservations TO service_role;
