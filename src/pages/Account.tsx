/**
 * Account Page
 */

import { useAuth } from '@/context/AuthContext'
import { Link } from 'react-router-dom'

export default function Account() {
  const { user, profile, customer, signOut } = useAuth()

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
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Próximamente: historial de pedidos</p>
        </div>
      </div>

      {/* Addresses section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Direcciones</h2>
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">Próximamente: gestión de direcciones</p>
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
