import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  links: { to: string; label: string }[]
}

export function MobileMenu({ open, onClose, links }: MobileMenuProps) {
  const { user, profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div
        id="mobile-menu"
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-xs transform border-l border-border bg-surface p-6 shadow-2xl transition-transform duration-300 ease-out md:hidden',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-hidden={!open}
      >
        <div className="mb-8 flex items-center justify-between">
          <span className="text-lg font-bold">
            A2K<span className="text-primary">Store</span>
          </span>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Cerrar menú">
            <Icon name="close" size={20} />
          </Button>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Navegación móvil">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-4 py-3 text-base font-medium transition-colors',
                  isActive
                    ? 'bg-surface-elevated text-foreground'
                    : 'text-muted hover:bg-surface-elevated hover:text-foreground',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Sesión — en el header estas opciones se ocultan en móvil, así que
            deben vivir aquí o el cliente no podría iniciar sesión desde el teléfono */}
        <div className="mt-6 border-t border-border pt-6">
          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              className="mb-2 block rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-base font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              Panel de administración
            </Link>
          )}
          {user ? (
            <Link
              to="/mi-cuenta"
              onClick={onClose}
              className="block rounded-xl px-4 py-3 text-base font-medium text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
            >
              Mi cuenta
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="rounded-xl bg-primary px-4 py-3 text-center text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/registro"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-3 text-center text-base font-medium text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
              >
                Crear cuenta
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
