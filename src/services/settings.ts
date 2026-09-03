/**
 * Settings Service
 *
 * Handles business settings and exchange rates.
 * Settings are stored as JSONB key-value pairs.
 */

import { supabase } from '@/lib/supabase'
import type { BusinessSetting, ExchangeRate } from '@/lib/supabase/types'

// ============================================================
// Business settings
// ============================================================

export async function getSetting<T = unknown>(
  key: string,
): Promise<{ data: T | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('business_settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data?.value as T, error: null }
}

export async function setSetting(
  key: string,
  value: unknown,
  description?: string,
): Promise<{ error: string | null }> {
  const client = supabase()
  if (!client) return { error: 'Supabase not configured' }

  const { error } = await client
    .from('business_settings')
    .upsert({
      key,
      value,
      description: description ?? null,
    })

  return { error: error?.message ?? null }
}

export async function getAllSettings(): Promise<{
  data: BusinessSetting[] | null
  error: string | null
}> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('business_settings')
    .select('*')
    .order('key')

  return { data, error: error?.message ?? null }
}

// ============================================================
// Exchange rates
// ============================================================

export async function getCurrentRate(): Promise<{
  data: ExchangeRate | null
  error: string | null
}> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('exchange_rates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return { data, error: error?.message ?? null }
}

export async function setRate(params: {
  rate: number
  source?: string
  notes?: string
}): Promise<{ data: ExchangeRate | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  // Get current rate for previous_rate reference
  const { data: current } = await getCurrentRate()

  const { data, error } = await client
    .from('exchange_rates')
    .insert({
      rate: params.rate,
      previous_rate: current?.rate ?? null,
      source: params.source ?? 'manual',
      notes: params.notes ?? null,
    })
    .select()
    .single()

  return { data, error: error?.message ?? null }
}

export async function getRateHistory(options?: {
  limit?: number
}): Promise<{ data: ExchangeRate[] | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('exchange_rates')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 50)

  return { data, error: error?.message ?? null }
}

// ============================================================
// Convenience: reservation duration
// ============================================================

export async function getReservationDurationMinutes(): Promise<number> {
  const { data } = await getSetting<number>('reservation_duration_minutes')
  return data ?? 30
}
