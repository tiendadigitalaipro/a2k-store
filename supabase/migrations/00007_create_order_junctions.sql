-- ============================================================
-- A2K Store — Order junction tables (depend on orders)
-- ============================================================
-- These tables have FK references to orders and must be
-- created after orders (00006).

-- ============================================================
-- Order payments
-- ============================================================
CREATE TABLE public.order_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES public.payment_methods(id),
  amount            NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency          TEXT NOT NULL DEFAULT 'USD',
  exchange_rate     NUMERIC(12,4),
  amount_local      NUMERIC(14,2),
  status            public.payment_status NOT NULL DEFAULT 'pending',
  verified_by       UUID REFERENCES public.profiles(id),
  verified_at       TIMESTAMPTZ,
  rejection_reason  TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment receipts (comprobantes)
CREATE TABLE public.payment_receipts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id      UUID NOT NULL REFERENCES public.order_payments(id) ON DELETE CASCADE,
  file_url        TEXT NOT NULL,
  file_name       TEXT,
  file_type       TEXT,
  uploaded_by     UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_payments_order_id ON public.order_payments(order_id);
CREATE INDEX idx_order_payments_status ON public.order_payments(status);
CREATE INDEX idx_order_payments_payment_method_id ON public.order_payments(payment_method_id);
CREATE INDEX idx_payment_receipts_payment_id ON public.payment_receipts(payment_id);

CREATE TRIGGER set_order_payments_updated_at
  BEFORE UPDATE ON public.order_payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Order shipping
-- ============================================================
CREATE TABLE public.order_shipping (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  carrier_id      UUID REFERENCES public.shipping_carriers(id),
  tracking_number TEXT,
  tracking_url    TEXT,
  estimated_date  DATE,
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  cost            NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_shipping_order_id ON public.order_shipping(order_id);
CREATE INDEX idx_order_shipping_carrier_id ON public.order_shipping(carrier_id);

CREATE TRIGGER set_order_shipping_updated_at
  BEFORE UPDATE ON public.order_shipping
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Coupon usage log
-- ============================================================
CREATE TABLE public.coupon_usage (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id       UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  discount_amount NUMERIC(12,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_order_id ON public.coupon_usage(order_id);
CREATE INDEX idx_coupon_usage_customer_id ON public.coupon_usage(customer_id);
