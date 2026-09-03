-- ============================================================
-- A2K Store — Enums
-- ============================================================

-- User roles
CREATE TYPE public.user_role AS ENUM (
  'superadmin',
  'admin',
  'orders',
  'inventory',
  'products',
  'customer_service',
  'finance'
);

-- Order statuses
CREATE TYPE public.order_status AS ENUM (
  'pending_payment',
  'payment_verification',
  'payment_approved',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'cancelled_expired',
  'payment_rejected',
  'returned'
);

-- Payment statuses
CREATE TYPE public.payment_status AS ENUM (
  'pending',
  'verification',
  'approved',
  'rejected',
  'refunded'
);

-- Payment method types
CREATE TYPE public.payment_method_type AS ENUM (
  'automatic',
  'manual'
);

-- Reservation statuses
CREATE TYPE public.reservation_status AS ENUM (
  'active',
  'consumed',
  'cancelled',
  'expired'
);

-- Inventory movement types
CREATE TYPE public.inventory_movement_type AS ENUM (
  'entry',
  'exit',
  'adjustment',
  'reservation',
  'release',
  'sale',
  'return'
);

-- Product status
CREATE TYPE public.product_status AS ENUM (
  'active',
  'inactive',
  'archived'
);

-- Delivery method
CREATE TYPE public.delivery_method AS ENUM (
  'shipping',
  'pickup'
);

-- Notification channel
CREATE TYPE public.notification_channel AS ENUM (
  'system',
  'email',
  'whatsapp'
);

-- Review status
CREATE TYPE public.review_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'hidden'
);

-- Promotion type
CREATE TYPE public.promotion_type AS ENUM (
  'percentage',
  'fixed_amount'
);

-- Coupon type
CREATE TYPE public.coupon_type AS ENUM (
  'percentage',
  'fixed_amount'
);

-- Claim status
CREATE TYPE public.claim_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'resolved'
);

-- Claim resolution
CREATE TYPE public.claim_resolution AS ENUM (
  'same_product',
  'equivalent_product',
  'product_combination'
);
