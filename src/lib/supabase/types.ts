/**
 * Database types for A2K Store
 *
 * These types mirror the Supabase schema.
 * Update when migrations change.
 */

// ============================================================
// Enums
// ============================================================

export type UserRole =
  | 'superadmin'
  | 'admin'
  | 'orders'
  | 'inventory'
  | 'products'
  | 'customer_service'
  | 'finance'

export type OrderStatus =
  | 'pending_payment'
  | 'payment_verification'
  | 'payment_approved'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'cancelled_expired'
  | 'payment_rejected'
  | 'returned'

export type PaymentStatus =
  | 'pending'
  | 'verification'
  | 'approved'
  | 'rejected'
  | 'refunded'

export type PaymentMethodType = 'automatic' | 'manual'

export type ReservationStatus =
  | 'active'
  | 'consumed'
  | 'cancelled'
  | 'expired'

export type InventoryMovementType =
  | 'entry'
  | 'exit'
  | 'adjustment'
  | 'reservation'
  | 'release'
  | 'sale'
  | 'return'

export type ProductStatus = 'active' | 'inactive' | 'archived'

export type DeliveryMethod = 'shipping' | 'pickup'

export type NotificationChannel = 'system' | 'email' | 'whatsapp'

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden'

export type PromotionType = 'percentage' | 'fixed_amount'

export type CouponType = 'percentage' | 'fixed_amount'

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'resolved'

export type ClaimResolution =
  | 'same_product'
  | 'equivalent_product'
  | 'product_combination'

// ============================================================
// Table row types
// ============================================================

