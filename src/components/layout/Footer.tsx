import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { SITE } from '@/config/site'

const footerLinks = {
  tienda: [
    { to: '/catalogo', label: 'Catálogo' },
    { to: '/catalogo?filter=nuevos', label: 'Nuevos' },
    { to: '/catalogo?filter=destacados', label: 'Destacados' },
  ],
  soporte: [
    { to: '/contacto', label: 'Contacto' },
    { to: '/envios', label: 'Envíos' },
    { to: '/devoluciones', label: 'Devoluciones' },
  ],
  legal: [
    { to: '/privacidad', label: 'Privacidad' },
    { to: '/terminos', label: 'Términos' },
  ],
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 text-xl font-bold">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                A
              </span>
              <span>
                A2K<span className="text-primary">Store</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {SITE.description}
            </p>
          </div>

          {Object.entries(footerLinks).map(([group, items]) => (
            <div key={group}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
                {group}
              </h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-8 sm:flex-row">
          <p className="text-sm text-muted">
            © {year} {SITE.name}. Todos los derechos reservados.
          </p>
          <p className="text-sm text-muted-foreground">{SITE.tagline}</p>
        </div>
      </Container>
    </footer>
  )
}
