import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { Product, ProductVariant } from '@/types'

interface AddToCartButtonProps {
  product: Product
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  selectedVariant?: ProductVariant | null
}

export function AddToCartButton({
  product,
  variant = 'primary',
  size = 'md',
  className,
  selectedVariant,
}: AddToCartButtonProps) {
  const { addItem, items } = useCart()
  const [added, setAdded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableStock = selectedVariant?.stock ?? product.stock
  const variantId = selectedVariant?.id ?? null

  // Calculate how many of this item (with this variant) are already in cart
  const currentInCart = items
    .filter((item) => item.product.id === product.id && item.variantId === variantId)
    .reduce((sum, item) => sum + item.quantity, 0)

  const isOutOfStock = availableStock <= 0
  const isMaxReached = currentInCart >= availableStock

  const handleClick = useCallback(() => {
    if (isOutOfStock) {
      setError('Producto agotado')
      setTimeout(() => setError(null), 2000)
      return
    }

    if (isMaxReached) {
      setError(`Máximo ${availableStock} unidades`)
      setTimeout(() => setError(null), 2000)
      return
    }

    addItem(product, 1, variantId)
    setAdded(true)
    setError(null)
    setTimeout(() => setAdded(false), 1500)
  }, [addItem, product, variantId, isOutOfStock, isMaxReached, availableStock])

  return (
    <div className="relative inline-flex flex-col items-center">
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
        disabled={isOutOfStock}
        aria-label={
          isOutOfStock
            ? `${product.name} agotado`
            : `Agregar ${product.name} al carrito`
        }
      >
        <AnimatePresence mode="wait">
          {isOutOfStock ? (
            <motion.span
              key="out-of-stock"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="inline-flex items-center gap-2"
            >
              <Icon name="package" size={18} />
              Agotado
            </motion.span>
          ) : added ? (
            <motion.span
              key="added"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="inline-flex items-center gap-2"
            >
              <Icon name="package" size={18} />
              Agregado
            </motion.span>
          ) : (
            <motion.span
              key="add"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="inline-flex items-center gap-2"
            >
              <Icon name="plus" size={18} />
              Agregar
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute -bottom-8 whitespace-nowrap rounded-lg bg-danger/90 px-2 py-1 text-xs text-white shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
