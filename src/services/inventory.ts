/**
 * Inventory Service
 *
 * Handles stock checks, reservations, and movements.
 * All stock authority lives here — never trust frontend values.
 */

import { supabase } from '@/lib/supabase'
import type { InventoryMovement } from '@/lib/supabase/types'

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
 * Create a stock reservation atomically.
 * Uses database RPC to prevent overselling under concurrent access.
 * Called when an order is created (pending_payment).
 */
export async function createReservation(params: {
  productId: string
  variantId?: string
  orderId: string
  quantity: number
  expiresAt: string
}): Promise<{ data: { id: string } | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client.rpc('create_stock_reservation', {
    p_product_id: params.productId,
    p_variant_id: params.variantId ?? null,
    p_order_id: params.orderId,
    p_quantity: params.quantity,
    p_expires_at: params.expiresAt,
  })

  if (error) return { data: null, error: error.message }
  return { data: { id: data }, error: null }
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
 * Uses atomic RPC. Should be called periodically (e.g., via cron or Edge Function).
 */
export async function expireOverdueReservations(): Promise<{
  count: number
  error: string | null
}> {
  const client = supabase()
  if (!client) return { count: 0, error: 'Supabase not configured' }

  const { data, error } = await client.rpc('expire_overdue_reservations')

  if (error) return { count: 0, error: error.message }
  return { count: data ?? 0, error: null }
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
 * Uses atomic RPC to prevent race conditions.
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

  const { error } = await client.rpc('decrement_stock', {
    p_product_id: params.productId,
    p_variant_id: params.variantId ?? null,
    p_quantity: params.quantity,
    p_order_id: params.orderId,
  })

  return { error: error?.message ?? null }
}

// Type import for movement type
type InventoryMovementType = import('@/lib/supabase/types').InventoryMovementType
