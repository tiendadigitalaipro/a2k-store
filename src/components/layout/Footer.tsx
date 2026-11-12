import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { SITE } from '@/config/site'
import { getActiveCategories } from '@/services/categories'
import type { Category } from '@/types'

const tiendaLinks = [
  { to: '/catalogo', label: 'Catálogo completo' },
  { to: '/catalogo?sort=newest', label: 'Nuevos ingresos' },
  { to: '/catalogo?featured=true', label: 'Destacados' },
  { to: '/catalogo?inStock=true', label: 'Disponibles ahora' },
]

export function Footer() {
  const year = new Date().getFullYear()
  // Enlazado interno (Fase 20 SEO): categorías reales desde la base de datos,
  // con URL propia /categoria/:slug, rastreables desde cualquier página.
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    let cancelled = false
    getActiveCategories().then(({ data }) => {
      if (!cancelled && data) setCategories(data.slice(0, 6))
    })
    return () => {
      cancelled = true
    }
  }, [])

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
            <p className="mt-4 text-sm text-muted">
              {SITE.business.pickup}, {SITE.business.market} · Horario: {SITE.business.hours}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Categorías
            </h3>
            <ul className="space-y-3">
              {categories.length === 0 && (
                <li>
                  <Link
                    to="/catalogo"
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    Ver todo el catálogo
                  </Link>
                </li>
              )}
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    to={`/categoria/${category.slug}`}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Tienda
            </h3>
            <ul className="space-y-3">
              {tiendaLinks.map((item) => (
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

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={`https://wa.me/${SITE.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  WhatsApp {SITE.contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SITE.contact.email}`}
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  {SITE.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${SITE.contact.whatsappSecondary}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted transition-colors hover:text-foreground"
                >
                  Ventas corporativas
                </a>
              </li>
            </ul>
          </div>
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
