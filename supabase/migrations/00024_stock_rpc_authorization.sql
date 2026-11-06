-- ============================================================
-- A2K Store — Stock RPC authorization (Fase 19 / Seguridad)
-- ============================================================
--
-- Contexto:
--   La auditoría del 05/09 (commit 36bfe71) endureció perfiles y
--   órdenes (00013/00014/00016), pero los RPC de stock quedaron sin
--   capa de autorización final:
--     - public.decrement_stock(...)          SECURITY DEFINER
--     - public.create_stock_reservation(...) SECURITY DEFINER
--   En PostgreSQL toda función recibe EXECUTE para PUBLIC al crearse,
--   y ninguna migración lo había revocado: cualquier visitante anónimo
--   podía llamarlos vía PostgREST (/rest/v1/rpc/...) y manipular
--   existencias o reservas directamente.
--
--   El flujo de compra real (public.create_order_checkout, 00017) usa
--   create_stock_reservation INTERNAMENTE como owner (SECURITY
--   DEFINER), por lo que revocar el EXECUTE de los roles cliente NO
--   rompe el checkout. Los scripts internos usan service_role.
--
-- Esta migración:
--   1. Revoca EXECUTE de PUBLIC, anon y authenticated en los tres RPC
--      de stock (expire_overdue_reservations ya tenía REVOKE de
--      authenticated en 00013, pero seguía expuesto a anon).
--   2. Otorga EXECUTE solo a service_role (backend confiable).
--
-- Seguridad:
--   - Migración aditiva: no modifica 00001–00023.
--   - Sin datos. Reversible re-grantando EXECUTE.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Cerrar el acceso cliente a los RPC de stock
-- ------------------------------------------------------------

REVOKE EXECUTE ON FUNCTION public.decrement_stock(UUID, UUID, INTEGER, UUID, UUID)
  FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.create_stock_reservation(UUID, UUID, UUID, INTEGER, TIMESTAMPTZ)
  FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.expire_overdue_reservations()
  FROM PUBLIC, anon, authenticated;

-- ------------------------------------------------------------
-- 2. Acceso explícito solo para el backend confiable
-- ------------------------------------------------------------

GRANT EXECUTE ON FUNCTION public.decrement_stock(UUID, UUID, INTEGER, UUID, UUID)
  TO service_role;

GRANT EXECUTE ON FUNCTION public.create_stock_reservation(UUID, UUID, UUID, INTEGER, TIMESTAMPTZ)
  TO service_role;

GRANT EXECUTE ON FUNCTION public.expire_overdue_reservations()
  TO service_role;
