import { Badge } from '@/components/ui/Badge'

interface ProductBadgesProps {
  isNew?: boolean
  isFeatured?: boolean
  discount?: number
}

export function ProductBadges({ isNew, isFeatured, discount }: ProductBadgesProps) {
  return (
    <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
      {discount && discount > 0 && <Badge variant="success">-{discount}%</Badge>}
      {isNew && <Badge variant="primary">Nuevo</Badge>}
      {isFeatured && !isNew && <Badge variant="warning">Destacado</Badge>}
    </div>
  )
}
