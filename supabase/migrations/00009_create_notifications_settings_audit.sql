-- ============================================================
-- A2K Store — Notifications, Settings, Exchange Rates, Audit
-- ============================================================

-- Notifications
CREATE TABLE public.notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel         public.notification_channel NOT NULL DEFAULT 'system',
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  data            JSONB DEFAULT '{}',  -- extra context (order_id, product_id, etc.)
  is_read         BOOLEAN NOT NULL DEFAULT false,
  read_at         TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notification events (log of all notification triggers)
CREATE TABLE public.notification_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      TEXT NOT NULL,  -- 'order_created', 'payment_approved', 'stock_low', etc.
  user_id         UUID REFERENCES public.profiles(id),
  reference_id    UUID,          -- order_id, product_id, etc.
  reference_type  TEXT,
  channel         public.notification_channel,
  success         BOOLEAN NOT NULL DEFAULT true,
  error           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Business settings (key-value store)
CREATE TABLE public.business_settings (
  key             TEXT PRIMARY KEY,
  value           JSONB NOT NULL,
  description     TEXT,
  updated_by      UUID REFERENCES public.profiles(id),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exchange rates history
CREATE TABLE public.exchange_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rate            NUMERIC(12,4) NOT NULL CHECK (rate > 0),
  previous_rate   NUMERIC(12,4),
  source          TEXT NOT NULL DEFAULT 'manual',  -- 'bcv', 'manual', 'api'
  set_by          UUID REFERENCES public.profiles(id),
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs (append-only)
CREATE TABLE public.audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES public.profiles(id),
  action          TEXT NOT NULL,       -- 'create', 'update', 'delete', 'approve', 'reject'
  entity_type     TEXT NOT NULL,       -- 'product', 'order', 'payment', etc.
  entity_id       UUID,
  old_values      JSONB,
  new_values      JSONB,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX idx_notification_events_event_type ON public.notification_events(event_type);
CREATE INDEX idx_notification_events_user_id ON public.notification_events(user_id);
CREATE INDEX idx_exchange_rates_created_at ON public.exchange_rates(created_at);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- Updated_at trigger for business_settings
CREATE TRIGGER set_business_settings_updated_at
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Seed default business settings
-- ============================================================

INSERT INTO public.business_settings (key, value, description) VALUES
  ('store_name', '"A2K Store"', 'Nombre de la tienda'),
  ('store_currency', '"USD"', 'Moneda principal'),
  ('store_market', '"Venezuela"', 'Mercado principal'),
  ('reservation_duration_minutes', '30', 'Duración de reserva de inventario en minutos'),
  ('allow_coupon_promotion_combine', 'false', 'Si cupones y promociones pueden combinarse'),
  ('wholesale_enabled', 'false', 'Si el modo mayorista está activo'),
  ('pickup_location', '"Ocumare del Tuy"', 'Ubicación de retiro'),
  ('business_hours', '"7:00 a.m. – 10:00 p.m."', 'Horario de atención'),
  ('whatsapp_primary', '"+58 416 411 7331"', 'WhatsApp principal'),
  ('whatsapp_secondary', '"+58 412 614 8666"', 'WhatsApp secundario'),
  ('email_contact', '"ceo@a2kdigitalstudio.online"', 'Email de contacto'),
  ('shipping_cost_retail', '0', 'Costo de envío retail (gratis para cliente)'),
  ('exchange_rate_source', '"manual"', 'Fuente de tasa de cambio: manual, bcv, api')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Seed default exchange rate
-- ============================================================

INSERT INTO public.exchange_rates (rate, source, notes)
VALUES (80.00, 'manual', 'Tasa inicial — actualizar según BCV/A2K')
ON CONFLICT DO NOTHING;
