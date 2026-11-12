import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Icon } from '@/components/ui/Icon'
import { ProductGrid } from '@/components/product/ProductGrid'
import { getActiveProducts } from '@/services/products'
import { getActiveCategories } from '@/services/categories'
import { SITE } from '@/config/site'
import {
  useSEO,
  breadcrumbJsonLd,
  itemListJsonLd,
  truncate,
} from '@/lib/seo'
import type { Product, Category } from '@/types'

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'rating'

function sortProducts(items: Product[], sort: SortOption): Product[] {
  const sorted = [...items]
  switch (sort) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price)
    case 'newest':
      return sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
    case 'rating':
      return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    case 'relevance':
    default:
      return sorted
  }
}

export default function Catalog() {
  // La misma página sirve /catalogo (con filtros por query) y /categoria/:slug (URL propia, Fase 20 SEO).
  const routeParams = useParams<{ slug?: string }>()
  const routeSlug = routeParams.slug
  const [searchParams, setSearchParams] = useSearchParams()
  const categorySlug = routeSlug ?? searchParams.get('categoria') ?? undefined
  const query = searchParams.get('q') ?? ''
  const sort = (searchParams.get('sort') as SortOption) ?? 'relevance'
  const featuredOnly = searchParams.get('featured') === 'true'
  const newOnly = searchParams.get('new') === 'true'
  const inStockOnly = searchParams.get('inStock') === 'true'
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [productsResult, categoriesResult] = await Promise.all([
        getActiveProducts(),
        getActiveCategories(),
      ])

      if (cancelled) return

      if (productsResult.error) {
        setError(productsResult.error)
      } else {
        setProducts(productsResult.data)
      }

      if (categoriesResult.error) {
        setError((prev) => prev ?? categoriesResult.error)
      } else {
        setCategories(categoriesResult.data)
      }

      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (categorySlug && product.categorySlug !== categorySlug) return false
      if (featuredOnly && !product.isFeatured) return false
      if (newOnly && !product.isNew) return false
      if (inStockOnly && product.stock <= 0) return false
      if (minPrice !== undefined && product.price < minPrice) return false
      if (maxPrice !== undefined && product.price > maxPrice) return false

      if (query) {
        const search = query.toLowerCase()
        const matchesName = product.name.toLowerCase().includes(search)
        const matchesDesc = product.description.toLowerCase().includes(search)
        const matchesShortDesc = product.shortDescription.toLowerCase().includes(search)
        const matchesSku = product.sku.toLowerCase().includes(search)
        const matchesCategory = product.categoryName?.toLowerCase().includes(search) ?? false
        const matchesTags = product.tags.some((tag) => tag.toLowerCase().includes(search))
        const matchesVariant =
          product.variants?.some(
            (v) =>
              v.name.toLowerCase().includes(search) ||
              v.sku.toLowerCase().includes(search),
          ) ?? false

        if (
          !matchesName &&
          !matchesDesc &&
          !matchesShortDesc &&
          !matchesSku &&
          !matchesCategory &&
          !matchesTags &&
          !matchesVariant
        ) {
          return false
        }
      }

      return true
    })
  }, [products, categorySlug, query, featuredOnly, newOnly, inStockOnly, minPrice, maxPrice])

  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, sort),
    [filteredProducts, sort],
  )

  // SEO (Fase 20): título/descripción únicos por categoría + JSON-LD ItemList y Breadcrumb.
  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === categorySlug),
    [categories, categorySlug],
  )
  const seoTitle = activeCategory
    ? activeCategory.seoTitle ?? `${activeCategory.name} — Comprar online en Venezuela`
    : query
      ? `Resultados para “${query}”`
      : 'Catálogo completo — Tecnología, hogar y más'
  const seoDescription = activeCategory
    ? activeCategory.seoDescription ??
      truncate(
        `${activeCategory.name}: ${activeCategory.description} Productos disponibles en ${SITE.name} con atención por WhatsApp y envío nacional.`,
        158,
      )
    : 'Explora el catálogo completo de A2K Store: calzados, electrónica, hogar, ropa deportiva, repuestos y ropa para niños con envío nacional.'
  const seoJsonLd = useMemo(() => {
    const jsonLd: ReturnType<typeof breadcrumbJsonLd>[] = []
    const crumbs = [{ name: 'Inicio', path: '/' }]
    if (activeCategory) {
      crumbs.push({ name: activeCategory.name, path: `/categoria/${activeCategory.slug}` })
      jsonLd.push(breadcrumbJsonLd(crumbs))
      if (sortedProducts.length > 0) {
        jsonLd.push(
          itemListJsonLd(
            sortedProducts.slice(0, 20).map((p) => ({ name: p.name, slug: p.slug })),
            activeCategory.name,
          ),
        )
      }
    }
    return jsonLd
  }, [activeCategory, sortedProducts])

  useSEO({
    title: seoTitle,
    description: seoDescription,
    path: activeCategory ? `/categoria/${activeCategory.slug}` : '/catalogo',
    jsonLd: seoJsonLd,
  })

  const setParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next, { replace: true })
  }

  const setQuery = (value: string) => setParam('q', value || undefined)
  const setSort = (value: SortOption) => setParam('sort', value === 'relevance' ? undefined : value)
  const toggleParam = (key: string) => {
    const current = searchParams.get(key)
    setParam(key, current === 'true' ? undefined : 'true')
  }

  const activeFilterCount = [
    featuredOnly,
    newOnly,
    inStockOnly,
    minPrice !== undefined,
    maxPrice !== undefined,
  ].filter(Boolean).length

  const clearFilters = () => {
    const next = new URLSearchParams()
    if (categorySlug) next.set('categoria', categorySlug)
    if (query) next.set('q', query)
    setSearchParams(next, { replace: true })
  }

  if (loading) {
    return (
      <Container className="py-20 text-center">
        <p className="text-muted">Cargando catálogo...</p>
      </Container>
    )
  }

  return (
    <Container className="py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10"
      >
        <Badge variant="primary" className="mb-4">
          {activeCategory ? activeCategory.name : 'Catálogo'}
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          {activeCategory ? activeCategory.name : 'Todos los productos'}
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          {activeCategory
            ? activeCategory.description
            : 'Explora nuestra selección de calzados, electrónica, hogar, ropa deportiva, repuestos y ropa para niños.'}
        </p>
      </motion.div>

      {error && (
        <div className="mb-6 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          Error cargando el catálogo: {error}
        </div>
      )}

      {/* Filters bar */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Category pills — enlaces <a> rastreables por Google (Fase 20 SEO) */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/catalogo"
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !categorySlug
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-surface text-muted hover:bg-surface-elevated'
            }`}
          >
            Todos
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categoria/${category.slug}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                categorySlug === category.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-surface text-muted hover:bg-surface-elevated'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* Search + Sort */}
        <div className="flex gap-3">
          <div className="relative w-full max-w-sm">
            <Icon
              name="search"
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="search"
              placeholder="Buscar productos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              aria-label="Buscar productos"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
            aria-label="Ordenar por"
          >
            <option value="relevance">Relevancia</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="newest">Más recientes</option>
            <option value="rating">Mejor valorados</option>
          </select>
        </div>
      </div>

      {/* Quick filters */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => toggleParam('featured')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            featuredOnly
              ? 'bg-warning/20 text-warning border border-warning/30'
              : 'border border-border bg-surface text-muted hover:bg-surface-elevated'
          }`}
        >
          Destacados
        </button>
        <button
          onClick={() => toggleParam('new')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            newOnly
              ? 'bg-primary-subtle text-primary border border-primary/20'
              : 'border border-border bg-surface text-muted hover:bg-surface-elevated'
          }`}
        >
          Nuevos
        </button>
        <button
          onClick={() => toggleParam('inStock')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            inStockOnly
              ? 'bg-success/20 text-success border border-success/30'
              : 'border border-border bg-surface text-muted hover:bg-surface-elevated'
          }`}
        >
          En stock
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="rounded-full px-3 py-1 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
          >
            Limpiar filtros ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="mb-6 text-sm text-muted">
        {sortedProducts.length}{' '}
        {sortedProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
      </p>

      <ProductGrid products={sortedProducts} />
    </Container>
  )
}
