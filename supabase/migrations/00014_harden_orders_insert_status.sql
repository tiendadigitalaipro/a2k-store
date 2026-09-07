-- ============================================================
-- A2K Store — Harden orders INSERT status (Phase 3)
-- ============================================================
-- Additive migration. Do not edit previously applied migrations.
--
-- Ensures that non-admin authenticated clients can only create orders
-- with status 'pending_payment'. This closes a privilege escalation path
-- where a customer could insert an order already marked as delivered,
-- shipped, payment_approved, preparing, cancelled, etc.
--
-- Rules:
--   - service_role: trusted, may set any valid initial status.
--   - No JWT role claim (auth triggers, direct backend ops): trusted.
--   - authenticated + admin (superadmin/admin): may set initial status.
--   - authenticated + non-admin: forced to 'pending_payment'.
--   - anon: forced to 'pending_payment' (already blocked by RLS, but
--     hardened here defensively).
-- ============================================================

CREATE OR REPLACE FUNCTION public.force_pending_payment_on_customer_order_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_jwt_role TEXT;
BEGIN
  -- Extract the Supabase JWT role claim. Values are 'anon',
  -- 'authenticated' or 'service_role'. If the setting is missing
  -- (e.g., direct backend/trigger context), treat as trusted.
  BEGIN
    v_jwt_role := current_setting('request.jwt.claims', true)::jsonb ->> 'role';
  EXCEPTION WHEN OTHERS THEN
    v_jwt_role := NULL;
  END;

  -- Trust service_role and any context without a JWT role claim.
  IF v_jwt_role = 'service_role' OR v_jwt_role IS NULL THEN
    RETURN NEW;
  END IF;

  -- For authenticated (and any other JWT-identified non-admin) callers,
  -- force the order to start at pending_payment.
  IF NOT public.is_admin() THEN
    NEW.status := 'pending_payment'::public.order_status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_force_pending_payment_on_order_insert ON public.orders;

CREATE TRIGGER trg_force_pending_payment_on_order_insert
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.force_pending_payment_on_customer_order_insert();
