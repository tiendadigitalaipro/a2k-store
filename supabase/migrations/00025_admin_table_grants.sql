-- ============================================================
-- A2K Store — Grants de tablas admin (corrección 2026-11-20)
-- ============================================================
--
-- Problema reportado: el panel admin falla con
--   "permission denied for table products"
-- al crear/editar productos.
--
-- Causa raíz:
--   00010 creó las políticas RLS admin (p. ej. products_insert_admin con
--   WITH CHECK (is_admin())), pero 00019 solo otorgó GRANT SELECT sobre las
--   tablas del catálogo al rol authenticated. Sin el GRANT a nivel tabla,
--   Postgres rechaza la operación antes de evaluar RLS.
--
-- Seguridad:
--   - Migración aditiva: solo GRANTs, sin tocar políticas ni datos.
--   - RLS sigue siendo la autorización real: cada operación exige
--     is_admin() (o la condición "own" correspondiente).
--   - Ningún GRANT da acceso nuevo a anon.
--
-- Cobertura: cada tabla que en 00010 tiene políticas *_admin recibe aquí
-- los privilegios de tabla equivalentes para authenticated.
-- ============================================================

BEGIN;

-- Catálogo (admin)
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subcategories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT INSERT, UPDATE ON public.quantity_discounts TO authenticated;

-- Inventario y reservas (admin)
GRANT SELECT, INSERT ON public.inventory_movements TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.stock_reservations TO authenticated;

-- Pedidos (admin)
GRANT UPDATE ON public.orders TO authenticated;
GRANT SELECT, INSERT ON public.order_status_history TO authenticated;
GRANT UPDATE ON public.order_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.order_shipping TO authenticated;

-- Configuración de tienda (admin)
GRANT INSERT, UPDATE ON public.payment_methods TO authenticated;
GRANT INSERT, UPDATE ON public.shipping_carriers TO authenticated;
GRANT INSERT, UPDATE ON public.promotions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.coupons TO authenticated;
GRANT SELECT, INSERT ON public.coupon_usage TO authenticated;
GRANT UPDATE ON public.business_settings TO authenticated;
GRANT INSERT ON public.exchange_rates TO authenticated;

-- Contenido y moderación (admin)
GRANT UPDATE ON public.reviews TO authenticated;
GRANT DELETE ON public.review_photos TO authenticated;
GRANT UPDATE ON public.product_questions TO authenticated;

-- Notificaciones y seguridad (admin)
GRANT SELECT, INSERT ON public.notification_events TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;

COMMIT;
