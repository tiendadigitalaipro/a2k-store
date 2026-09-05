# A2K Store — Security Remediation Plan

## Gate Fase 3

Fase 3 remains blocked until all items below are verified on the actual Supabase project and remote GitHub main.

1. Profiles: enforce database-level immutability of privileged fields for ordinary authenticated users.
2. Customers: prevent self-service modification of `is_wholesale` and other privileged fields; define an explicit editable-field policy.
3. Signup: make profile + customer creation atomic through a secure auth trigger; remove browser-side customer creation.
4. SECURITY DEFINER RPCs: restrict `decrement_stock` and `create_stock_reservation` to the minimum authorized execution path and validate caller/order ownership/role inside the function.
5. Reservation expiration: restrict execution to server-side/service role path and validate function privileges.
6. Password recovery: align Supabase redirect target with an actual reset-password route and verify session handling.
7. Secrets: confirm only public anon/publishable key reaches the browser; service-role/private keys remain server-side.
8. Tests: typecheck, build, auth flow tests, RLS attack tests, and RPC authorization tests.
9. Supabase: apply additive migrations only after SQL review, then verify resulting policies/functions directly.
10. Documentation: update project state only after evidence supports checkpoint approval.

## Explicit attack cases

- Customer attempts `profiles.role = 'admin'`.
- Customer attempts `profiles.is_active = false`.
- Customer attempts `profiles.email_verified = true`.
- Customer attempts `profiles.two_factor_enabled = true`.
- Customer attempts `customers.is_wholesale = true`.
- Customer calls `decrement_stock` for an unrelated product/order.
- Customer calls `create_stock_reservation` for another customer's order.
- Customer calls reservation expiration directly.

Expected result: unauthorized operations fail at the database boundary.
