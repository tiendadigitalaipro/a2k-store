/**
 * Payments Service
 *
 * Handles payment methods, order payments, and receipts.
 * Payment verification is admin-only.
 */

import { supabase } from '@/lib/supabase'
import type { PaymentMethod, OrderPayment, PaymentReceipt, PaymentStatus } from '@/lib/supabase/types'

// ============================================================
// Payment methods
// ============================================================

export async function getActivePaymentMethods(): Promise<{
  data: PaymentMethod[] | null
  error: string | null
}> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  return { data, error: error?.message ?? null }
}

export async function getPaymentMethodById(
  id: string,
): Promise<{ data: PaymentMethod | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('payment_methods')
    .select('*')
    .eq('id', id)
    .single()

  return { data, error: error?.message ?? null }
}

// ============================================================
// Order payments
// ============================================================

export async function createPayment(params: {
  orderId: string
  paymentMethodId: string
  amount: number
  currency?: string
  exchangeRate?: number
  amountLocal?: number
}): Promise<{ data: OrderPayment | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('order_payments')
    .insert({
      order_id: params.orderId,
      payment_method_id: params.paymentMethodId,
      amount: params.amount,
      currency: params.currency ?? 'USD',
      exchange_rate: params.exchangeRate ?? null,
      amount_local: params.amountLocal ?? null,
      status: 'pending',
    })
    .select()
    .single()

  return { data, error: error?.message ?? null }
}

export async function getPaymentByOrderId(
  orderId: string,
): Promise<{ data: OrderPayment | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('order_payments')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return { data, error: error?.message ?? null }
}

/**
 * Update payment status (admin action).
 * Does NOT automatically update order status — that's the caller's responsibility.
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  options?: {
    verifiedBy?: string
    rejectionReason?: string
    notes?: string
  },
): Promise<{ error: string | null }> {
  const client = supabase()
  if (!client) return { error: 'Supabase not configured' }

  const update: Record<string, unknown> = { status }

  if (status === 'approved') {
    update.verified_at = new Date().toISOString()
    if (options?.verifiedBy) update.verified_by = options.verifiedBy
  }

  if (status === 'rejected' && options?.rejectionReason) {
    update.rejection_reason = options.rejectionReason
  }

  if (options?.notes) update.notes = options.notes

  const { error } = await client
    .from('order_payments')
    .update(update)
    .eq('id', paymentId)

  return { error: error?.message ?? null }
}

// ============================================================
// Payment receipts
// ============================================================

export async function uploadReceipt(params: {
  paymentId: string
  fileUrl: string
  fileName?: string
  fileType?: string
}): Promise<{ data: PaymentReceipt | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('payment_receipts')
    .insert({
      payment_id: params.paymentId,
      file_url: params.fileUrl,
      file_name: params.fileName ?? null,
      file_type: params.fileType ?? null,
    })
    .select()
    .single()

  return { data, error: error?.message ?? null }
}

export async function getReceiptsByPaymentId(
  paymentId: string,
): Promise<{ data: PaymentReceipt[] | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('payment_receipts')
    .select('*')
    .eq('payment_id', paymentId)
    .order('created_at')

  return { data, error: error?.message ?? null }
}
