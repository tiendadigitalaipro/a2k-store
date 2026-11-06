/**
 * Admin Layout (Fase 19)
 *
 * Casco del panel del dueño. La ruta ya está protegida por
 * ProtectedRoute requiredRole="admin" (rol admin/superadmin activo),
 * y RLS respalda cada escritura en la base de datos.
 */

import { NavLink, Link, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

const nav: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/admin', label: 'Resumen', icon: 'dashboard', end: true },
  { to: '/admin/productos', label: 'Productos', icon: 'package' },
  { to: '/admin/pedidos', label: 'Pedidos', icon: 'cart' },
]

export function AdminLayout() {
  const { profile, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
              title="Volver a la tienda"
            >
              <Icon name="arrow-left" size={16} />
              <span className="hidden sm:inline">Tienda</span>
            </Link>
            <span className="h-5 w-px bg-border" aria-hidden="true" />
            <span className="font-display text-lg font-semibold tracking-wide">
              A2K<span className="text-primary">Admin</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted md:inline">
              {profile?.full_name || profile?.email}
            </span>
            <button
              onClick={() => signOut()}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary/40 hover:text-foreground"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Tabs */}
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2" aria-label="Panel">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted hover:bg-surface-elevated hover:text-foreground',
                )
              }
            >
              <Icon name={item.icon} size={15} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
