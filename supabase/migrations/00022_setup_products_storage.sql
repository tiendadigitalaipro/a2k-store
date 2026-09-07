-- ============================================================
-- A2K Store — Setup products storage bucket (Phase 5)
-- ============================================================
--
-- Context:
--   Storage is required to host the real product images mapped in
--   PRODUCT_MEDIA_MAPPING.md. This migration creates the public
--   `products` bucket and its access policies.
--
-- This migration:
--   1. Creates the `products` bucket (public, 10 MB limit, images only).
--   2. Creates RLS policies for public read and admin/service write.
--
-- Security:
--   - Additive migration.
--   - Does not modify 00001–00021.
--   - No objects are uploaded.
--   - Video MIME types are intentionally excluded; videos will be
--     added in a later phase once frontend playback is supported.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Create the products bucket
-- ------------------------------------------------------------
INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) VALUES (
  'products',
  'products',
  true,
  10485760, -- 10 MB
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  updated_at = now();

-- ------------------------------------------------------------
-- 2. Public read access
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "products_public_read" ON storage.objects;

CREATE POLICY "products_public_read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'products');

-- ------------------------------------------------------------
-- 3. Admin write access (authenticated users with admin role)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "products_admin_all" ON storage.objects;

CREATE POLICY "products_admin_all"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'products' AND public.is_admin())
  WITH CHECK (bucket_id = 'products' AND public.is_admin());

-- ------------------------------------------------------------
-- 4. Service role write access (scripts, Edge Functions)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "products_service_all" ON storage.objects;

CREATE POLICY "products_service_all"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'products')
  WITH CHECK (bucket_id = 'products');
