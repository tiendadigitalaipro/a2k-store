-- ============================================================
-- A2K Store — Shipping Carriers & Tracking
-- ============================================================

-- Shipping carriers (configurable from admin)
CREATE TABLE public.shipping_carriers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  website_url     TEXT,
  tracking_url    TEXT,  -- template: https://carrier.com/track/{tracking_number}
  is_active       BOOLEAN NOT NULL DEFAULT true,
  cost            NUMERIC(12,2) NOT NULL DEFAULT 0,  -- internal cost
  notes           TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Shipping info per order
CREATE TABLE public.order_shipping (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  carrier_id      UUID REFERENCES public.shipping_carriers(id),
  tracking_number TEXT,
  tracking_url    TEXT,
  estimated_date  DATE,
  shipped_at      TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ,
  cost            NUMERIC(12,2) NOT NULL DEFAULT 0,  -- internal cost
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_shipping_carriers_slug ON public.shipping_carriers(slug);
CREATE INDEX idx_shipping_carriers_is_active ON public.shipping_carriers(is_active) WHERE is_active = true;
CREATE INDEX idx_order_shipping_order_id ON public.order_shipping(order_id);
CREATE INDEX idx_order_shipping_carrier_id ON public.order_shipping(carrier_id);

-- Updated_at triggers
CREATE TRIGGER set_shipping_carriers_updated_at
  BEFORE UPDATE ON public.shipping_carriers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_order_shipping_updated_at
  BEFORE UPDATE ON public.order_shipping
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
