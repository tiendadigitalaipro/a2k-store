import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { ProductImage } from '@/components/product/ProductImage'
import { formatPrice } from '@/lib/format'

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, itemCount } = useCart()
  const navigate = useNavigate()
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Focus management: trap focus inside drawer when open
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      // Small delay to allow animation to start
      const timer = setTimeout(() => {
        const btn = drawerRef.current?.querySelector<HTMLButtonElement>('[data-close-cart]')
        btn?.focus()
      }, 100)
      return () => clearTimeout(timer)
    } else {
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeCart])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isOpen])

  const handleCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  const handleContinueShopping = () => {
    closeCart()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.aside
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Carrito de compras"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">
                Carrito
                {itemCount > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted">
                    ({itemCount} {itemCount === 1 ? 'producto' : 'productos'})
                  </span>
                )}
              </h2>
              <Button
                data-close-cart
                variant="ghost"
                size="icon"
                onClick={closeCart}
                aria-label="Cerrar carrito"
              >
                <Icon name="close" size={20} />
              </Button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-elevated">
                    <Icon name="cart" size={28} className="text-muted" />
                  </div>
                  <p className="text-base font-medium text-foreground">Tu carrito está vacío</p>
                  <p className="mt-2 text-sm text-muted">
                    Agrega productos para comenzar tu compra.
                  </p>
                  <Button
                    className="mt-6"
                    onClick={handleContinueShopping}
                  >
                    Explorar productos
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4" role="list">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const itemKey = `${item.product.id}__${item.variantId ?? 'default'}`
                      const variant = item.variantId
                        ? item.product.variants?.find((v) => v.id === item.variantId)
                        : undefined
                      const displayName = variant
                        ? `${item.product.name} — ${variant.name}`
                        : item.product.name
                      const displayPrice = variant?.price ?? item.product.price
                      const displayImage = variant?.sku
                        ? item.product.gallery?.[0] ?? item.product.imageUrl
                        : item.product.imageUrl
                      const maxQty = variant?.stock ?? item.product.stock

                      return (
                        <motion.li
                          key={itemKey}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex gap-4"
                        >
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-surface-elevated">
                            <ProductImage
                              src={displayImage}
                              alt={displayName}
                              aspect="square"
                              className="h-full w-full"
                            />
                          </div>

                          <div className="flex flex-1 flex-col justify-between min-w-0">
                            <div>
                              <p className="text-sm font-medium text-foreground truncate">
                                {displayName}
                              </p>
                              {item.product.sku && (
                                <p className="mt-0.5 text-xs text-muted">
                                  SKU: {variant?.sku ?? item.product.sku}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              {/* Quantity controls */}
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(item.product.id, item.quantity - 1, item.variantId)
                                  }
                                  aria-label={`Disminuir cantidad de ${displayName}`}
                                  disabled={item.quantity <= 1}
                                >
                                  <Icon name="minus" size={14} />
                                </Button>
                                <span className="w-8 text-center text-sm font-medium text-foreground">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() =>
                                    updateQuantity(item.product.id, item.quantity + 1, item.variantId)
                                  }
                                  aria-label={`Aumentar cantidad de ${displayName}`}
                                  disabled={item.quantity >= maxQty}
                                >
                                  <Icon name="plus" size={14} />
                                </Button>
                              </div>

                              {/* Price + remove */}
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-foreground">
                                  {formatPrice(displayPrice * item.quantity)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted hover:text-danger"
                                  onClick={() => removeItem(item.product.id, item.variantId)}
                                  aria-label={`Eliminar ${displayName} del carrito`}
                                >
                                  <Icon name="trash" size={14} />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      )
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-6 py-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Subtotal</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <p className="text-xs text-muted">
                  Envío y descuentos se calculan en el checkout.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleCheckout}
                  >
                    Proceder al checkout
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={handleContinueShopping}
                  >
                    Seguir comprando
                  </Button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
