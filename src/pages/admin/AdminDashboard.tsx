/**
 * Admin Dashboard (Fase 19)
 *
 * Resumen del negocio: catálogo, pedidos y ventas confirmadas.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAdminStats, type AdminStats } from '@/services/admin'
import { formatPrice } from '@/lib/format'
import { Icon, type IconName } from '@/components/ui/Icon'

function StatCard({ icon, label, value, hint }: { icon: IconName; label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
        <Icon name={icon} size={17} />
      </div>
      <p className="font-display text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStats()
      .then(({ data, error: e }) => {
        if (e) setError(e)
        else setStats(data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="rounded-2xl border border-danger/25 bg-danger/10 p-6 text-sm text-danger">
        {error ?? 'No se pudieron cargar las estadísticas.'}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Resumen</h1>
        <p className="mt-1 text-sm text-muted">El estado de A2K Store en una sola vista.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon="wallet"
          label="Ventas confirmadas"
          value={formatPrice(stats.revenue)}
          hint="Pedidos aprobados, en preparación, enviados y entregados"
        />
        <StatCard
          icon="cart"
          label="Pedidos totales"
          value={String(stats.totalOrders)}
          hint={`${stats.pendingOrders} en proceso · ${stats.deliveredOrders} entregados`}
        />
        <StatCard
          icon="package"
          label="Productos activos"
          value={`${stats.activeProducts} / ${stats.totalProducts}`}
          hint="Publicados en el catálogo"
        />
        <StatCard
          icon="image"
          label="Sin existencias"
          value={String(stats.outOfStock)}
          hint="Activos pero con stock 0 — reponer o pausar"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          to="/admin/productos"
          className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/40"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
              <Icon name="package" size={19} />
            </div>
            <Icon name="arrow-right" size={18} className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <h2 className="font-display text-lg font-semibold">Productos e imágenes</h2>
          <p className="mt-1 text-sm text-muted">
            Crea productos, edita precios y existencias, y sube las fotos de lo que vayas trayendo.
          </p>
        </Link>

        <Link
          to="/admin/pedidos"
          className="group rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-primary/40"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
              <Icon name="cart" size={19} />
            </div>
            <Icon name="arrow-right" size={18} className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <h2 className="font-display text-lg font-semibold">Pedidos</h2>
          <p className="mt-1 text-sm text-muted">
            Revisa los pedidos, confirma pagos y mueve el estado hasta la entrega.
          </p>
        </Link>
      </div>
    </div>
  )
}
