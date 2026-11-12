/**
 * Auth Callback (Fase 19)
 *
 * Landing for Google OAuth (PKCE). The Supabase client (detectSessionInUrl)
 * exchanges the code automatically on load; this page just waits for the
 * session and redirects. Supports ?next=/ruta to continue after login
 * (e.g. /admin). On error shows a clean message with way back.
 */

import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AuthShell } from '@/components/auth/AuthShell'
import { useNoIndex } from '@/lib/seo'

function safeNext(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/'
  return next
}

export default function AuthCallback() {
  useNoIndex('Conectando con Google')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const oauthError = params.get('error_description') ?? params.get('error')
    if (oauthError) {
      setError(
        oauthError.includes('email address not confirmed')
          ? 'Tu correo aún no está confirmado. Revisa tu bandeja de entrada.'
          : 'No se pudo completar el inicio de sesión con Google. Intenta de nuevo.',
      )
      return
    }

    const client = supabase()
    if (!client) {
      setError('Supabase no está configurado en este despliegue.')
      return
    }

    let elapsed = 0
    const timer = window.setInterval(async () => {
      elapsed += 500
      const { data } = await client.auth.getSession()
      if (data.session) {
        window.clearInterval(timer)
        navigate(safeNext(params.get('next')), { replace: true })
        return
      }
      if (elapsed > 8000) {
        window.clearInterval(timer)
        setError('La sesión con Google tardó demasiado. Vuelve a intentarlo.')
      }
    }, 500)

    return () => window.clearInterval(timer)
  }, [navigate, params])

  return (
    <AuthShell title="Iniciando sesión…" subtitle="Estamos completando tu acceso con Google">
      {error ? (
        <div className="space-y-5 text-center">
          <div className="rounded-xl border border-danger/25 bg-danger/10 p-4 text-sm text-danger">
            {error}
          </div>
          <Link
            to="/login"
            className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Volver a iniciar sesión
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-6">
          <span
            className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
            aria-hidden="true"
          />
          <p className="text-sm text-muted">Un momento…</p>
        </div>
      )}
    </AuthShell>
  )
}
