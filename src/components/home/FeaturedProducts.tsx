import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ProductGrid } from '@/components/product/ProductGrid'
import { getFeaturedProducts } from '@/data/products'

export function FeaturedProducts() {
  const featured = getFeaturedProducts(4)

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

        <ProductGrid products={featured} />
      </Container>
    </section>
  )
}
