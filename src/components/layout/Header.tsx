import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'
import { MobileMenu } from './MobileMenu'
import { CartBadge } from '@/components/cart/CartBadge'
import { useAuth } from '@/context/AuthContext'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catálogo' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border glass">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-foreground"
            aria-label="A2K Store - Inicio"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              A
            </span>
            <span>
              A2K<span className="text-primary">Store</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navegación principal">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
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

          <div className="flex items-center gap-2">
            <CartBadge />

            {user ? (
              <Link
                to="/mi-cuenta"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                aria-label="Mi cuenta"
              >
                <Icon name="user" size={18} />
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-elevated hover:text-foreground transition-colors md:block"
              >
                Iniciar sesión
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <Icon name="menu" size={20} />
            </Button>
          </div>
        </div>
      </Container>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} links={links} />
    </header>
  )
}
