-- ============================================================
-- A2K Store — Promotions, Coupons, Quantity Discounts
-- ============================================================

-- Promotions
CREATE TABLE public.promotions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  type            public.promotion_type NOT NULL,
  value           NUMERIC(12,2) NOT NULL CHECK (value > 0),
  -- Scope: NULL = applies to all, otherwise specific
  product_id      UUID REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id      UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Coupons
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
  -- Scope
  product_ids       UUID[] DEFAULT '{}',     -- specific products (empty = all)
  category_ids      UUID[] DEFAULT '{}',     -- specific categories (empty = all)
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Coupon usage log
CREATE TABLE public.coupon_usage (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id       UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  discount_amount NUMERIC(12,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quantity discounts (wholesale preparation)
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

-- Indexes
CREATE INDEX idx_promotions_product_id ON public.promotions(product_id);
CREATE INDEX idx_promotions_category_id ON public.promotions(category_id);
CREATE INDEX idx_promotions_is_active ON public.promotions(is_active) WHERE is_active = true;
CREATE INDEX idx_promotions_dates ON public.promotions(starts_at, ends_at);
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_is_active ON public.coupons(is_active) WHERE is_active = true;
CREATE INDEX idx_coupon_usage_coupon_id ON public.coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_order_id ON public.coupon_usage(order_id);
CREATE INDEX idx_coupon_usage_customer_id ON public.coupon_usage(customer_id);
CREATE INDEX idx_quantity_discounts_product_id ON public.quantity_discounts(product_id);
CREATE INDEX idx_quantity_discounts_variant_id ON public.quantity_discounts(variant_id);

-- Updated_at triggers
CREATE TRIGGER set_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_quantity_discounts_updated_at
  BEFORE UPDATE ON public.quantity_discounts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
