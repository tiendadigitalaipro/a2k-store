/**
 * Addresses Service
 *
 * Handles customer addresses for shipping.
 */

import { supabase } from '@/lib/supabase'
import type { CustomerAddress } from '@/lib/supabase/types'

export async function getCustomerAddresses(
  customerId: string,
): Promise<{ data: CustomerAddress[] | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('customer_addresses')
    .select('*')
    .eq('customer_id', customerId)
    .order('is_default', { ascending: false })

  return { data, error: error?.message ?? null }
}

export interface CreateAddressParams {
  customerId: string
  label?: string
  fullName: string
  whatsapp: string
  state: string
  city: string
  addressLine: string
  reference?: string
  isDefault?: boolean
}

export async function createCustomerAddress(
  params: CreateAddressParams,
): Promise<{ data: CustomerAddress | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('customer_addresses')
    .insert({
      customer_id: params.customerId,
      label: params.label ?? 'Principal',
      full_name: params.fullName,
      whatsapp: params.whatsapp,
      state: params.state,
      city: params.city,
      address_line: params.addressLine,
      reference: params.reference ?? null,
      is_default: params.isDefault ?? false,
    })
    .select()
    .single()

  return { data, error: error?.message ?? null }
}
