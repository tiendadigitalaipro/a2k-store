/**
 * Admin Orders (Fase 19)
 *
 * Pedidos con cambio de estado. El trigger trg_orders_log_status_change
 * registra el historial y las fechas clave (paid_at, shipped_at…).
 */

import { useEffect, useMemo, useState } from 'react'
import {
  listAdminOrders,
  updateOrderStatus,
  type AdminOrder,
} from '@/services/admin'
import { formatPrice } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const ORDER_LABELS: Record<string, string> = {
  pending_payment: 'Pago pendiente',
  payment_verification: 'Verificando pago',
  payment_approved: 'Pago aprobado',
  preparing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  cancelled_expired: 'Expirado',
  payment_rejected: 'Pago rechazado',
  returned: 'Devuelto',
}

/** Estados a los que el dueño puede mover un pedido. */
const NEXT_STATUSES = [
  'payment_verification',
  'payment_approved',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
]

function badgeVariant(status: string): 'warning' | 'primary' | 'success' | 'danger' | 'outline' {
  if (status === 'delivered') return 'success'
  if (['cancelled', 'cancelled_expired', 'payment_rejected', 'returned'].includes(status)) return 'danger'
  if (['payment_approved', 'preparing', 'shipped'].includes(status)) return 'primary'
  return 'warning'
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'abiertos' | 'todos'>('abiertos')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const { data, error: e } = await listAdminOrders()
    if (e) setError(e)
    else setOrders(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const changeStatus = async (order: AdminOrder, status: string) => {
    setBusyId(order.id)
    setError(null)
    const { error: e } = await updateOrderStatus(order.id, status)
    if (e) setError(e)
    await load()
    setBusyId(null)
  }

  const visible = useMemo(() => {
    if (filter === 'todos') return orders
    return orders.filter((o) =>
      ['pending_payment', 'payment_verification', 'payment_approved', 'preparing', 'shipped'].includes(o.status),
    )
  }, [orders, filter])

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString('es-VE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Pedidos</h1>
          <p className="mt-1 text-sm text-muted">
            {loading ? 'Cargando…' : `${visible.length} pedidos en vista (${orders.length} en total)`}
          </p>
        </div>
        <div className="flex gap-1">
          {(['abiertos', 'todos'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                filter === f ? 'bg-primary/15 text-primary' : 'text-muted hover:bg-surface-elevated',
              )}
            >
              {f === 'abiertos' ? 'En proceso' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-danger/25 bg-danger/10 p-3 text-sm text-danger">
          {error}{' '}
          <button className="underline" onClick={() => setError(null)}>
            cerrar
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 font-medium">Pedido</th>
              <th className="px-4 py-3 font-medium">Entrega</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Mover a</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Cargando pedidos…
                </td>
              </tr>
            )}
            {!loading && visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  No hay pedidos aquí todavía. Cuando un cliente confirme su compra, aparecerá en esta lista.
                </td>
              </tr>
            )}
            {visible.map((o) => (
              <tr key={o.id} className="border-b border-border/60 last:border-0 hover:bg-surface-elevated/40">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{fmtDate(o.created_at)}</p>
                </td>
                <td className="px-4 py-3 text-xs text-muted">
                  {o.delivery_method === 'pickup' ? 'Retiro en tienda' : 'Envío a domicilio'}
                </td>
                <td className="px-4 py-3 font-medium">{formatPrice(Number(o.total))}</td>
                <td className="px-4 py-3">
                  <Badge variant={badgeVariant(o.status)}>{ORDER_LABELS[o.status] ?? o.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <select
                      value=""
                      disabled={busyId === o.id}
                      onChange={(e) => e.target.value && changeStatus(o, e.target.value)}
                      className="rounded-lg border border-border bg-surface-elevated px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
                      aria-label={`Cambiar estado de ${o.order_number}`}
                    >
                      <option value="">{busyId === o.id ? 'Guardando…' : 'Cambiar estado…'}</option>
                      {NEXT_STATUSES.filter((s) => s !== o.status).map((s) => (
                        <option key={s} value={s}>
                          {ORDER_LABELS[s] ?? s}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Cada cambio de estado queda registrado en el historial del pedido con fecha y usuario (automático por base de datos).
      </p>
    </div>
  )
}