export interface Profile {
  id: string
  email: string
  full_name: string
  whatsapp: string | null
  role: UserRole
  is_active: boolean
  email_verified: boolean
  two_factor_enabled: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  profile_id: string
  whatsapp: string
  is_wholesale: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CustomerAddress {
  id: string
  customer_id: string
  label: string | null
  full_name: string
  whatsapp: string
  state: string
  city: string
  address_line: string
  reference: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface RolePermission {
  id: string
  role: UserRole
  module: string
  action: string
  allowed: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  banner_url: string | null
  is_active: boolean
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  sku: string
  description: string | null
  short_description: string | null
  category_id: string | null
  subcategory_id: string | null
  brand_id: string | null
  status: ProductStatus
  price: number
  compare_at_price: number | null
  cost: number | null
  currency: string
  stock: number
  stock_reserved: number
  stock_minimum: number
  max_per_order: number | null
  is_featured: boolean
  is_new: boolean
  tags: string[]
  seo_title: string | null
  seo_description: string | null
  weight: number | null
  created_at: string
  updated_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku: string
  attributes: Record<string, string>
  price: number | null
  compare_at_price: number | null
  cost: number | null
  stock: number
  stock_reserved: number
  stock_minimum: number
  max_per_order: number | null
  image_url: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  variant_id: string | null
  url: string
  alt_text: string | null
  sort_order: number
  created_at: string
}

export interface InventoryMovement {
  id: string
  product_id: string
  variant_id: string | null
  movement_type: InventoryMovementType
  quantity: number
  reason: string | null
  reference_id: string | null
  reference_type: string | null
  performed_by: string | null
  created_at: string
}

export interface StockReservation {
  id: string
  product_id: string
  variant_id: string | null
  order_id: string | null
  quantity: number
  status: ReservationStatus
  expires_at: string
  released_at: string | null
  released_reason: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  order_number: string
  customer_id: string
  address_id: string | null
  delivery_method: DeliveryMethod
  pickup_confirmed: boolean
  pickup_date: string | null
  pickup_time: string | null
  pickup_notes: string | null
  status: OrderStatus
  subtotal: number
  discount_total: number
  shipping_cost: number
  total: number
  currency: string
  exchange_rate: number | null
  total_local: number | null
  payment_method_id: string | null
  coupon_id: string | null
  promotion_id: string | null
  customer_notes: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null
  cancelled_at: string | null
  reservation_expires_at: string | null
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string | null
  product_name: string
  product_sku: string
  variant_name: string | null
  price: number
  quantity: number
  subtotal: number
  discount: number
  created_at: string
}

export interface OrderStatusHistory {
  id: string
  order_id: string
  old_status: OrderStatus | null
  new_status: OrderStatus
  changed_by: string | null
  notes: string | null
  created_at: string
}

export interface PaymentMethod {
  id: string
  name: string
  type: PaymentMethodType
  currency: string
  is_active: boolean
  instructions: string | null
  payment_data: Record<string, unknown> | null
  payment_link: string | null
  requires_receipt: boolean
  requires_verification: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface OrderPayment {
  id: string
  order_id: string
  payment_method_id: string
  amount: number
  currency: string
  exchange_rate: number | null
  amount_local: number | null
  status: PaymentStatus
  verified_by: string | null
  verified_at: string | null
  rejection_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PaymentReceipt {
  id: string
  payment_id: string
  file_url: string
  file_name: string | null
  file_type: string | null
  uploaded_by: string | null
  created_at: string
}

export interface ShippingCarrier {
  id: string
  name: string
  slug: string
  website_url: string | null
  tracking_url: string | null
  is_active: boolean
  cost: number
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface OrderShipping {
  id: string
  order_id: string
  carrier_id: string | null
  tracking_number: string | null
  tracking_url: string | null
  estimated_date: string | null
  shipped_at: string | null
  delivered_at: string | null
  cost: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Promotion {
  id: string
  name: string
  description: string | null
  type: PromotionType
  value: number
  product_id: string | null
  variant_id: string | null
  category_id: string | null
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Coupon {
  id: string
  code: string
  name: string
  description: string | null
  type: CouponType
  value: number
  min_purchase: number | null
  max_uses_total: number | null
  max_uses_per_customer: number | null
  current_uses: number
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  product_ids: string[]
  category_ids: string[]
  created_at: string
  updated_at: string
}

export interface CouponUsage {
  id: string
  coupon_id: string
  order_id: string
  customer_id: string
  discount_amount: number
  created_at: string
}

export interface QuantityDiscount {
  id: string
  product_id: string | null
  variant_id: string | null
  min_quantity: number
  discount_type: PromotionType
  discount_value: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  product_id: string
  customer_id: string
  order_id: string
  rating: number
  comment: string | null
  status: ReviewStatus
  moderated_by: string | null
  moderated_at: string | null
  created_at: string
  updated_at: string
}

export interface ReviewPhoto {
  id: string
  review_id: string
  url: string
  alt_text: string | null
  sort_order: number
  created_at: string
}

export interface ProductQuestion {
  id: string
  product_id: string
  customer_id: string
  question: string
  answer: string | null
  answered_by: string | null
  answered_at: string | null
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface Wishlist {
  id: string
  customer_id: string
  product_id: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  channel: NotificationChannel
  title: string
  body: string
  data: Record<string, unknown>
  is_read: boolean
  read_at: string | null
  sent_at: string | null
  created_at: string
}

export interface NotificationEvent {
  id: string
  event_type: string
  user_id: string | null
  reference_id: string | null
  reference_type: string | null
  channel: NotificationChannel | null
  success: boolean
  error: string | null
  created_at: string
}

export interface BusinessSetting {
  key: string
  value: unknown
  description: string | null
  updated_by: string | null
  updated_at: string
}

export interface ExchangeRate {
  id: string
  rate: number
  previous_rate: number | null
  source: string
  set_by: string | null
  notes: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// ============================================================
// Database type (Supabase generic)
// ============================================================

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; email: string; full_name: string }; Update: Partial<Profile> }
      customers: { Row: Customer; Insert: Partial<Customer> & { profile_id: string; whatsapp: string }; Update: Partial<Customer> }
      customer_addresses: { Row: CustomerAddress; Insert: Partial<CustomerAddress> & { customer_id: string; full_name: string; whatsapp: string; state: string; city: string; address_line: string }; Update: Partial<CustomerAddress> }
      role_permissions: { Row: RolePermission; Insert: Partial<RolePermission> & { role: UserRole; module: string; action: string }; Update: Partial<RolePermission> }
      categories: { Row: Category; Insert: Partial<Category> & { name: string; slug: string }; Update: Partial<Category> }
      subcategories: { Row: Subcategory; Insert: Partial<Subcategory> & { category_id: string; name: string; slug: string }; Update: Partial<Subcategory> }
      brands: { Row: Brand; Insert: Partial<Brand> & { name: string; slug: string }; Update: Partial<Brand> }
      products: { Row: Product; Insert: Partial<Product> & { name: string; slug: string; sku: string; price: number }; Update: Partial<Product> }
      product_variants: { Row: ProductVariant; Insert: Partial<ProductVariant> & { product_id: string; name: string; sku: string }; Update: Partial<ProductVariant> }
      product_images: { Row: ProductImage; Insert: Partial<ProductImage> & { product_id: string; url: string }; Update: Partial<ProductImage> }
      inventory_movements: { Row: InventoryMovement; Insert: Partial<InventoryMovement> & { product_id: string; movement_type: InventoryMovementType; quantity: number }; Update: Partial<InventoryMovement> }
      stock_reservations: { Row: StockReservation; Insert: Partial<StockReservation> & { product_id: string; quantity: number; expires_at: string }; Update: Partial<StockReservation> }
      orders: { Row: Order; Insert: Partial<Order> & { customer_id: string; subtotal: number; total: number }; Update: Partial<Order> }
      order_items: { Row: OrderItem; Insert: Partial<OrderItem> & { order_id: string; product_id: string; product_name: string; product_sku: string; price: number; quantity: number; subtotal: number }; Update: Partial<OrderItem> }
      order_status_history: { Row: OrderStatusHistory; Insert: Partial<OrderStatusHistory> & { order_id: string; new_status: OrderStatus }; Update: Partial<OrderStatusHistory> }
      payment_methods: { Row: PaymentMethod; Insert: Partial<PaymentMethod> & { name: string }; Update: Partial<PaymentMethod> }
      order_payments: { Row: OrderPayment; Insert: Partial<OrderPayment> & { order_id: string; payment_method_id: string; amount: number }; Update: Partial<OrderPayment> }
      payment_receipts: { Row: PaymentReceipt; Insert: Partial<PaymentReceipt> & { payment_id: string; file_url: string }; Update: Partial<PaymentReceipt> }
      shipping_carriers: { Row: ShippingCarrier; Insert: Partial<ShippingCarrier> & { name: string; slug: string }; Update: Partial<ShippingCarrier> }
      order_shipping: { Row: OrderShipping; Insert: Partial<OrderShipping> & { order_id: string }; Update: Partial<OrderShipping> }
      promotions: { Row: Promotion; Insert: Partial<Promotion> & { name: string; type: PromotionType; value: number }; Update: Partial<Promotion> }
      coupons: { Row: Coupon; Insert: Partial<Coupon> & { code: string; name: string; type: CouponType; value: number }; Update: Partial<Coupon> }
      coupon_usage: { Row: CouponUsage; Insert: Partial<CouponUsage> & { coupon_id: string; order_id: string; customer_id: string; discount_amount: number }; Update: Partial<CouponUsage> }
      quantity_discounts: { Row: QuantityDiscount; Insert: Partial<QuantityDiscount> & { min_quantity: number; discount_type: PromotionType; discount_value: number }; Update: Partial<QuantityDiscount> }
      reviews: { Row: Review; Insert: Partial<Review> & { product_id: string; customer_id: string; order_id: string; rating: number }; Update: Partial<Review> }
      review_photos: { Row: ReviewPhoto; Insert: Partial<ReviewPhoto> & { review_id: string; url: string }; Update: Partial<ReviewPhoto> }
      product_questions: { Row: ProductQuestion; Insert: Partial<ProductQuestion> & { product_id: string; customer_id: string; question: string }; Update: Partial<ProductQuestion> }
      wishlists: { Row: Wishlist; Insert: Partial<Wishlist> & { customer_id: string; product_id: string }; Update: Partial<Wishlist> }
      notifications: { Row: Notification; Insert: Partial<Notification> & { user_id: string; title: string; body: string }; Update: Partial<Notification> }
      notification_events: { Row: NotificationEvent; Insert: Partial<NotificationEvent> & { event_type: string }; Update: Partial<NotificationEvent> }
      business_settings: { Row: BusinessSetting; Insert: Partial<BusinessSetting> & { key: string; value: unknown }; Update: Partial<BusinessSetting> }
      exchange_rates: { Row: ExchangeRate; Insert: Partial<ExchangeRate> & { rate: number }; Update: Partial<ExchangeRate> }
      audit_logs: { Row: AuditLog; Insert: Partial<AuditLog> & { action: string; entity_type: string }; Update: Partial<AuditLog> }
    }
    Functions: {
      get_available_stock: {
        Args: { p_product_id: string; p_variant_id?: string }
        Returns: number
      }
      has_role: {
        Args: { required_role: UserRole }
        Returns: boolean
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      get_customer_id: {
        Args: Record<string, never>
        Returns: string | null
      }
    }
  }
}
