-- ============================================================
-- A2K Store — Reviews, Q&A, Wishlist
-- ============================================================

-- Reviews (verified buyers only)
CREATE TABLE public.reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  order_id        UUID NOT NULL REFERENCES public.orders(id),  -- verified purchase
  rating          SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment         TEXT,
  status          public.review_status NOT NULL DEFAULT 'pending',
  moderated_by    UUID REFERENCES public.profiles(id),
  moderated_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(product_id, customer_id, order_id)  -- one review per product per order
);

-- Review photos
CREATE TABLE public.review_photos (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id       UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  alt_text        TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product questions
CREATE TABLE public.product_questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  question        TEXT NOT NULL,
  answer          TEXT,
  answered_by     UUID REFERENCES public.profiles(id),
  answered_at     TIMESTAMPTZ,
  is_visible      BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wishlist
CREATE TABLE public.wishlists (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(customer_id, product_id)
);

-- Indexes
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX idx_reviews_status ON public.reviews(status);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);
CREATE INDEX idx_review_photos_review_id ON public.review_photos(review_id);
CREATE INDEX idx_product_questions_product_id ON public.product_questions(product_id);
CREATE INDEX idx_product_questions_customer_id ON public.product_questions(customer_id);
CREATE INDEX idx_product_questions_is_visible ON public.product_questions(is_visible) WHERE is_visible = true;
CREATE INDEX idx_wishlists_customer_id ON public.wishlists(customer_id);
CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);

-- Updated_at triggers
CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_product_questions_updated_at
  BEFORE UPDATE ON public.product_questions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Auto-calculate product average rating
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products p
  SET
    -- These are computed columns; we store them for query performance
    -- Actual calculation happens via trigger
    updated_at = now()
  WHERE p.id = COALESCE(NEW.product_id, OLD.product_id);

  -- We'll store rating/review_count in a separate lightweight update
  -- to avoid heavy computation on every review change
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- Note: Product rating will be computed on-demand or cached via application logic
-- to avoid expensive triggers on high-traffic review updates.
-- The reviews table provides all data needed for aggregation.
