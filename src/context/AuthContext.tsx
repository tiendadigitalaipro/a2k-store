/**
 * Auth Context
 *
 * Manages authentication state using Supabase Auth.
 * Provides: user, profile, customer, loading, signIn, signUp, signOut, resetPassword
 */

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// ============================================================
// Types
// ============================================================

interface Profile {
  id: string
  email: string
  full_name: string
  whatsapp: string | null
  role: string
  is_active: boolean
  email_verified: boolean
  created_at: string
}

interface Customer {
  id: string
  profile_id: string
  whatsapp: string
  is_wholesale: boolean
}

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  customer: Customer | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (params: {
    email: string
    password: string
    fullName: string
    whatsapp: string
  }) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

// ============================================================
// Context
// ============================================================

const AuthContext = createContext<AuthContextType | null>(null)

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    customer: null,
    loading: true,
  })

  const fetchProfile = useCallback(async (userId: string) => {
    const client = supabase()
    if (!client) return null

    const { data } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return data
  }, [])

  const fetchCustomer = useCallback(async (userId: string) => {
    const client = supabase()
    if (!client) return null

    const { data } = await client
      .from('customers')
      .select('*')
      .eq('profile_id', userId)
      .single()

    return data
  }, [])

  const loadUserData = useCallback(
    async (user: User | null, session: Session | null) => {
      if (!user) {
        setState({ user: null, session: null, profile: null, customer: null, loading: false })
        return
      }

      const [profile, customer] = await Promise.all([
        fetchProfile(user.id),
        fetchCustomer(user.id),
      ])

      setState({ user, session, profile, customer, loading: false })
    },
    [fetchProfile, fetchCustomer],
  )

  // Listen for auth state changes
  useEffect(() => {
    const client = supabase()
    if (!client) {
      setState((s) => ({ ...s, loading: false }))
      return
    }

    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      loadUserData(session?.user ?? null, session)
    })

    // Listen for changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      loadUserData(session?.user ?? null, session)
    })

    return () => subscription.unsubscribe()
  }, [loadUserData])

  // ============================================================
  // Actions
  // ============================================================

  const signIn = useCallback(async (email: string, password: string) => {
    const client = supabase()
    if (!client) return { error: 'Supabase not configured' }

    const { error } = await client.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signUp = useCallback(
    async (params: { email: string; password: string; fullName: string; whatsapp: string }) => {
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

      if (error) return { error: error.message }

      // Profile and customer records are created automatically by the
      // handle_new_user trigger in supabase/migrations/00013_security_hardening.sql.
      // No manual INSERT is needed here.

      return { error: null }
    },
    [],
  )

  const signOut = useCallback(async () => {
    const client = supabase()
    if (!client) return
    await client.auth.signOut()
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const client = supabase()
    if (!client) return { error: 'Supabase not configured' }

    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    return { error: error?.message ?? null }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (state.user) {
      const [profile, customer] = await Promise.all([
        fetchProfile(state.user.id),
        fetchCustomer(state.user.id),
      ])
      setState((s) => ({ ...s, profile, customer }))
    }
  }, [state.user, fetchProfile, fetchCustomer])

  // ============================================================
  // Value
  // ============================================================

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ============================================================
// Hook
// ============================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
