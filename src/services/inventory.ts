/**
 * Inventory Service
 *
 * Handles stock checks, reservations, and movements.
 * All stock authority lives here — never trust frontend values.
 */

import { supabase } from '@/lib/supabase'
import type { StockReservation, InventoryMovement } from '@/lib/supabase/types'

// ============================================================
// Stock queries
// ============================================================

/**
 * Get available stock for a product or variant.
 * Uses the database function for consistent calculation.
 */
export async function getAvailableStock(
  productId: string,
  variantId?: string,
): Promise<{ data: number | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client.rpc('get_available_stock', {
    p_product_id: productId,
    p_variant_id: variantId ?? undefined,
  })

  return { data, error: error?.message ?? null }
}

// ============================================================
// Reservations
// ============================================================

/**
 * Create a stock reservation.
 * Called when an order is created (pending_payment).
 * Duration comes from business_settings.
 */
export async function createReservation(params: {
  productId: string
  variantId?: string
  orderId: string
  quantity: number
  expiresAt: string
}): Promise<{ data: StockReservation | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('stock_reservations')
    .insert({
      product_id: params.productId,
      variant_id: params.variantId ?? null,
      order_id: params.orderId,
      quantity: params.quantity,
      status: 'active',
      expires_at: params.expiresAt,
    })
    .select()
    .single()

  return { data, error: error?.message ?? null }
}

/**
 * Release a reservation (cancel or expire).
 */
export async function releaseReservation(
  reservationId: string,
  reason: 'cancelled' | 'expired',
): Promise<{ error: string | null }> {
  const client = supabase()
  if (!client) return { error: 'Supabase not configured' }

  const { error } = await client
    .from('stock_reservations')
    .update({
      status: reason === 'cancelled' ? 'cancelled' : 'expired',
      released_at: new Date().toISOString(),
      released_reason: reason,
    })
    .eq('id', reservationId)
    .eq('status', 'active')

  return { error: error?.message ?? null }
}

/**
 * Consume a reservation (mark as consumed when order is confirmed).
 */
export async function consumeReservation(
  reservationId: string,
): Promise<{ error: string | null }> {
  const client = supabase()
  if (!client) return { error: 'Supabase not configured' }

  const { error } = await client
    .from('stock_reservations')
    .update({
      status: 'consumed',
      released_at: new Date().toISOString(),
      released_reason: 'consumed',
    })
    .eq('id', reservationId)
    .eq('status', 'active')

  return { error: error?.message ?? null }
}

/**
 * Expire all overdue reservations.
 * Should be called periodically (e.g., via cron or Edge Function).
 */
export async function expireOverdueReservations(): Promise<{
  count: number
  error: string | null
}> {
  const client = supabase()
  if (!client) return { count: 0, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('stock_reservations')
    .update({
      status: 'expired',
      released_at: new Date().toISOString(),
      released_reason: 'expired',
    })
    .eq('status', 'active')
    .lt('expires_at', new Date().toISOString())
    .select('id')

  return { count: data?.length ?? 0, error: error?.message ?? null }
}

// ============================================================
// Inventory movements
// ============================================================

/**
 * Record an inventory movement.
 * All stock changes must go through this function.
 */
export async function recordMovement(params: {
  productId: string
  variantId?: string
  movementType: InventoryMovementType
  quantity: number
  reason?: string
  referenceId?: string
  referenceType?: string
}): Promise<{ data: InventoryMovement | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('inventory_movements')
    .insert({
      product_id: params.productId,
      variant_id: params.variantId ?? null,
      movement_type: params.movementType,
      quantity: params.quantity,
      reason: params.reason ?? null,
      reference_id: params.referenceId ?? null,
      reference_type: params.referenceType ?? null,
    })
    .select()
    .single()

  return { data, error: error?.message ?? null }
}

/**
 * Decrement stock definitively (when order is delivered).
 * This is the ONLY time stock is permanently reduced.
 */
export async function decrementStock(params: {
  productId: string
  variantId?: string
  quantity: number
  orderId: string
}): Promise<{ error: string | null }> {
  const client = supabase()
  if (!client) return { error: 'Supabase not configured' }

  // Update stock on product/variant
  const table = params.variantId ? 'product_variants' : 'products'
  const id = params.variantId ?? params.productId

  const { data: current, error: fetchError } = await client
    .from(table)
    .select('stock')
    .eq('id', id)
    .single()

  if (fetchError) return { error: fetchError.message }
  if (!current) return { error: 'Product/variant not found' }

  const newStock = Math.max(current.stock - params.quantity, 0)

  const { error: updateError } = await client
    .from(table)
    .update({ stock: newStock })
    .eq('id', id)

  if (updateError) return { error: updateError.message }

  // Record movement
  await recordMovement({
    productId: params.productId,
    variantId: params.variantId,
    movementType: 'sale',
    quantity: -params.quantity,
    reason: 'Order delivered',
    referenceId: params.orderId,
    referenceType: 'order',
  })

  return { error: null }
}

// Type import for movement type
type InventoryMovementType = import('@/lib/supabase/types').InventoryMovementType
