-- ============================================================
-- A2K Store — Payment Methods, Payments, Receipts
-- ============================================================

-- Payment methods (configurable from admin)
CREATE TABLE public.payment_methods (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                  TEXT NOT NULL,
  type                  public.payment_method_type NOT NULL DEFAULT 'manual',
  currency              TEXT NOT NULL DEFAULT 'USD',  -- USD or VES
  is_active             BOOLEAN NOT NULL DEFAULT true,
  instructions          TEXT,          -- shown to customer
  payment_data          JSONB,         -- bank account info, wallet address, etc.
  payment_link          TEXT,          -- for automatic methods (Zinli, Meru)
  requires_receipt      BOOLEAN NOT NULL DEFAULT true,
  requires_verification BOOLEAN NOT NULL DEFAULT true,
  sort_order            INTEGER NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order payments
CREATE TABLE public.order_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES public.payment_methods(id),
  amount            NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency          TEXT NOT NULL DEFAULT 'USD',
  exchange_rate     NUMERIC(12,4),  -- rate used for this payment
  amount_local      NUMERIC(14,2),  -- amount in VES if different currency
  status            public.payment_status NOT NULL DEFAULT 'pending',
  verified_by       UUID REFERENCES public.profiles(id),
  verified_at       TIMESTAMPTZ,
  rejection_reason  TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment receipts (comprobantes)
CREATE TABLE public.payment_receipts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id      UUID NOT NULL REFERENCES public.order_payments(id) ON DELETE CASCADE,
  file_url        TEXT NOT NULL,       -- Supabase Storage URL
  file_name       TEXT,
  file_type       TEXT,                -- image/jpeg, application/pdf, etc.
  uploaded_by     UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_payment_methods_is_active ON public.payment_methods(is_active) WHERE is_active = true;
CREATE INDEX idx_order_payments_order_id ON public.order_payments(order_id);
CREATE INDEX idx_order_payments_status ON public.order_payments(status);
CREATE INDEX idx_order_payments_payment_method_id ON public.order_payments(payment_method_id);
CREATE INDEX idx_payment_receipts_payment_id ON public.payment_receipts(payment_id);

-- Updated_at triggers
CREATE TRIGGER set_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_order_payments_updated_at
  BEFORE UPDATE ON public.order_payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
