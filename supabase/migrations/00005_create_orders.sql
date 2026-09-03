-- ============================================================
-- A2K Store — Orders, Items, Status History
-- ============================================================

-- Order number sequence (per year)
CREATE TABLE public.order_sequences (
  year            INTEGER PRIMARY KEY,
  last_number     INTEGER NOT NULL DEFAULT 0
);

-- Orders
CREATE TABLE public.orders (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number      TEXT NOT NULL UNIQUE,  -- A2K-2026-000001
  customer_id       UUID NOT NULL REFERENCES public.customers(id),
  address_id        UUID REFERENCES public.customer_addresses(id),

  -- Delivery
  delivery_method   public.delivery_method NOT NULL DEFAULT 'shipping',
  pickup_confirmed  BOOLEAN NOT NULL DEFAULT false,
  pickup_date       DATE,
  pickup_time       TIME,
  pickup_notes      TEXT,

  -- Status
  status            public.order_status NOT NULL DEFAULT 'pending_payment',

  -- Financial snapshot (frozen at order creation)
  subtotal          NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  discount_total    NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_total >= 0),
  shipping_cost     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  total             NUMERIC(12,2) NOT NULL CHECK (total >= 0),
  currency          TEXT NOT NULL DEFAULT 'USD',
  exchange_rate     NUMERIC(12,4),  -- A2K rate at time of order
  total_local       NUMERIC(14,2),  -- total in VES

  -- Payment
  payment_method_id UUID REFERENCES public.payment_methods(id),

  -- Promotions applied
  coupon_id         UUID REFERENCES public.coupons(id),
  promotion_id      UUID REFERENCES public.promotions(id),

  -- Notes
  customer_notes    TEXT,
  admin_notes       TEXT,

  -- Timestamps
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at           TIMESTAMPTZ,
  shipped_at        TIMESTAMPTZ,
  delivered_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,

  -- Reservation
  reservation_expires_at TIMESTAMPTZ
);

-- Order items (snapshot — never recalculated)
CREATE TABLE public.order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL,  -- no FK: preserves snapshot
  variant_id      UUID,           -- no FK: preserves snapshot
  product_name    TEXT NOT NULL,
  product_sku     TEXT NOT NULL,
  variant_name    TEXT,
  price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  subtotal        NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  discount        NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order status history
CREATE TABLE public.order_status_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status      public.order_status,
  new_status      public.order_status NOT NULL,
  changed_by      UUID REFERENCES public.profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_created_at ON public.orders(created_at);
CREATE INDEX idx_orders_payment_method_id ON public.orders(payment_method_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history(order_id);

-- Updated_at trigger
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Generate order number: A2K-YYYY-NNNNNN
-- ============================================================

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  v_year INTEGER;
  v_next INTEGER;
  v_number TEXT;
BEGIN
  v_year := EXTRACT(YEAR FROM now());

  INSERT INTO public.order_sequences (year, last_number)
  VALUES (v_year, 1)
  ON CONFLICT (year) DO UPDATE
  SET last_number = public.order_sequences.last_number + 1
  RETURNING last_number INTO v_next;

  v_number := 'A2K-' || v_year || '-' || LPAD(v_next::TEXT, 6, '0');
  RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- Auto-generate order number on insert
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := public.generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_order_number();

-- ============================================================
-- Auto-create status history on status change
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());

    -- Set timestamps based on status
    CASE NEW.status
      WHEN 'payment_approved' THEN NEW.paid_at := COALESCE(NEW.paid_at, now());
      WHEN 'shipped' THEN NEW.shipped_at := COALESCE(NEW.shipped_at, now());
      WHEN 'delivered' THEN NEW.delivered_at := COALESCE(NEW.delivered_at, now());
      WHEN 'cancelled', 'cancelled_expired' THEN NEW.cancelled_at := COALESCE(NEW.cancelled_at, now());
      ELSE NULL;
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_log_status_change
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_change();

-- Add FK from stock_reservations to orders now that orders exists
ALTER TABLE public.stock_reservations
  ADD CONSTRAINT fk_stock_reservations_order_id
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;
