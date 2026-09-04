/**
 * Supabase client configuration
 *
 * Uses environment variables for connection.
 * Never hard-code credentials.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: SupabaseClient<any, 'public', any> | null = null

/**
 * Get or create the Supabase client singleton.
 * Returns null if credentials are not configured.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function supabase(): SupabaseClient<any, 'public', any> | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '[A2K Store] Supabase credentials not configured. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
    )
    return null
  }

  if (!_client) {
    _client = createClient(supabaseUrl, supabaseAnonKey)
  }

  return _client
}
