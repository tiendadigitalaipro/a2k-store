-- ============================================================
-- A2K Store — Catalog: Categories, Brands, Products, Variants
-- ============================================================

-- Categories
CREATE TABLE public.categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  image_url       TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  seo_title       TEXT,
  seo_description TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subcategories
CREATE TABLE public.subcategories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  image_url       TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  seo_title       TEXT,
  seo_description TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Brands
CREATE TABLE public.brands (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  logo_url        TEXT,
  banner_url      TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  seo_title       TEXT,
  seo_description TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE public.products (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  sku               TEXT NOT NULL UNIQUE,
  description       TEXT,
  short_description TEXT,
  category_id       UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  subcategory_id    UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
  brand_id          UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  status            public.product_status NOT NULL DEFAULT 'active',
  price             NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  compare_at_price  NUMERIC(12,2) CHECK (compare_at_price >= 0),
  cost              NUMERIC(12,2) CHECK (cost >= 0),  -- internal cost
  currency          TEXT NOT NULL DEFAULT 'USD',
  stock             INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_reserved    INTEGER NOT NULL DEFAULT 0 CHECK (stock_reserved >= 0),
  stock_minimum     INTEGER NOT NULL DEFAULT 0 CHECK (stock_minimum >= 0),
  max_per_order     INTEGER CHECK (max_per_order > 0),
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  is_new            BOOLEAN NOT NULL DEFAULT true,
  tags              TEXT[] DEFAULT '{}',
  seo_title         TEXT,
  seo_description   TEXT,
  weight            NUMERIC(8,2),  -- for shipping calc
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product variants
CREATE TABLE public.product_variants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  sku             TEXT NOT NULL UNIQUE,
  attributes      JSONB NOT NULL DEFAULT '{}',  -- { color: "Red", capacity: "128GB" }
  price           NUMERIC(12,2) CHECK (price >= 0),  -- NULL = use product price
  compare_at_price NUMERIC(12,2) CHECK (compare_at_price >= 0),
  cost            NUMERIC(12,2) CHECK (cost >= 0),
  stock           INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_reserved  INTEGER NOT NULL DEFAULT 0 CHECK (stock_reserved >= 0),
  stock_minimum   INTEGER NOT NULL DEFAULT 0 CHECK (stock_minimum >= 0),
  max_per_order   INTEGER CHECK (max_per_order > 0),
  image_url       TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Product images
CREATE TABLE public.product_images (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id      UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  url             TEXT NOT NULL,
  alt_text        TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_subcategories_category_id ON public.subcategories(category_id);
CREATE INDEX idx_subcategories_slug ON public.subcategories(slug);
CREATE INDEX idx_brands_slug ON public.brands(slug);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_subcategory_id ON public.products(subcategory_id);
CREATE INDEX idx_products_brand_id ON public.products(brand_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_is_featured ON public.products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_is_new ON public.products(is_new) WHERE is_new = true;
CREATE INDEX idx_products_tags ON public.products USING GIN(tags);
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX idx_product_images_variant_id ON public.product_images(variant_id);

-- Updated_at triggers
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_subcategories_updated_at
  BEFORE UPDATE ON public.subcategories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
