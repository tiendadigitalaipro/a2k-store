-- ============================================================
-- A2K Store — Base tables (no FK to orders)
-- ============================================================
-- These tables must exist BEFORE orders because orders
-- references them via foreign keys.

-- ============================================================
-- Payment methods (configurable from admin)
-- ============================================================
CREATE TABLE public.payment_methods (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  type                  public.payment_method_type NOT NULL DEFAULT 'manual',
  currency              TEXT NOT NULL DEFAULT 'USD',
  is_active             BOOLEAN NOT NULL DEFAULT true,
  instructions          TEXT,
  payment_data          JSONB,
  payment_link          TEXT,
  requires_receipt      BOOLEAN NOT NULL DEFAULT true,
  requires_verification BOOLEAN NOT NULL DEFAULT true,
  sort_order            INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_methods_is_active ON public.payment_methods(is_active) WHERE is_active = true;

CREATE TRIGGER set_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Shipping carriers
-- ============================================================
CREATE TABLE public.shipping_carriers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  website_url     TEXT,
  tracking_url    TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  cost            NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes           TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipping_carriers_slug ON public.shipping_carriers(slug);
CREATE INDEX idx_shipping_carriers_is_active ON public.shipping_carriers(is_active) WHERE is_active = true;

CREATE TRIGGER set_shipping_carriers_updated_at
  BEFORE UPDATE ON public.shipping_carriers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Promotions
-- ============================================================
CREATE TABLE public.promotions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  type            public.promotion_type NOT NULL,
  value           NUMERIC(12,2) NOT NULL CHECK (value > 0),
  product_id      UUID REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id      UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_promotions_product_id ON public.promotions(product_id);
CREATE INDEX idx_promotions_category_id ON public.promotions(category_id);
CREATE INDEX idx_promotions_is_active ON public.promotions(is_active) WHERE is_active = true;
CREATE INDEX idx_promotions_dates ON public.promotions(starts_at, ends_at);

CREATE TRIGGER set_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Coupons
-- ============================================================
CREATE TABLE public.coupons (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  description       TEXT,
  type              public.coupon_type NOT NULL,
  value             NUMERIC(12,2) NOT NULL CHECK (value > 0),
  min_purchase      NUMERIC(12,2) CHECK (min_purchase >= 0),
  max_uses_total    INTEGER CHECK (max_uses_total > 0),
  max_uses_per_customer INTEGER CHECK (max_uses_per_customer > 0),
  current_uses      INTEGER NOT NULL DEFAULT 0,
  starts_at         TIMESTAMPTZ,
  ends_at           TIMESTAMPTZ,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  product_ids       UUID[] DEFAULT '{}',
  category_ids      UUID[] DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_is_active ON public.coupons(is_active) WHERE is_active = true;

CREATE TRIGGER set_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Quantity discounts (wholesale preparation)
-- ============================================================
CREATE TABLE public.quantity_discounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id      UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  min_quantity    INTEGER NOT NULL CHECK (min_quantity > 0),
  discount_type   public.promotion_type NOT NULL,
  discount_value  NUMERIC(12,2) NOT NULL CHECK (discount_value > 0),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (product_id IS NOT NULL OR variant_id IS NOT NULL)
);

CREATE INDEX idx_quantity_discounts_product_id ON public.quantity_discounts(product_id);
CREATE INDEX idx_quantity_discounts_variant_id ON public.quantity_discounts(variant_id);

CREATE TRIGGER set_quantity_discounts_updated_at
  BEFORE UPDATE ON public.quantity_discounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
