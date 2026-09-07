-- ============================================================
-- A2K Store — Activate real products and deactivate demo products
-- ============================================================
--
-- Context:
--   The 16 real products were created with status = 'inactive' to
--   allow media upload and verification before going public. This
--   migration performs the clean switch to the real catalog:
--   - Deactivates all demo products (active products whose SKU is
--     not in the real SKU list).
--   - Activates the 16 verified real products.
--
-- Idempotency:
--   - The first UPDATE only touches active rows that are not real
--     SKUs. Re-running it has no effect once demos are inactive.
--   - The second UPDATE only touches inactive rows that are real
--     SKUs. Re-running it has no effect once real products are
--     active.
--
-- Safety:
--   - Does not modify prices, stock, images, variants or categories.
--   - Only changes the `status` column of public.products.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Deactivate demo products
-- ------------------------------------------------------------
UPDATE public.products
SET status = 'inactive'
WHERE status = 'active'
  AND sku NOT IN (
    'CAL-001', 'CAL-002', 'CAL-003',
    'ELE-001', 'ELE-002', 'ELE-003', 'ELE-004', 'ELE-005',
    'HOG-001', 'HOG-002', 'HOG-003',
    'RDC-001', 'RDC-002',
    'REP-001',
    'RPN-001', 'RPN-002'
  );

-- ------------------------------------------------------------
-- 2. Activate real products
-- ------------------------------------------------------------
UPDATE public.products
SET status = 'active'
WHERE sku IN (
    'CAL-001', 'CAL-002', 'CAL-003',
    'ELE-001', 'ELE-002', 'ELE-003', 'ELE-004', 'ELE-005',
    'HOG-001', 'HOG-002', 'HOG-003',
    'RDC-001', 'RDC-002',
    'REP-001',
    'RPN-001', 'RPN-002'
  )
  AND status = 'inactive';
