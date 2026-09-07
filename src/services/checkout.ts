/**
 * Checkout Service
 *
 * Atomic order creation via PostgreSQL RPC.
 * Creates order, order_items, payment and stock reservations
 * in a single database transaction.
 */

import { supabase } from '@/lib/supabase'

export interface CheckoutItem {
  product_id: string
  variant_id?: string
  quantity: number
}

export interface CreateOrderCheckoutResult {
  order_id: string
  order_number: string
  total: number
  status: string
  reservation_expires_at: string
}

export async function createOrderCheckout(params: {
  addressId?: string
  deliveryMethod: 'shipping' | 'pickup'
  items: CheckoutItem[]
  paymentMethodId: string
  reservationMinutes: number
  customerNotes?: string
}): Promise<{ data: CreateOrderCheckoutResult | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client.rpc('create_order_checkout', {
    p_address_id: params.addressId ?? null,
    p_delivery_method: params.deliveryMethod,
    p_items: params.items,
    p_payment_method_id: params.paymentMethodId,
    p_customer_notes: params.customerNotes ?? null,
    p_reservation_minutes: params.reservationMinutes,
  })

  if (error) return { data: null, error: error.message }
  return { data: data as CreateOrderCheckoutResult, error: null }
}
