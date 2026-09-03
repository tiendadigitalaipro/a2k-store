/**
 * Supabase client configuration
 *
 * Uses environment variables for connection.
 * Never hard-code credentials.
 *
 * Required env vars:
 *   VITE_SUPABASE_URL=https://your-project.supabase.co
 *   VITE_SUPABASE_ANON_KEY=your-anon-key
 *
 * NOTE: Install @supabase/supabase-js when ready to connect:
 *   npm install @supabase/supabase-js
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClientAny = any

let _client: SupabaseClientAny = null

/**
 * Get or create the Supabase client singleton.
 * Returns null if credentials are not configured or package not installed.
 *
 * The return type is `any` when @supabase/supabase-js is not installed.
 * Once installed, the actual SupabaseClient type provides full IntelliSense.
 */
export function supabase(): SupabaseClientAny | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '[A2K Store] Supabase credentials not configured. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
    )
    return null
  }

  if (!_client) {
    try {
      // Dynamic require to avoid hard dependency at compile time
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('@supabase/supabase-js') as {
        createClient: (url: string, key: string) => SupabaseClientAny
      }
      _client = mod.createClient(supabaseUrl, supabaseAnonKey)
    } catch {
      console.warn(
        '[A2K Store] @supabase/supabase-js not installed. ' +
        'Run: npm install @supabase/supabase-js',
      )
      return null
    }
  }

  return _client
}
