import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { ProductImage } from '@/components/product/ProductImage'
import { ProductPrice } from '@/components/product/ProductPrice'
import { ProductBadges } from '@/components/product/ProductBadge'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { getProductBySlug, products } from '@/data/products'
import { calculateDiscount } from '@/lib/format'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const product = slug ? getProductBySlug(slug) : undefined

  if (!product) {
    return (
      <Container className="flex flex-col items-center justify-center py-32 text-center">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-2xl font-bold text-foreground">Producto no encontrado</h1>
        <p className="mt-2 text-muted">El producto que buscas no existe o fue removido.</p>
        <Button onClick={() => navigate('/catalogo')} className="mt-6">
          Volver al catálogo
        </Button>
      </Container>
    )
  }

  const discount = calculateDiscount(product.price, product.compareAtPrice)
  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 3)

  return (
    <Container className="py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
          <Icon name="chevron-right" size={16} className="rotate-180" />
          Volver
        </Button>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
            <ProductBadges
              isNew={product.isNew}
              isFeatured={product.isFeatured}
              discount={discount}
            />
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              aspect="square"
              className="rounded-2xl"
            />
          </div>

          <div className="flex flex-col">
            <div className="mb-1 text-sm font-medium uppercase tracking-wider text-primary">
              {product.categoryName}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted">{product.description}</p>

            <div className="mt-8">
              <ProductPrice
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                currency={product.currency}
              />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <AddToCartButton product={product} size="lg" className="min-w-[180px]" />
              <Badge variant="outline" className="h-12 px-4">
                Stock: {product.stock} unidades
              </Badge>
            </div>

            <div className="mt-10 space-y-4 border-t border-border pt-8 text-sm text-muted">
              <p>
                <span className="font-medium text-foreground">SKU:</span> {product.sku}
              </p>
              <p>
                <span className="font-medium text-foreground">Categoría:</span>{' '}
                {product.categoryName}
              </p>
              {product.rating && (
                <p className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Valoración:</span>
                  <span className="flex items-center gap-1 text-warning">
                    <Icon name="star" size={16} className="fill-current" />
                    {product.rating} ({product.reviewCount} reseñas)
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Productos relacionados</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, index) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
              >
                <Link to={`/producto/${p.slug}`} className="group block">
                  <ProductImage src={p.imageUrl} alt={p.name} aspect="square" />
                  <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary">
                    {p.name}
                  </h3>
                  <ProductPrice
                    price={p.price}
                    compareAtPrice={p.compareAtPrice}
                    currency={p.currency}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </Container>
  )
}
