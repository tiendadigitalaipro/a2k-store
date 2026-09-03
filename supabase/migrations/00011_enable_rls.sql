-- ============================================================
-- A2K Store — Row Level Security (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_shipping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quantity_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper: check if user has a specific role
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_role(required_role public.user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = required_role AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper: check if user is admin (superadmin or admin)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('superadmin', 'admin')
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper: get customer_id for current user
CREATE OR REPLACE FUNCTION public.get_customer_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM public.customers
    WHERE profile_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES
-- ============================================================

-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Users can update their own profile (limited fields enforced in app)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Admins can update any profile
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- ============================================================
-- CUSTOMERS
-- ============================================================

-- Customers can read their own record
CREATE POLICY "customers_select_own" ON public.customers
  FOR SELECT USING (profile_id = auth.uid());

-- Admins can read all customers
CREATE POLICY "customers_select_admin" ON public.customers
  FOR SELECT USING (public.is_admin());

-- Customers can update their own record
CREATE POLICY "customers_update_own" ON public.customers
  FOR UPDATE USING (profile_id = auth.uid());

-- ============================================================
-- CUSTOMER ADDRESSES
-- ============================================================

-- Customers can manage their own addresses
CREATE POLICY "addresses_select_own" ON public.customer_addresses
  FOR SELECT USING (customer_id = public.get_customer_id());

CREATE POLICY "addresses_insert_own" ON public.customer_addresses
  FOR INSERT WITH CHECK (customer_id = public.get_customer_id());

CREATE POLICY "addresses_update_own" ON public.customer_addresses
  FOR UPDATE USING (customer_id = public.get_customer_id());

CREATE POLICY "addresses_delete_own" ON public.customer_addresses
  FOR DELETE USING (customer_id = public.get_customer_id());

-- Admins can read all addresses
CREATE POLICY "addresses_select_admin" ON public.customer_addresses
  FOR SELECT USING (public.is_admin());

-- ============================================================
-- CATALOG (public read, admin write)
-- ============================================================

-- Categories: public read
CREATE POLICY "categories_select_public" ON public.categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "categories_select_admin" ON public.categories
  FOR SELECT USING (public.is_admin());

CREATE POLICY "categories_insert_admin" ON public.categories
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "categories_update_admin" ON public.categories
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "categories_delete_admin" ON public.categories
  FOR DELETE USING (public.is_admin());

-- Subcategories: public read
CREATE POLICY "subcategories_select_public" ON public.subcategories
  FOR SELECT USING (is_active = true);

CREATE POLICY "subcategories_select_admin" ON public.subcategories
  FOR SELECT USING (public.is_admin());

CREATE POLICY "subcategories_insert_admin" ON public.subcategories
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "subcategories_update_admin" ON public.subcategories
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "subcategories_delete_admin" ON public.subcategories
  FOR DELETE USING (public.is_admin());

-- Brands: public read
CREATE POLICY "brands_select_public" ON public.brands
  FOR SELECT USING (is_active = true);

CREATE POLICY "brands_select_admin" ON public.brands
  FOR SELECT USING (public.is_admin());

CREATE POLICY "brands_insert_admin" ON public.brands
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "brands_update_admin" ON public.brands
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "brands_delete_admin" ON public.brands
  FOR DELETE USING (public.is_admin());

-- Products: public read active, admin full access
CREATE POLICY "products_select_public" ON public.products
  FOR SELECT USING (status = 'active');

CREATE POLICY "products_select_admin" ON public.products
  FOR SELECT USING (public.is_admin());

CREATE POLICY "products_insert_admin" ON public.products
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "products_update_admin" ON public.products
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "products_delete_admin" ON public.products
  FOR DELETE USING (public.is_admin());

-- Product variants: public read active, admin full access
CREATE POLICY "variants_select_public" ON public.product_variants
  FOR SELECT USING (is_active = true);

CREATE POLICY "variants_select_admin" ON public.product_variants
  FOR SELECT USING (public.is_admin());

CREATE POLICY "variants_insert_admin" ON public.product_variants
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "variants_update_admin" ON public.product_variants
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "variants_delete_admin" ON public.product_variants
  FOR DELETE USING (public.is_admin());

-- Product images: public read, admin write
CREATE POLICY "images_select_public" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "images_insert_admin" ON public.product_images
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "images_update_admin" ON public.product_images
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "images_delete_admin" ON public.product_images
  FOR DELETE USING (public.is_admin());

-- ============================================================
-- INVENTORY (admin only for movements, public read stock)
-- ============================================================

-- Inventory movements: admin only
CREATE POLICY "movements_select_admin" ON public.inventory_movements
  FOR SELECT USING (public.is_admin());

CREATE POLICY "movements_insert_admin" ON public.inventory_movements
  FOR INSERT WITH CHECK (public.is_admin());

-- Stock reservations: customers see their own, admins see all
CREATE POLICY "reservations_select_own" ON public.stock_reservations
  FOR SELECT USING (order_id IN (
    SELECT id FROM public.orders WHERE customer_id = public.get_customer_id()
  ));

CREATE POLICY "reservations_select_admin" ON public.stock_reservations
  FOR SELECT USING (public.is_admin());

CREATE POLICY "reservations_insert_admin" ON public.stock_reservations
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "reservations_update_admin" ON public.stock_reservations
  FOR UPDATE USING (public.is_admin());

-- ============================================================
-- ORDERS
-- ============================================================

-- Customers can read their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (customer_id = public.get_customer_id());

-- Admins can read all orders
CREATE POLICY "orders_select_admin" ON public.orders
  FOR SELECT USING (public.is_admin());

-- Customers can create orders for themselves
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (customer_id = public.get_customer_id());

-- Admins can update any order
CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- Order items: customers see their own, admins see all
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (order_id IN (
    SELECT id FROM public.orders WHERE customer_id = public.get_customer_id()
  ));

CREATE POLICY "order_items_select_admin" ON public.order_items
  FOR SELECT USING (public.is_admin());

CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (order_id IN (
    SELECT id FROM public.orders WHERE customer_id = public.get_customer_id()
  ));

-- Order status history: customers see their own, admins see all
CREATE POLICY "status_history_select_own" ON public.order_status_history
  FOR SELECT USING (order_id IN (
    SELECT id FROM public.orders WHERE customer_id = public.get_customer_id()
  ));

CREATE POLICY "status_history_select_admin" ON public.order_status_history
  FOR SELECT USING (public.is_admin());

CREATE POLICY "status_history_insert_admin" ON public.order_status_history
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================================
-- PAYMENTS
-- ============================================================

-- Payment methods: public read active, admin full access
CREATE POLICY "payment_methods_select_public" ON public.payment_methods
  FOR SELECT USING (is_active = true);

CREATE POLICY "payment_methods_select_admin" ON public.payment_methods
  FOR SELECT USING (public.is_admin());

CREATE POLICY "payment_methods_insert_admin" ON public.payment_methods
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "payment_methods_update_admin" ON public.payment_methods
  FOR UPDATE USING (public.is_admin());

-- Order payments: customers see their own, admins see all
CREATE POLICY "order_payments_select_own" ON public.order_payments
  FOR SELECT USING (order_id IN (
    SELECT id FROM public.orders WHERE customer_id = public.get_customer_id()
  ));

CREATE POLICY "order_payments_select_admin" ON public.order_payments
  FOR SELECT USING (public.is_admin());

CREATE POLICY "order_payments_insert_own" ON public.order_payments
  FOR INSERT WITH CHECK (order_id IN (
    SELECT id FROM public.orders WHERE customer_id = public.get_customer_id()
  ));

CREATE POLICY "order_payments_update_admin" ON public.order_payments
  FOR UPDATE USING (public.is_admin());

-- Payment receipts: customers see their own, admins see all
CREATE POLICY "receipts_select_own" ON public.payment_receipts
  FOR SELECT USING (payment_id IN (
    SELECT op.id FROM public.order_payments op
    JOIN public.orders o ON o.id = op.order_id
    WHERE o.customer_id = public.get_customer_id()
  ));

CREATE POLICY "receipts_select_admin" ON public.payment_receipts
  FOR SELECT USING (public.is_admin());

CREATE POLICY "receipts_insert_own" ON public.payment_receipts
  FOR INSERT WITH CHECK (payment_id IN (
    SELECT op.id FROM public.order_payments op
    JOIN public.orders o ON o.id = op.order_id
    WHERE o.customer_id = public.get_customer_id()
  ));

-- ============================================================
-- SHIPPING
-- ============================================================

-- Carriers: public read active, admin full access
CREATE POLICY "carriers_select_public" ON public.shipping_carriers
  FOR SELECT USING (is_active = true);

CREATE POLICY "carriers_select_admin" ON public.shipping_carriers
  FOR SELECT USING (public.is_admin());

CREATE POLICY "carriers_insert_admin" ON public.shipping_carriers
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "carriers_update_admin" ON public.shipping_carriers
  FOR UPDATE USING (public.is_admin());

-- Order shipping: customers see their own, admins see all
CREATE POLICY "order_shipping_select_own" ON public.order_shipping
  FOR SELECT USING (order_id IN (
    SELECT id FROM public.orders WHERE customer_id = public.get_customer_id()
  ));

CREATE POLICY "order_shipping_select_admin" ON public.order_shipping
  FOR SELECT USING (public.is_admin());

CREATE POLICY "order_shipping_insert_admin" ON public.order_shipping
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "order_shipping_update_admin" ON public.order_shipping
  FOR UPDATE USING (public.is_admin());

-- ============================================================
-- PROMOTIONS & COUPONS
-- ============================================================

-- Promotions: public read active, admin full access
CREATE POLICY "promotions_select_public" ON public.promotions
  FOR SELECT USING (is_active = true);

CREATE POLICY "promotions_select_admin" ON public.promotions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "promotions_insert_admin" ON public.promotions
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "promotions_update_admin" ON public.promotions
  FOR UPDATE USING (public.is_admin());

-- Coupons: admin only (customers validate via API, not direct read)
CREATE POLICY "coupons_select_admin" ON public.coupons
  FOR SELECT USING (public.is_admin());

CREATE POLICY "coupons_insert_admin" ON public.coupons
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "coupons_update_admin" ON public.coupons
  FOR UPDATE USING (public.is_admin());

-- Coupon usage: customers see their own, admins see all
CREATE POLICY "coupon_usage_select_own" ON public.coupon_usage
  FOR SELECT USING (customer_id = public.get_customer_id());

CREATE POLICY "coupon_usage_select_admin" ON public.coupon_usage
  FOR SELECT USING (public.is_admin());

CREATE POLICY "coupon_usage_insert_admin" ON public.coupon_usage
  FOR INSERT WITH CHECK (public.is_admin());

-- Quantity discounts: public read active, admin full access
CREATE POLICY "qty_discounts_select_public" ON public.quantity_discounts
  FOR SELECT USING (is_active = true);

CREATE POLICY "qty_discounts_select_admin" ON public.quantity_discounts
  FOR SELECT USING (public.is_admin());

CREATE POLICY "qty_discounts_insert_admin" ON public.quantity_discounts
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "qty_discounts_update_admin" ON public.quantity_discounts
  FOR UPDATE USING (public.is_admin());

-- ============================================================
-- REVIEWS & Q&A
-- ============================================================

-- Reviews: public read approved, customers can create for their orders
CREATE POLICY "reviews_select_public" ON public.reviews
  FOR SELECT USING (status = 'approved');

CREATE POLICY "reviews_select_admin" ON public.reviews
  FOR SELECT USING (public.is_admin());

CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (customer_id = public.get_customer_id());

CREATE POLICY "reviews_update_admin" ON public.reviews
  FOR UPDATE USING (public.is_admin());

-- Review photos: public read, admin write
CREATE POLICY "review_photos_select_public" ON public.review_photos
  FOR SELECT USING (true);

CREATE POLICY "review_photos_insert_admin" ON public.review_photos
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "review_photos_delete_admin" ON public.review_photos
  FOR DELETE USING (public.is_admin());

-- Product questions: public read visible, customers can ask
CREATE POLICY "questions_select_public" ON public.product_questions
  FOR SELECT USING (is_visible = true);

CREATE POLICY "questions_select_admin" ON public.product_questions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "questions_insert_own" ON public.product_questions
  FOR INSERT WITH CHECK (customer_id = public.get_customer_id());

CREATE POLICY "questions_update_admin" ON public.product_questions
  FOR UPDATE USING (public.is_admin());

-- ============================================================
-- WISHLIST
-- ============================================================

-- Customers manage their own wishlist
CREATE POLICY "wishlist_select_own" ON public.wishlists
  FOR SELECT USING (customer_id = public.get_customer_id());

CREATE POLICY "wishlist_insert_own" ON public.wishlists
  FOR INSERT WITH CHECK (customer_id = public.get_customer_id());

CREATE POLICY "wishlist_delete_own" ON public.wishlists
  FOR DELETE USING (customer_id = public.get_customer_id());

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

-- Users see their own notifications
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can read all notifications
CREATE POLICY "notifications_select_admin" ON public.notifications
  FOR SELECT USING (public.is_admin());

-- Notification events: admin only
CREATE POLICY "notification_events_select_admin" ON public.notification_events
  FOR SELECT USING (public.is_admin());

CREATE POLICY "notification_events_insert_admin" ON public.notification_events
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================================
-- BUSINESS SETTINGS (admin only)
-- ============================================================

CREATE POLICY "settings_select_admin" ON public.business_settings
  FOR SELECT USING (public.is_admin());

CREATE POLICY "settings_update_admin" ON public.business_settings
  FOR UPDATE USING (public.is_admin());

-- ============================================================
-- EXCHANGE RATES (public read, admin write)
-- ============================================================

CREATE POLICY "rates_select_public" ON public.exchange_rates
  FOR SELECT USING (true);

CREATE POLICY "rates_insert_admin" ON public.exchange_rates
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================================
-- AUDIT LOGS (admin read only, system insert)
-- ============================================================

CREATE POLICY "audit_select_admin" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "audit_insert_authenticated" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- ROLE PERMISSIONS (admin only)
-- ============================================================

CREATE POLICY "role_permissions_select_admin" ON public.role_permissions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "role_permissions_insert_admin" ON public.role_permissions
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "role_permissions_update_admin" ON public.role_permissions
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "role_permissions_delete_admin" ON public.role_permissions
  FOR DELETE USING (public.is_admin());
