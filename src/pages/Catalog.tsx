import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Icon } from '@/components/ui/Icon'
import { ProductGrid } from '@/components/product/ProductGrid'
import { products } from '@/data/products'
import { categories } from '@/data/categories'

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams()
  const categorySlug = searchParams.get('categoria') ?? undefined
  const query = searchParams.get('q') ?? ''

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = categorySlug ? product.categorySlug === categorySlug : true
      const search = query.toLowerCase()
      const matchesQuery =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.shortDescription.toLowerCase().includes(search) ||
        product.categoryName?.toLowerCase().includes(search)
      return matchesCategory && matchesQuery
    })
  }, [categorySlug, query])

  const setCategory = (slug: string | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (slug) {
      next.set('categoria', slug)
    } else {
      next.delete('categoria')
    }
    setSearchParams(next, { replace: true })
  }

  const setQuery = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set('q', value)
    } else {
      next.delete('q')
    }
    setSearchParams(next, { replace: true })
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
          Catálogo
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Todos los productos
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Explora nuestra selección de tecnología, audio, wearables y accesorios premium.
        </p>
      </motion.div>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory(undefined)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !categorySlug
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-surface text-muted hover:bg-surface-elevated'
            }`}
          >
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setCategory(category.slug)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                categorySlug === category.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-surface text-muted hover:bg-surface-elevated'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

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
      </div>

      <ProductGrid products={filteredProducts} />
    </Container>
  )
}
