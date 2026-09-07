-- ============================================================
-- A2K Store — Atomic checkout RPC (Phase 4 fix)
-- ============================================================
-- Additive migration. Do not edit previously applied migrations.
--
-- Replaces the multi-step frontend order creation flow with a single
-- atomic database operation. Creates the order, order_items,
-- order_payment and stock reservations in one transaction.
--
-- Advantages:
--   - Financial totals are calculated from DB prices, not frontend.
--   - If any step fails, the whole transaction rolls back.
--   - Payment method existence and active status are validated.
--   - Address ownership is verified.
--   - Stock reservations are created atomically.
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_order_checkout(
  p_items JSONB,
  p_payment_method_id UUID,
  p_delivery_method public.delivery_method DEFAULT 'pickup',
  p_address_id UUID DEFAULT NULL,
  p_customer_notes TEXT DEFAULT NULL,
  p_reservation_minutes INTEGER DEFAULT 30
) RETURNS JSONB AS $$
DECLARE
  v_customer_id UUID;
  v_payment_method public.payment_methods%ROWTYPE;
  v_order public.orders%ROWTYPE;
  v_item JSONB;
  v_product public.products%ROWTYPE;
  v_variant public.product_variants%ROWTYPE;
  v_price NUMERIC(12,2);
  v_quantity INTEGER;
  v_subtotal NUMERIC(12,2) := 0;
  v_discount_total NUMERIC(12,2) := 0;
  v_shipping_cost NUMERIC(12,2) := 0;
  v_total NUMERIC(12,2);
  v_reservation_expires_at TIMESTAMPTZ;
  v_product_name TEXT;
BEGIN
  -- Authentication: caller must have a customer record
  v_customer_id := public.get_customer_id();
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Address ownership check (if shipping)
  IF p_address_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.customer_addresses
      WHERE id = p_address_id AND customer_id = v_customer_id
    ) THEN
      RAISE EXCEPTION 'Address does not belong to customer';
    END IF;
  END IF;

  -- Payment method must exist, be active and be allowed for checkout
  SELECT * INTO v_payment_method
  FROM public.payment_methods
  WHERE id = p_payment_method_id AND is_active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or inactive payment method';
  END IF;

  -- Validate items and calculate subtotal from authoritative DB prices
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item ->> 'quantity')::INTEGER;

    IF v_quantity IS NULL OR v_quantity <= 0 THEN
      RAISE EXCEPTION 'Quantity must be positive';
    END IF;

    IF (v_item ->> 'variant_id') IS NOT NULL THEN
      SELECT * INTO v_variant
      FROM public.product_variants
      WHERE id = (v_item ->> 'variant_id')::UUID
        AND product_id = (v_item ->> 'product_id')::UUID;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Variant not found';
      END IF;

      SELECT name INTO v_product_name
      FROM public.products
      WHERE id = v_variant.product_id;

      v_price := COALESCE(v_variant.price, (
        SELECT price FROM public.products WHERE id = v_variant.product_id
      ));

      IF v_price IS NULL THEN
        RAISE EXCEPTION 'Price not found for variant';
      END IF;
    ELSE
      SELECT * INTO v_product
      FROM public.products
      WHERE id = (v_item ->> 'product_id')::UUID;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Product not found';
      END IF;

      v_product_name := v_product.name;
      v_price := v_product.price;
    END IF;

    v_subtotal := v_subtotal + (v_price * v_quantity);
  END LOOP;

  -- Totals (discounts and paid shipping reserved for future phases)
  v_total := v_subtotal - v_discount_total + v_shipping_cost;

  IF v_total < 0 THEN
    RAISE EXCEPTION 'Total cannot be negative';
  END IF;

  v_reservation_expires_at := now() + (p_reservation_minutes || ' minutes')::INTERVAL;

  -- Create order (status will be forced to pending_payment by existing trigger)
  INSERT INTO public.orders (
    customer_id,
    address_id,
    delivery_method,
    status,
    subtotal,
    discount_total,
    shipping_cost,
    total,
    currency,
    payment_method_id,
    customer_notes,
    reservation_expires_at
  ) VALUES (
    v_customer_id,
    p_address_id,
    p_delivery_method,
    'pending_payment',
    v_subtotal,
    v_discount_total,
    v_shipping_cost,
    v_total,
    'USD',
    p_payment_method_id,
    p_customer_notes,
    v_reservation_expires_at
  ) RETURNING * INTO v_order;

  -- Create order items and reserve stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item ->> 'quantity')::INTEGER;

    IF (v_item ->> 'variant_id') IS NOT NULL THEN
      SELECT * INTO v_variant
      FROM public.product_variants
      WHERE id = (v_item ->> 'variant_id')::UUID
        AND product_id = (v_item ->> 'product_id')::UUID;

      SELECT name INTO v_product_name
      FROM public.products
      WHERE id = v_variant.product_id;

      v_price := COALESCE(v_variant.price, (
        SELECT price FROM public.products WHERE id = v_variant.product_id
      ));

      INSERT INTO public.order_items (
        order_id,
        product_id,
        variant_id,
        product_name,
        product_sku,
        variant_name,
        price,
        quantity,
        subtotal,
        discount
      ) VALUES (
        v_order.id,
        v_variant.product_id,
        v_variant.id,
        v_product_name || ' — ' || v_variant.name,
        v_variant.sku,
        v_variant.name,
        v_price,
        v_quantity,
        v_price * v_quantity,
        0
      );
    ELSE
      SELECT * INTO v_product
      FROM public.products
      WHERE id = (v_item ->> 'product_id')::UUID;

      v_price := v_product.price;

      INSERT INTO public.order_items (
        order_id,
        product_id,
        product_name,
        product_sku,
        price,
        quantity,
        subtotal,
        discount
      ) VALUES (
        v_order.id,
        v_product.id,
        v_product.name,
        v_product.sku,
        v_price,
        v_quantity,
        v_price * v_quantity,
        0
      );
    END IF;

    -- Atomic stock reservation. Raises exception on insufficient stock,
    -- rolling back the entire transaction.
    PERFORM public.create_stock_reservation(
      (v_item ->> 'product_id')::UUID,
      (v_item ->> 'variant_id')::UUID,
      v_order.id,
      v_quantity,
      v_reservation_expires_at
    );
  END LOOP;

  -- Create pending payment
  INSERT INTO public.order_payments (
    order_id,
    payment_method_id,
    amount,
    currency,
    status
  ) VALUES (
    v_order.id,
    p_payment_method_id,
    v_total,
    'USD',
    'pending'
  );

  RETURN jsonb_build_object(
    'order_id', v_order.id,
    'order_number', v_order.order_number,
    'total', v_total,
    'status', v_order.status,
    'reservation_expires_at', v_reservation_expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Grant execute to authenticated customers
GRANT EXECUTE ON FUNCTION public.create_order_checkout TO authenticated;
