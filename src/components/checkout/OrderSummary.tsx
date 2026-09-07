import { useCart } from '@/hooks/useCart'
import { ProductImage } from '@/components/product/ProductImage'
import { formatPrice } from '@/lib/format'

interface OrderSummaryProps {
  shippingCost?: number
  discountTotal?: number
}

export function OrderSummary({ shippingCost = 0, discountTotal = 0 }: OrderSummaryProps) {
  const { items, subtotal } = useCart()

  const total = Math.max(0, subtotal - discountTotal + shippingCost)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Resumen del pedido</h2>

      <ul className="space-y-3">
        {items.map((item) => {
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

          return (
            <li key={`${item.product.id}__${item.variantId ?? 'default'}`} className="flex gap-3">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-border bg-surface-elevated">
                <ProductImage src={displayImage} alt={displayName} aspect="square" className="h-full w-full" />
              </div>
              <div className="flex flex-1 flex-col justify-between py-0.5">
                <p className="text-sm font-medium text-foreground">{displayName}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">Cantidad: {item.quantity}</span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(displayPrice * item.quantity)}
                  </span>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="space-y-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between text-muted">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discountTotal > 0 && (
          <div className="flex justify-between text-success">
            <span>Descuento</span>
            <span>-{formatPrice(discountTotal)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted">
          <span>Envío</span>
          <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold text-foreground">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
