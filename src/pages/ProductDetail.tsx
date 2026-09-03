import { useState, useMemo } from 'react'
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
import type { ProductVariant } from '@/types'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const product = slug ? getProductBySlug(slug) : undefined

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product?.variants?.[0] ?? null,
  )
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Build gallery: main image + gallery images
  const gallery = useMemo(() => {
    if (!product) return []
    const images = [product.imageUrl, ...(product.gallery ?? [])]
    // Deduplicate
    return [...new Set(images)]
  }, [product])

  // Current display values based on variant selection
  const currentPrice = selectedVariant?.price ?? product?.price ?? 0
  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0
  const currentSku = selectedVariant?.sku ?? product?.sku ?? ''
  const isOutOfStock = currentStock <= 0
  const isActive = selectedVariant ? (selectedVariant as { active?: boolean }).active !== false : true

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

  const discount = calculateDiscount(currentPrice, product.compareAtPrice)
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
          {/* Image gallery */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
              <ProductBadges
                isNew={product.isNew}
                isFeatured={product.isFeatured}
                discount={discount}
              />
              <ProductImage
                src={gallery[selectedImageIndex] ?? product.imageUrl}
                alt={`${product.name}${selectedVariant ? ` — ${selectedVariant.name}` : ''}`}
                aspect="square"
                className="rounded-2xl"
              />
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {gallery.map((img, index) => (
                  <button
                    key={img}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-border hover:border-border-strong'
                    }`}
                    aria-label={`Ver imagen ${index + 1}`}
                  >
                    <ProductImage src={img} alt="" aspect="square" className="h-full w-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <div className="mb-1 text-sm font-medium uppercase tracking-wider text-primary">
              {product.categoryName}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted">{product.description}</p>

            {/* Price */}
            <div className="mt-8">
              <ProductPrice
                price={currentPrice}
                compareAtPrice={product.compareAtPrice}
                currency={product.currency}
              />
            </div>

            {/* Variant selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-medium text-foreground">
                  Variante:{' '}
                  <span className="text-muted">
                    {selectedVariant?.name ?? 'Selecciona una opción'}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const variantActive = (variant as { active?: boolean }).active !== false
                    const variantInStock = variant.stock > 0
                    const isSelected = selectedVariant?.id === variant.id

                    return (
                      <button
                        key={variant.id}
                        onClick={() => {
                          setSelectedVariant(isSelected ? null : variant)
                          setSelectedImageIndex(0)
                        }}
                        disabled={!variantActive || !variantInStock}
                        className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary-subtle text-primary'
                            : !variantActive || !variantInStock
                              ? 'cursor-not-allowed border-border bg-surface text-muted opacity-50'
                              : 'border-border bg-surface text-muted hover:border-border-strong hover:bg-surface-elevated'
                        }`}
                        aria-pressed={isSelected}
                        aria-label={`${variant.name}${!variantInStock ? ' (agotado)' : ''}`}
                      >
                        {variant.name}
                        {!variantInStock && (
                          <span className="ml-1 text-xs text-danger">Agotado</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {isOutOfStock ? (
                <Button size="lg" disabled className="min-w-[180px]">
                  <Icon name="package" size={18} />
                  Agotado
                </Button>
              ) : (
                <AddToCartButton
                  product={product}
                  variant={isActive ? 'primary' : 'secondary'}
                  size="lg"
                  className="min-w-[180px]"
                />
              )}
              <Badge variant="outline" className="h-12 px-4">
                {isOutOfStock ? 'Sin stock' : `Stock: ${currentStock} unidades`}
              </Badge>
            </div>

            {/* Product details */}
            <div className="mt-10 space-y-4 border-t border-border pt-8 text-sm text-muted">
              <p>
                <span className="font-medium text-foreground">SKU:</span> {currentSku}
              </p>
              <p>
                <span className="font-medium text-foreground">Categoría:</span>{' '}
                {product.categoryName}
              </p>
              {product.tags.length > 0 && (
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">Tags:</span>
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </p>
              )}
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

      {/* Related products */}
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
