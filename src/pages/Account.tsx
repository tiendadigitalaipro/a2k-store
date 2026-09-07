/**
 * Account Page
 */

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { getCustomerOrders } from '@/services/orders'
import { formatPrice } from '@/lib/format'
import type { Order, OrderStatus } from '@/lib/supabase/types'

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

export default function Account() {
  const { user, profile, customer, signOut } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState<string | null>(null)

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi Cuenta</h1>

      {/* Profile section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Perfil</h2>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Nombre</dt>
            <dd className="text-sm font-medium text-gray-900">{profile?.full_name || '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Email</dt>
            <dd className="text-sm font-medium text-gray-900">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">WhatsApp</dt>
            <dd className="text-sm font-medium text-gray-900">{customer?.whatsapp || profile?.whatsapp || '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Email verificado</dt>
            <dd className="text-sm font-medium text-gray-900">
              {profile?.email_verified ? (
                <span className="text-green-600">✓ Sí</span>
              ) : (
                <span className="text-amber-600">✗ No</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Orders section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mis Pedidos</h2>

        {ordersLoading ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Cargando pedidos...</p>
          </div>
        ) : ordersError ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-600">Error cargando pedidos: {ordersError}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Aún no tienes pedidos.</p>
            <Link
              to="/catalogo"
              className="mt-4 inline-block py-2 px-4 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Ir al catálogo
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="flex flex-col gap-2 rounded-xl border border-gray-100 p-4 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">{order.order_number}</span>
                  <Badge variant={statusVariants[order.status]}>{statusLabels[order.status]}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(order.created_at).toLocaleDateString('es-VE')}</span>
                  <span className="font-medium text-gray-900">{formatPrice(order.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Addresses section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Direcciones</h2>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Próximamente: gestión completa de direcciones</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Link
          to="/catalogo"
          className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Ir al catálogo
        </Link>
        <button
          onClick={signOut}
          className="py-3 px-4 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
