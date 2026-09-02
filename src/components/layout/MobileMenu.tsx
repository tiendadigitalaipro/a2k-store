import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
  links: { to: string; label: string }[]
}

export function MobileMenu({ open, onClose, links }: MobileMenuProps) {
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
      </div>
    </>
  )
}
