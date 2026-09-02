import { formatPrice, calculateDiscount } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'

interface ProductPriceProps {
  price: number
  compareAtPrice?: number
  currency: string
}

export function ProductPrice({ price, compareAtPrice, currency }: ProductPriceProps) {
  const discount = calculateDiscount(price, compareAtPrice)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-lg font-bold text-foreground">{formatPrice(price, currency as 'USD')}</span>
      {compareAtPrice && compareAtPrice > price && (
        <>
          <span className="text-sm text-muted line-through">
            {formatPrice(compareAtPrice, currency as 'USD')}
          </span>
          {discount > 0 && <Badge variant="success">-{discount}%</Badge>}
        </>
      )}
    </div>
  )
}
