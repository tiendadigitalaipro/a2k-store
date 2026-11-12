/**
 * Account Page (Fase 19 — rediseño A2K)
 *
 * Tema oscuro/dorado + cambio de contraseña en línea
 * (updateUser con la sesión activa, sin necesidad de recuperar por correo).
 */

import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import { getCustomerOrders } from '@/services/orders'
import { formatPrice } from '@/lib/format'
import type { Order, OrderStatus } from '@/lib/supabase/types'
import { useNoIndex } from '@/lib/seo'

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: 'Pendiente de pago',
  payment_verification: 'Verificando pago',
  payment_approved: 'Pago aprobado',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  cancelled_expired: 'Cancelado por expiración',
  payment_rejected: 'Pago rechazado',
  returned: 'Devuelto',
}

const statusVariants: Record<OrderStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline'> = {
  pending_payment: 'warning',
  payment_verification: 'warning',
  payment_approved: 'primary',
  preparing: 'primary',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'danger',
  cancelled_expired: 'danger',
  payment_rejected: 'danger',
  returned: 'danger',
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-2xl border border-border bg-surface p-6">
      <h2 className="mb-4 font-display text-lg font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  )
}

export default function Account() {
  useNoIndex('Mi cuenta')
  const { user, profile, customer, signOut } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)

  // Cambio de contraseña
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    if (!customer) {
      setOrdersLoading(false)
      return
    }

    getCustomerOrders(customer.id, { limit: 20 })
      .then(({ data, error }) => {
        if (error) {
          setOrdersError(error)
        } else {
          setOrders(data ?? [])
        }
        setOrdersLoading(false)
      })
  }, [customer])

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: 'Las contraseñas no coinciden.' })
      return
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ ok: false, text: 'La contraseña debe tener al menos 8 caracteres.' })
      return
    }
    setPasswordSaving(true)
    const client = supabase()
    if (!client) {
      setPasswordMsg({ ok: false, text: 'Supabase no está configurado.' })
      setPasswordSaving(false)
      return
    }
    const { error } = await client.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordMsg({ ok: false, text: error.message })
    } else {
      setPasswordMsg({ ok: true, text: 'Contraseña actualizada.' })
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
    }
    setPasswordSaving(false)
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 font-display text-2xl font-semibold">Mi Cuenta</h1>

      {/* Perfil */}
      <Card title="Perfil">
        <dl className="space-y-3">
          <div className="flex justify-between gap-4">
            <dt className="text-sm text-muted">Nombre</dt>
            <dd className="text-sm font-medium text-foreground">{profile?.full_name || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-sm text-muted">Email</dt>
            <dd className="truncate text-sm font-medium text-foreground">{user?.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-sm text-muted">WhatsApp</dt>
            <dd className="text-sm font-medium text-foreground">{customer?.whatsapp || profile?.whatsapp || '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-sm text-muted">Email verificado</dt>
            <dd className="text-sm font-medium">
              {profile?.email_verified ? (
                <span className="text-success">Sí</span>
              ) : (
                <span className="text-warning">Pendiente</span>
              )}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Seguridad */}
      <Card title="Seguridad">
        {passwordMsg && (
          <p
            className={`mb-4 rounded-xl border p-3 text-sm ${
              passwordMsg.ok
                ? 'border-success/25 bg-success/10 text-success'
                : 'border-danger/25 bg-danger/10 text-danger'
            }`}
          >
            {passwordMsg.text}
          </p>
        )}
        {showPasswordForm ? (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              id="acc-new-password"
              type="password"
              label="Contraseña nueva"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
            <Input
              id="acc-confirm-password"
              type="password"
              label="Repetir contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Repite la clave"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={passwordSaving}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {passwordSaving ? 'Guardando…' : 'Guardar contraseña'}
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="rounded-xl border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
          >
            Cambiar contraseña
          </button>
        )}
      </Card>

      {/* Pedidos */}
      <Card title="Mis Pedidos">
        {ordersLoading ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted">Cargando pedidos…</p>
          </div>
        ) : ordersError ? (
          <div className="py-8 text-center">
            <p className="text-sm text-danger">Error cargando pedidos: {ordersError}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted">Aún no tienes pedidos.</p>
            <Link
              to="/catalogo"
              className="mt-4 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-2 rounded-xl border border-border p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{order.order_number}</span>
                  <Badge variant={statusVariants[order.status]}>{statusLabels[order.status]}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>{new Date(order.created_at).toLocaleDateString('es-VE')}</span>
                  <span className="font-medium text-foreground">{formatPrice(order.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Direcciones */}
      <Card title="Direcciones">
        <p className="py-4 text-center text-sm text-muted">
          Las direcciones se cargan durante el checkout (envío a domicilio o retiro en Ocumare del Tuy).
        </p>
      </Card>

      {/* Acciones */}
      <div className="flex flex-col gap-3">
        <Link
          to="/catalogo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Ir al catálogo
        </Link>
        <button
          onClick={signOut}
          className="rounded-xl border border-border px-4 py-3 font-medium text-muted transition-colors hover:border-primary/40 hover:text-foreground"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
