-- ============================================================
-- A2K Store — Reservation duration setting (Phase 4.5 fix)
-- ============================================================
--
-- Context:
--   Checkout.tsx calls getReservationDurationMinutes(), which reads
--   business_settings.reservation_duration_minutes. The setting did
--   not exist and business_settings was admin-only (RLS + no grants).
--
-- This migration:
--   1. Seeds reservation_duration_minutes = 30 minutes.
--   2. Grants authenticated users SELECT on business_settings.
--   3. Adds an RLS policy so authenticated users can ONLY read the
--      reservation_duration_minutes key (admin policy remains intact).
--
-- Security:
--   - Additive migration.
--   - Does not modify 00001–00019.
--   - No access to other business settings for non-admins.
-- ============================================================

-- 1. Seed the setting as a JSONB number.
INSERT INTO public.business_settings (key, value, description)
VALUES (
  'reservation_duration_minutes',
  to_jsonb(30),
  'Duración en minutos de las reservas de stock en checkout'
)
ON CONFLICT (key) DO NOTHING;

-- 2. Allow authenticated users to reference the table.
GRANT SELECT ON public.business_settings TO authenticated;

-- 3. Allow authenticated users to read ONLY the reservation duration key.
--    Admins continue to use settings_select_admin / settings_update_admin.
DROP POLICY IF EXISTS "business_settings_select_reservation_duration" ON public.business_settings;

CREATE POLICY "business_settings_select_reservation_duration"
  ON public.business_settings
  FOR SELECT
  TO authenticated
  USING (key = 'reservation_duration_minutes');
