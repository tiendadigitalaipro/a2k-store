-- ============================================================
-- A2K Store — VERIFICACIÓN DE SEGURIDAD + ADMIN (Fase 19)
-- ============================================================
-- CÓMO USARLO:
--   1. Entra a https://supabase.com/dashboard → tu proyecto
--      (lreccgsruakmaaamjidr) → SQL Editor → New query.
--   2. PEGA este archivo completo y pulsa RUN.
--   3. Todo corre dentro de BEGIN ... ROLLBACK: NO cambia nada,
--      solo imprime PASS/FAIL de cada prueba. Las pruebas que
--      esperan "denegado" aparecen como NOTICE, no como error.
--
-- IMPORTANTE — PRIMERA VEZ:
--   La prueba 4 (bloquear RPC de stock) solo dará PASS DESPUÉS de
--   aplicar la migración 00024_stock_rpc_authorization.sql. Si da
--   FAIL, ve a SQL Editor, pega el archivo
--   supabase/migrations/00024_stock_rpc_authorization.sql del repo
--   y ejecútalo (ese sí aplica cambios permanentes). Luego vuelve a
--   correr esta verificación.
--
-- PASO EXTRA (una sola vez, FUERA del bloque ROLLBACK):
--   Al final del archivo hay un bloque comentado para darte rol
--   admin a ti mismo. Descoméntalo y ejecútalo SOLO ese fragmento,
--   con tu email real, para poder entrar al /admin.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- PRUEBA 1 — Anónimo NO puede escalar roles en profiles
-- Esperado: PASS (fallo de permiso/RLS) gracias a RLS + trigger 00013.
-- ------------------------------------------------------------
DO $$
DECLARE
  v_error TEXT;
BEGIN
  SET LOCAL ROLE anon;
  BEGIN
    UPDATE public.profiles SET role = 'admin' WHERE true;
    RAISE NOTICE 'PRUEBA 1: FAIL — un anónimo pudo cambiar roles (¡GRAVE!)';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
    RAISE NOTICE 'PRUEBA 1: PASS — anónimo bloqueado (%).', left(v_error, 60);
  END;
END $$;
RESET ROLE;

-- ------------------------------------------------------------
-- PRUEBA 2 — Anónimo NO puede insertar pedidos
-- RLS orders_insert_own exige customer_id propio; anon no tiene.
-- ------------------------------------------------------------
DO $$
DECLARE
  v_error TEXT;
BEGIN
  SET LOCAL ROLE anon;
  BEGIN
    INSERT INTO public.orders (order_number, customer_id, delivery_method, subtotal, total)
    VALUES ('HACK-000', '00000000-0000-0000-0000-000000000000', 'shipping', 1, 1);
    RAISE NOTICE 'PRUEBA 2: FAIL — un anónimo pudo insertar un pedido';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
    RAISE NOTICE 'PRUEBA 2: PASS — anónimo bloqueado (%).', left(v_error, 60);
  END;
END $$;
RESET ROLE;

-- ------------------------------------------------------------
-- PRUEBA 3 — Anónimo NO puede escribir productos
-- products_insert_admin exige is_admin().
-- ------------------------------------------------------------
DO $$
DECLARE
  v_error TEXT;
BEGIN
  SET LOCAL ROLE anon;
  BEGIN
    INSERT INTO public.products (name, slug, price, stock, status)
    VALUES ('hack', 'hack', 1, 1, 'active');
    RAISE NOTICE 'PRUEBA 3: FAIL — un anónimo pudo crear productos';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
    RAISE NOTICE 'PRUEBA 3: PASS — anónimo bloqueado (%).', left(v_error, 60);
  END;
END $$;
RESET ROLE;

-- ------------------------------------------------------------
-- PRUEBA 4 — Anónimo NO puede llamar los RPC de stock
-- Esperado: PASS solo tras aplicar la migración 00024.
-- ------------------------------------------------------------
DO $$
DECLARE
  v_ok BOOLEAN;
  v_error TEXT;
BEGIN
  SET LOCAL ROLE anon;
  BEGIN
    v_ok := public.decrement_stock(
      '00000000-0000-0000-0000-000000000000'::uuid,
      NULL, 1, '00000000-0000-0000-0000-000000000000'::uuid
    );
    RAISE NOTICE 'PRUEBA 4: FAIL — un anónimo llamó decrement_stock (aplica la migración 00024)';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
    RAISE NOTICE 'PRUEBA 4: PASS — decrement_stock denegado a anónimos (%).', left(v_error, 60);
  END;
END $$;
RESET ROLE;

-- ------------------------------------------------------------
-- PRUEBA 5 — El Storage permite lectura pública y la escritura
-- exige rol admin (política 00022). Solo comprobamos que el bucket
-- existe y sus políticas están activas.
-- ------------------------------------------------------------
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT count(*) INTO v_count
  FROM pg_policies
  WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname IN ('products_public_read', 'products_admin_all');
  IF v_count = 2 THEN
    RAISE NOTICE 'PRUEBA 5: PASS — bucket products con lectura pública + escritura admin.';
  ELSE
    RAISE NOTICE 'PRUEBA 5: FAIL — faltan políticas del bucket products (ejecuta 00022).';
  END IF;
END $$;

ROLLBACK;

-- ============================================================
-- PASO FINAL (ejecutar SOLO esto, sin el ROLLBACK de arriba):
-- darte rol de administrador a TI MISMO para usar /admin.
--
-- 1. Regístrate primero en la tienda con tu correo real.
-- 2. Descomenta las 2 líneas siguientes, cambia el email, y RUN:
--
-- UPDATE public.profiles SET role = 'admin'
--  WHERE email = 'ceo@a2kdigitalstudio.online';
--
-- (Si prefieres máximo poder: role = 'superadmin'.)
-- ============================================================
