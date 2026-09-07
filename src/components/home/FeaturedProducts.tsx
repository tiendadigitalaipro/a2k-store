import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ProductGrid } from '@/components/product/ProductGrid'
import { getFeaturedProducts } from '@/services/products'
import type { Product } from '@/types'

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    getFeaturedProducts(4).then(({ data, error }) => {
      if (cancelled) return
      if (!error && data) {
        setProducts(data)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="py-16 md:py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Destacados
            </h2>
            <p className="mt-2 text-muted">Los productos más elegidos por nuestros clientes.</p>
          </div>
          <Link to="/catalogo">
            <Button variant="secondary">
              Ver todo
              <Icon name="arrow-right" size={18} />
            </Button>
          </Link>
        </motion.div>

        {loading ? (
          <div className="py-12 text-center text-muted">Cargando destacados...</div>
        ) : (
          <ProductGrid products={products} />
        )}
      </Container>
    </section>
  )
}
