/**
 * Register Page (Fase 19 — rediseño A2K)
 *
 * Dark/gold theme, Google OAuth + registro por correo con WhatsApp.
 * El trigger handle_new_user crea perfil + cliente automáticamente.
 */

import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { AuthShell } from '@/components/auth/AuthShell'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { Input } from '@/components/ui/Input'
import { useNoIndex } from '@/lib/seo'

export default function Register() {
  useNoIndex('Crear cuenta')
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
    const { error: signUpError } = await signUp({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      whatsapp: whatsapp.trim(),
    })

    if (signUpError) {
      setError(
        signUpError.toLowerCase().includes('already registered')
          ? 'Ese correo ya está registrado. Inicia sesión o recupera tu contraseña.'
          : signUpError,
      )
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <AuthShell
        title="¡Cuenta creada!"
        subtitle="Ya casi estás listo para comprar"
      >
        <div className="space-y-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/40 bg-primary/15">
            <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-muted">
            Te enviamos un correo de confirmación a <strong className="text-foreground">{email}</strong>.
            Confírmalo y luego inicia sesión.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Ir a iniciar sesión
          </button>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Regístrate para comprar con despacho a todo Venezuela"
    >
      {error && (
        <div className="mb-5 rounded-xl border border-danger/25 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <GoogleButton label="Registrarme con Google" />

      <div className="my-6 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">o regístrate con correo</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="fullName"
          label="Nombre completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
          placeholder="Tu nombre y apellido"
        />
        <Input
          id="whatsapp"
          label="WhatsApp de contacto"
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          required
          autoComplete="tel"
          inputMode="numeric"
          pattern="[0-9]{10,15}"
          title="Solo números, código de área incluido (ej. 584161234567)"
          placeholder="584161234567"
        />
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
        <div className="grid grid-cols-2 gap-3">
          <Input
            id="password"
            type="password"
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
            placeholder="Mínimo 8 caracteres"
          />
          <Input
            id="confirmPassword"
            type="password"
            label="Repetir"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
            placeholder="Repite la clave"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-8px_rgba(197,160,89,0.55)] transition-all duration-200 hover:bg-primary-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Creando cuenta…' : 'Crear mi cuenta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-accent">
          Inicia sesión
        </Link>
      </p>
    </AuthShell>
  )
}
