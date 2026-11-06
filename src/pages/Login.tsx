/**
 * Login Page (Fase 19 — rediseño A2K)
 *
 * Dark/gold luxury theme, Google OAuth and email/password.
 * Supports ?next=/ruta to return the user where he was heading.
 */

import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthShell } from '@/components/auth/AuthShell'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { Input } from '@/components/ui/Input'

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const next = params.get('next')
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await signIn(email.trim(), password)

    if (signInError) {
      setError(
        signInError.toLowerCase().includes('invalid login')
          ? 'Correo o contraseña incorrectos.'
          : signInError.toLowerCase().includes('not confirmed')
            ? 'Confirma tu correo antes de iniciar sesión.'
            : signInError,
      )
      setLoading(false)
      return
    }

    navigate(safeNext)
  }

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Accede a tu cuenta para comprar y ver tus pedidos"
    >
      {error && (
        <div className="mb-5 rounded-xl border border-danger/25 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <GoogleButton redirectTo={safeNext !== '/' ? `/auth/callback?next=${encodeURIComponent(safeNext)}` : undefined} />

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">o con tu correo</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="tucorreo@gmail.com"
        />
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
              Contraseña
            </label>
            <Link
              to="/recuperar-password"
              className="text-xs font-medium text-primary transition-colors hover:text-accent"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-8px_rgba(197,160,89,0.55)] transition-all duration-200 hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="font-semibold text-primary hover:text-accent">
          Regístrate gratis
        </Link>
      </p>
    </AuthShell>
  )
}
