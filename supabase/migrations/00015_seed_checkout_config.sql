-- ============================================================
-- A2K Store — Checkout configuration seed (Phase 4)
-- ============================================================
-- Additive migration. Do not edit previously applied migrations.
--
-- Configures the initial payment methods and shipping carrier
-- for the Venezuelan/international market. All payment methods
-- are manual: customer pays externally and uploads a receipt
-- for admin verification.
--
-- Private links, usernames, QR codes or bank details will be
-- added later through the admin/configuration UI.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Stable slug for payment_methods
-- ------------------------------------------------------------
ALTER TABLE public.payment_methods
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- ------------------------------------------------------------
-- 2. Seed payment methods
-- ------------------------------------------------------------
INSERT INTO public.payment_methods
  (name, slug, type, currency, instructions, payment_data, requires_receipt, requires_verification, sort_order, is_active)
VALUES
  ('Binance Pay',
   'binance-pay',
   'manual',
   'USD',
   'Realiza el pago por Binance Pay. En el comprobante indica el ID de transacción.',
   '{"category":"crypto_wallet","wallet":"Binance Pay"}'::jsonb,
   true, true, 10, true),

  ('OKX',
   'okx',
   'manual',
   'USD',
   'Transfiere por OKX y sube el comprobante con el ID de operación.',
   '{"category":"crypto_wallet","wallet":"OKX"}'::jsonb,
   true, true, 20, true),

  ('Zinli',
   'zinli',
   'manual',
   'USD',
   'Paga con tu tarjeta/app Zinli y sube el comprobante. Los datos de pago se agregarán próximamente.',
   '{"category":"digital_bank","wallet":"Zinli"}'::jsonb,
   true, true, 30, true),

  ('Meru',
   'meru',
   'manual',
   'USD',
   'Realiza la transferencia por Meru y adjunta el comprobante. Los datos de pago se agregarán próximamente.',
   '{"category":"digital_bank","wallet":"Meru"}'::jsonb,
   true, true, 40, true),

  ('Facebank International',
   'facebank-international',
   'manual',
   'USD',
   'Transfiere desde Facebank International y sube el comprobante.',
   '{"category":"international_bank","bank":"Facebank International"}'::jsonb,
   true, true, 50, true),

  ('Mercantil Panamá',
   'mercantil-panama',
   'manual',
   'USD',
   'Depósito o transferencia a Mercantil Panamá. Sube el comprobante.',
   '{"category":"international_bank","bank":"Mercantil Panamá"}'::jsonb,
   true, true, 60, true),

  ('Moni',
   'moni',
   'manual',
   'USD',
   'Paga mediante Moni y sube el comprobante.',
   '{"category":"digital_wallet","wallet":"Moni"}'::jsonb,
   true, true, 70, true),

  ('Pypol Pay',
   'pypol-pay',
   'manual',
   'USD',
   'Realiza el pago por Pypol Pay e indica el número de referencia.',
   '{"category":"digital_wallet","wallet":"Pypol Pay"}'::jsonb,
   true, true, 80, true),

  ('Bancos nacionales Venezuela',
   'bancos-nacionales-venezuela',
   'manual',
   'USD',
   'Transferencia a cuenta bancaria nacional. Sube el comprobante; si necesitas los datos de cuenta contáctanos por WhatsApp.',
   '{"category":"local_bank","country":"VE"}'::jsonb,
   true, true, 90, true),

  ('Lear Bank USA',
   'lear-bank-usa',
   'manual',
   'USD',
   'Transfiere desde Lear Bank USA y sube el comprobante.',
   '{"category":"international_bank","bank":"Lear Bank USA"}'::jsonb,
   true, true, 100, true)
ON CONFLICT (slug) DO UPDATE SET
  name               = EXCLUDED.name,
  type               = EXCLUDED.type,
  currency           = EXCLUDED.currency,
  instructions       = EXCLUDED.instructions,
  payment_data       = EXCLUDED.payment_data,
  requires_receipt   = EXCLUDED.requires_receipt,
  requires_verification = EXCLUDED.requires_verification,
  sort_order         = EXCLUDED.sort_order,
  is_active          = EXCLUDED.is_active,
  updated_at         = now();

-- ------------------------------------------------------------
-- 3. Seed generic free shipping carrier
-- ------------------------------------------------------------
INSERT INTO public.shipping_carriers (name, slug, cost, is_active, sort_order)
VALUES ('Envío nacional gratuito', 'envio-nacional-gratuito', 0, true, 10)
ON CONFLICT (slug) DO UPDATE SET
  name       = EXCLUDED.name,
  cost       = EXCLUDED.cost,
  is_active  = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- ------------------------------------------------------------
-- 4. Seed checkout business settings
-- ------------------------------------------------------------
INSERT INTO public.business_settings (key, value, description) VALUES
  ('checkout_min_order_amount', '0', 'Monto mínimo de orden para checkout'),
  ('checkout_requires_auth', 'true', 'Checkout solo para usuarios autenticados'),
  ('payment_verification_instructions', '"El equipo verificará tu pago en un plazo de 24 horas hábiles."', 'Mensaje mostrado tras seleccionar pago manual')
ON CONFLICT (key) DO NOTHING;
