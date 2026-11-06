/**
 * Forgot Password Page (Fase 19 — rediseño A2K)
 *
 * Envía el enlace de recuperación con resetPasswordForEmail y además
 * resuelve la duda clásica de "no recuerdo mi usuario": el usuario ES el
 * correo, con salida directa a WhatsApp de soporte.
 */

import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthShell } from '@/components/auth/AuthShell'
import { Input } from '@/components/ui/Input'
import { SITE } from '@/config/site'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: resetError } = await resetPassword(email.trim())

    if (resetError) {
      setError(resetError)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <AuthShell
        title="Revisa tu correo"
        subtitle="Te enviamos el enlace de recuperación"
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/15">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm text-muted">
            Si existe una cuenta con <strong className="text-foreground">{email}</strong> recibirás un
            enlace para crear una contraseña nueva. Revisa también spam o promociones.
          </p>
          <p className="rounded-xl border border-border bg-surface-elevated p-3 text-xs text-muted">
            <strong className="text-foreground">¿No recuerdas con qué correo te registraste?</strong>{' '}
            Tu usuario es tu correo. Escríbenos por WhatsApp y te ayudamos a ubicarlo.
          </p>
          <a
            href={`https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(
              'Hola A2K Store, necesito recuperar mi cuenta y no recuerdo mi correo de registro.',
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full rounded-xl border border-primary/40 bg-primary/10 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            Recuperar mi usuario por WhatsApp
          </a>
          <Link to="/login" className="block text-sm font-medium text-muted hover:text-foreground">
            ← Volver a iniciar sesión
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Ingresa tu correo y te enviamos un enlace para crear una nueva"
    >
      {error && (
        <div className="mb-5 rounded-xl border border-danger/25 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}

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
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-8px_rgba(197,160,89,0.55)] transition-all duration-200 hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Enviando…' : 'Enviar enlace de recuperación'}
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center">
        <p className="text-xs text-muted">
          <strong className="text-foreground">¿No recuerdas tu usuario?</strong> Tu usuario es el
          correo con el que te registraste. Si no lo recuerdas,{' '}
          <a
            href={`https://wa.me/${SITE.contact.whatsapp}?text=${encodeURIComponent(
              'Hola A2K Store, necesito recuperar mi cuenta.',
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:text-accent"
          >
            escríbenos por WhatsApp
          </a>
          .
        </p>
        <Link to="/login" className="inline-block text-sm font-medium text-muted hover:text-foreground">
          ← Volver a iniciar sesión
        </Link>
      </div>
    </AuthShell>
  )
}
