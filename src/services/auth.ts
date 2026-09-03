/**
 * Auth Service
 *
 * Basic structure for Supabase Auth integration.
 * Full implementation belongs to Fase 3.
 * This provides the interface and basic operations.
 */

import { supabase } from '@/lib/supabase'
import type { Profile, Customer } from '@/lib/supabase/types'

// ============================================================
// Auth operations
// ============================================================

export async function signUp(params: {
  email: string
  password: string
  fullName: string
  whatsapp: string
}): Promise<{ error: string | null }> {
  const client = supabase()
  if (!client) return { error: 'Supabase not configured' }

  const { error } = await client.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        full_name: params.fullName,
        whatsapp: params.whatsapp,
      },
    },
  })

  return { error: error?.message ?? null }
}

export async function signIn(params: {
  email: string
  password: string
}): Promise<{ error: string | null }> {
  const client = supabase()
  if (!client) return { error: 'Supabase not configured' }

  const { error } = await client.auth.signInWithPassword({
    email: params.email,
    password: params.password,
  })

  return { error: error?.message ?? null }
}

export async function signOut(): Promise<{ error: string | null }> {
  const client = supabase()
  if (!client) return { error: 'Supabase not configured' }

  const { error } = await client.auth.signOut()
  return { error: error?.message ?? null }
}

export async function resetPassword(
  email: string,
): Promise<{ error: string | null }> {
  const client = supabase()
  if (!client) return { error: 'Supabase not configured' }

  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  return { error: error?.message ?? null }
}

export async function getCurrentUser() {
  const client = supabase()
  if (!client) return null

  const { data: { user } } = await client.auth.getUser()
  return user
}

export async function getCurrentProfile(): Promise<{
  data: Profile | null
  error: string | null
}> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const user = await getCurrentUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { data, error: error?.message ?? null }
}

export async function getCurrentCustomer(): Promise<{
  data: Customer | null
  error: string | null
}> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const user = await getCurrentUser()
  if (!user) return { data: null, error: 'Not authenticated' }

  const { data, error } = await client
    .from('customers')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  return { data, error: error?.message ?? null }
}

/**
 * Listen for auth state changes.
 */
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void,
) {
  const client = supabase()
  if (!client) return { data: { subscription: { unsubscribe: () => {} } } }

  return client.auth.onAuthStateChange(callback)
}
