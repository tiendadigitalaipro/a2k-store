/**
 * Reset Password Page (Fase 19 — rediseño A2K)
 *
 * El enlace del correo llega a /reset-password (redirectTo del Forgot).
 * Con PKCE + detectSessionInUrl el cliente establece la sesión de
 * recuperación y emite PASSWORD_RECOVERY; aquí se define la clave nueva.
 */

import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AuthShell } from '@/components/auth/AuthShell'
import { Input } from '@/components/ui/Input'
import { useNoIndex } from '@/lib/seo'

export default function ResetPassword() {
  useNoIndex('Nueva contraseña')
  const navigate = useNavigate()

  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const client = supabase()
    if (!client) {
      setError('Supabase no está configurado en este despliegue.')
      return
    }

    // La sesión de recuperación puede tardar unos ms en establecerse.
    let elapsed = 0
    const timer = window.setInterval(async () => {
      elapsed += 400
      const { data } = await client.auth.getSession()
      if (data.session) {
        window.clearInterval(timer)
        setReady(true)
        return
      }
      if (elapsed > 5000) {
        window.clearInterval(timer)
        setError('Este enlace es inválido o ya expiró. Solicita uno nuevo.')
      }
    }, 400)

    return () => window.clearInterval(timer)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)
    const client = supabase()
    if (!client) {
      setError('Supabase no está configurado.')
      setLoading(false)
      return
    }

    const { error: updateError } = await client.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <AuthShell title="Contraseña actualizada" subtitle="Tu clave quedó lista">
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/15">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-muted">
            Ya puedes iniciar sesión con tu correo y tu nueva contraseña.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Iniciar sesión
          </button>
        </div>
      </AuthShell>
    )
  }

  if (!ready) {
    return (
      <AuthShell title="Restablecer contraseña" subtitle="Validando tu enlace seguro…">
        {error ? (
          <div className="space-y-5 text-center">
            <div className="rounded-xl border border-danger/25 bg-danger/10 p-4 text-sm text-danger">
              {error}
            </div>
            <Link
              to="/recuperar-password"
              className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Solicitar un enlace nuevo
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" aria-hidden="true" />
            <p className="text-sm text-muted">Un momento…</p>
          </div>
        )}
      </AuthShell>
    )
  }

  return (
    <AuthShell title="Nueva contraseña" subtitle="Crea una clave nueva para tu cuenta">
      {error && (
        <div className="mb-5 rounded-xl border border-danger/25 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="newPassword"
          type="password"
          label="Contraseña nueva"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={8}
          placeholder="Mínimo 8 caracteres"
        />
        <Input
          id="confirmNewPassword"
          type="password"
          label="Repetir contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={8}
          placeholder="Repite la clave"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-8px_rgba(197,160,89,0.55)] transition-all duration-200 hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </AuthShell>
  )
}
