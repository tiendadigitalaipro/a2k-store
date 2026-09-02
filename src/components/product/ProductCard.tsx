import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { ProductImage } from './ProductImage'
import { ProductPrice } from './ProductPrice'
import { ProductBadges } from './ProductBadge'
import { calculateDiscount } from '@/lib/format'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const discount = calculateDiscount(product.price, product.compareAtPrice)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="group relative flex h-full flex-col">
        <ProductBadges
          isNew={product.isNew}
          isFeatured={product.isFeatured}
          discount={discount}
        />
        <Link to={`/producto/${product.slug}`} className="relative block overflow-hidden">
          <ProductImage src={product.imageUrl} alt={product.name} aspect="square" />
        </Link>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
            {product.categoryName}
          </div>
          <Link to={`/producto/${product.slug}`}>
            <h3 className="mb-2 text-base font-semibold text-foreground transition-colors group-hover:text-primary">
              {product.name}
            </h3>
          </Link>
          <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
            {product.shortDescription}
          </p>

          <div className="flex items-center justify-between gap-3">
            <ProductPrice
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              currency={product.currency}
            />
            <AddToCartButton product={product} size="sm" />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
