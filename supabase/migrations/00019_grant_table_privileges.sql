-- ============================================================
-- A2K Store — Grant table privileges (Phase 4.5)
-- ============================================================
--
-- Context:
--   00010_enable_rls.sql enabled Row Level Security and created
--   policies, but never granted table-level privileges to the
--   Supabase roles (anon, authenticated, service_role). Without
--   these grants, every REST/PostgREST query returns
--   "permission denied for table ..." even when a matching RLS
--   policy exists.
--
-- Security model:
--   - RLS policies remain the actual authorization layer.
--   - These GRANTs only give each role the *ability* to attempt
--     the operations already allowed by RLS.
--   - service_role is the trusted backend role; it receives full
--     table access because Phase-3 triggers/RPCs already treat it
--     as privileged.
--
-- Rules:
--   - Additive migration.
--   - Does not modify 00001–00018.
--   - No GRANT weakens RLS for anon/authenticated.
-- ============================================================

-- Allow roles to reference objects in the public schema.
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- ============================================================
-- anon: public catalog read-only
-- ============================================================
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.subcategories TO anon;
GRANT SELECT ON public.brands TO anon;
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT ON public.payment_methods TO anon;
GRANT SELECT ON public.shipping_carriers TO anon;
GRANT SELECT ON public.promotions TO anon;
GRANT SELECT ON public.quantity_discounts TO anon;
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT ON public.review_photos TO anon;
GRANT SELECT ON public.product_questions TO anon;
GRANT SELECT ON public.exchange_rates TO anon;

-- ============================================================
-- authenticated: catalog read + own-data management
-- ============================================================

-- Catalog (same visibility as anon, but while logged in).
GRANT SELECT ON public.categories TO authenticated;
GRANT SELECT ON public.subcategories TO authenticated;
GRANT SELECT ON public.brands TO authenticated;
GRANT SELECT ON public.products TO authenticated;
GRANT SELECT ON public.product_variants TO authenticated;
GRANT SELECT ON public.product_images TO authenticated;
GRANT SELECT ON public.payment_methods TO authenticated;
GRANT SELECT ON public.shipping_carriers TO authenticated;
GRANT SELECT ON public.promotions TO authenticated;
GRANT SELECT ON public.quantity_discounts TO authenticated;
GRANT SELECT ON public.reviews TO authenticated;
GRANT SELECT ON public.review_photos TO authenticated;
GRANT SELECT ON public.product_questions TO authenticated;
GRANT SELECT ON public.exchange_rates TO authenticated;

-- Account/profile.
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, UPDATE ON public.customers TO authenticated;

-- Addresses.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_addresses TO authenticated;

-- Orders and related items (SELECT for account/history; INSERT aligns
-- with RLS policies that restrict to the customer's own records).
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT SELECT ON public.order_status_history TO authenticated;
GRANT SELECT, INSERT ON public.order_payments TO authenticated;
GRANT SELECT, INSERT ON public.payment_receipts TO authenticated;
GRANT SELECT ON public.stock_reservations TO authenticated;
GRANT SELECT ON public.order_shipping TO authenticated;

-- Wishlist, reviews, Q&A.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wishlists TO authenticated;
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT SELECT, INSERT ON public.review_photos TO authenticated;
GRANT SELECT, INSERT ON public.product_questions TO authenticated;

-- Notifications and audit.
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT INSERT ON public.audit_logs TO authenticated;

-- ============================================================
-- service_role: trusted backend role
-- ============================================================
-- Full table access for Edge Functions, admin scripts and any
-- backend context that identifies as service_role. RLS is still
-- active, but existing SECURITY DEFINER RPCs/triggers already
-- bypass RLS by running as the function owner when needed.
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
