# A2K Store — Security Audit Checkpoint

Date: 2026-09-05
Status: OPEN — Fase 3 NOT approved

## Confirmed findings from remote `main`

### Critical: profile privilege escalation
`supabase/migrations/00010_enable_rls.sql` defines `profiles_update_own` as `FOR UPDATE USING (id = auth.uid())`. The comment says protected fields are enforced in the app. RLS does not provide per-column immutability here, so a malicious authenticated client could attempt to update protected fields.

Protected fields requiring database-level enforcement include:
- role
- is_active
- email_verified
- two_factor_enabled

### Critical: stock RPC authorization
`supabase/migrations/00011_add_stock_rpc_functions.sql` grants `EXECUTE` on `decrement_stock` and `create_stock_reservation` to `authenticated`. These are `SECURITY DEFINER` functions. Their arguments include product/variant/order IDs and quantities, but the function body does not establish that the caller owns the order or is authorized for the requested stock operation.

`decrement_stock` permanently reduces stock and inserts an inventory movement. `create_stock_reservation` inserts reservations under definer privileges. These functions require a dedicated authorization review before checkout is built.

### High: customer creation flow mismatch
Remote `00012_auth_triggers.sql` creates a profile on signup but does not create a customer. Remote `src/context/AuthContext.tsx` then attempts a direct `customers` INSERT from the browser. This is fragile and conflicts with the intended atomic trigger-based signup flow.

### High: customer UPDATE protection
`customers_update_own` permits a customer to update the entire customer row. At minimum, `is_wholesale` must not be client-writable. Any customer-editable fields should be explicitly controlled.

### Functional gap: password reset target
`resetPassword()` redirects to `/reset-password`, while the router currently exposes `/recuperar-password` and no `/reset-password` route was found in the remote router. The recovery flow therefore requires correction before checkpoint approval.

## Rules
- Do not modify already-applied migrations in place.
- Fix security with additive migrations.
- Do not expose service_role/private credentials to the frontend.
- Do not approve Fase 3 until database and application verification is complete.
- Do not begin Fase 4 checkout/payment work until stock/order authorization is verified.
