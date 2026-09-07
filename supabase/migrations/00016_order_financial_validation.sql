-- ============================================================
-- A2K Store — Order financial validation (Phase 4 fix)
-- ============================================================
-- Additive migration. Do not edit previously applied migrations.
--
-- Ensures that non-admin authenticated clients cannot manipulate
-- financial fields when creating orders. Admins, service_role and
-- backend/trigger contexts are exempt so existing admin workflows
-- keep working.
--
-- Rule enforced:
--   total = subtotal - discount_total + shipping_cost
--   all financial values >= 0
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_order_financials()
RETURNS TRIGGER AS $$
DECLARE
  v_jwt_role TEXT;
  v_expected_total NUMERIC(12,2);
BEGIN
  -- Extract Supabase JWT role claim. Missing claim means trusted
  -- backend/trigger/service context.
  BEGIN
    v_jwt_role := current_setting('request.jwt.claims', true)::jsonb ->> 'role';
  EXCEPTION WHEN OTHERS THEN
    v_jwt_role := NULL;
  END;

  -- Trust service_role, backend contexts and admins.
  IF v_jwt_role = 'service_role' OR v_jwt_role IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Non-negative checks (defense in depth; table already has CHECK >= 0)
  IF NEW.subtotal < 0 OR NEW.discount_total < 0 OR NEW.shipping_cost < 0 OR NEW.total < 0 THEN
    RAISE EXCEPTION 'Financial values cannot be negative';
  END IF;

  -- Core consistency check
  v_expected_total := NEW.subtotal - NEW.discount_total + NEW.shipping_cost;
  IF NEW.total <> v_expected_total THEN
    RAISE EXCEPTION 'Order total mismatch: expected %, got %', v_expected_total, NEW.total;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_validate_order_financials ON public.orders;

CREATE TRIGGER trg_validate_order_financials
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.validate_order_financials();
