-- ============================================================
-- A2K Store — Seed real catalog categories (Phase 5)
-- ============================================================
--
-- Context:
--   The storefront is moving from demo categories (Tecnología,
--   Audio, Wearables, Fotografía, Accesorios, Gaming) to the 7
--   definitive real-product categories.
--
-- This migration:
--   1. Inserts the 7 definitive categories idempotently.
--   2. Leaves the 6 demo categories untouched.
--   3. Uses stable slugs that match PRODUCT_MEDIA_MAPPING.md and
--      the planned Supabase Storage folder structure.
--
-- Security:
--   - Additive migration.
--   - Does not modify 00001–00020.
--   - Does not delete or alter existing categories/products.
-- ============================================================

INSERT INTO public.categories (
  name,
  slug,
  description,
  image_url,
  sort_order,
  is_active,
  seo_title,
  seo_description
) VALUES
  ('Calzados', 'calzados', 'Zapatillas y calzado deportivo para toda la familia.', NULL, 1, true, NULL, NULL),
  ('Cocina', 'cocina', 'Utensilios, herramientas y accesorios prácticos para tu cocina.', NULL, 2, true, NULL, NULL),
  ('Hogar', 'hogar', 'Productos prácticos para el hogar, la limpieza y el día a día.', NULL, 3, true, NULL, NULL),
  ('Repuestos y Accesorios', 'repuestos-y-accesorios', 'Repuestos, accesorios y herramientas de apoyo.', NULL, 4, true, NULL, NULL),
  ('Ropa para Niños', 'ropa-para-ninos', 'Ropa cómoda, divertida y resistente para los más pequeños.', NULL, 5, true, NULL, NULL),
  ('Ropa Deportiva para Caballeros', 'ropa-deportiva-caballeros', 'Ropa deportiva y cómoda diseñada para caballeros.', NULL, 6, true, NULL, NULL),
  ('Electrónica', 'electronica', 'Smartwatches, audífonos, micrófonos y accesorios tecnológicos.', NULL, 7, true, NULL, NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = COALESCE(EXCLUDED.image_url, public.categories.image_url),
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  updated_at = now();
