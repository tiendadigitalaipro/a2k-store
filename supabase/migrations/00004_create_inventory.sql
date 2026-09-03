-- ============================================================
-- A2K Store — Inventory: Movements & Reservations
-- ============================================================

-- Inventory movements (ledger)
CREATE TABLE public.inventory_movements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id      UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  movement_type   public.inventory_movement_type NOT NULL,
  quantity         INTEGER NOT NULL,  -- positive = in, negative = out
  reason          TEXT,
  reference_id    UUID,  -- order_id, reservation_id, etc.
  reference_type  TEXT,  -- 'order', 'reservation', 'adjustment'
  performed_by    UUID REFERENCES public.profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stock reservations
CREATE TABLE public.stock_reservations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id      UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  order_id        UUID,  -- will FK to orders after orders table created
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  status          public.reservation_status NOT NULL DEFAULT 'active',
  expires_at      TIMESTAMPTZ NOT NULL,
  released_at     TIMESTAMPTZ,
  released_reason TEXT,  -- 'cancelled', 'expired', 'consumed'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_inventory_movements_product_id ON public.inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_variant_id ON public.inventory_movements(variant_id);
CREATE INDEX idx_inventory_movements_type ON public.inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_reference ON public.inventory_movements(reference_id, reference_type);
CREATE INDEX idx_inventory_movements_created_at ON public.inventory_movements(created_at);
CREATE INDEX idx_stock_reservations_product_id ON public.stock_reservations(product_id);
CREATE INDEX idx_stock_reservations_variant_id ON public.stock_reservations(variant_id);
CREATE INDEX idx_stock_reservations_order_id ON public.stock_reservations(order_id);
CREATE INDEX idx_stock_reservations_status ON public.stock_reservations(status);
CREATE INDEX idx_stock_reservations_expires_at ON public.stock_reservations(expires_at) WHERE status = 'active';

-- Updated_at trigger
CREATE TRIGGER set_stock_reservations_updated_at
  BEFORE UPDATE ON public.stock_reservations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Helper: available stock calculation
-- available = stock - stock_reserved (at product level)
-- For variants: variant.stock - variant.stock_reserved
-- Effective available = MIN(available, max_per_order) if set
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_available_stock(
  p_product_id UUID,
  p_variant_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
  v_stock INTEGER;
  v_reserved INTEGER;
  v_max INTEGER;
  v_available INTEGER;
BEGIN
  IF p_variant_id IS NOT NULL THEN
    SELECT stock, stock_reserved, max_per_order
    INTO v_stock, v_reserved, v_max
    FROM public.product_variants
    WHERE id = p_variant_id;
  ELSE
    SELECT stock, stock_reserved, max_per_order
    INTO v_stock, v_reserved, v_max
    FROM public.products
    WHERE id = p_product_id;
  END IF;

  IF v_stock IS NULL THEN RETURN 0; END IF;

  v_available := v_stock - v_reserved;
  IF v_available < 0 THEN v_available := 0; END IF;

  IF v_max IS NOT NULL AND v_max > 0 THEN
    v_available := LEAST(v_available, v_max);
  END IF;

  RETURN v_available;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- Trigger: auto-update stock_reserved on products when
-- reservation is created/released
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_stock_reserved()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    -- Increment reserved
    IF NEW.variant_id IS NOT NULL THEN
      UPDATE public.product_variants
      SET stock_reserved = stock_reserved + NEW.quantity
      WHERE id = NEW.variant_id;
    ELSE
      UPDATE public.products
      SET stock_reserved = stock_reserved + NEW.quantity
      WHERE id = NEW.product_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status != 'active' THEN
    -- Decrement reserved (consumed, cancelled, expired)
    IF NEW.variant_id IS NOT NULL THEN
      UPDATE public.product_variants
      SET stock_reserved = GREATEST(stock_reserved - OLD.quantity, 0)
      WHERE id = NEW.variant_id;
    ELSE
      UPDATE public.products
      SET stock_reserved = GREATEST(stock_reserved - OLD.quantity, 0)
      WHERE id = NEW.product_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_reservations_update_reserved
  AFTER INSERT OR UPDATE ON public.stock_reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_stock_reserved();
