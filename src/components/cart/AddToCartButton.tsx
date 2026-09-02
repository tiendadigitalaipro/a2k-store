import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import type { Product } from '@/types'

interface AddToCartButtonProps {
  product: Product
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AddToCartButton({
  product,
  variant = 'primary',
  size = 'md',
  className,
}: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleClick = () => {
    addItem(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleClick}>
      <AnimatePresence mode="wait">
        {added ? (
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
  )
}
