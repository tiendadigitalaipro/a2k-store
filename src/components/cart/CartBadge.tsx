import { useCart } from '@/hooks/useCart'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

export function CartBadge() {
  const { itemCount } = useCart()

  return (
    <Button variant="ghost" size="icon" aria-label={`Carrito con ${itemCount} productos`}>
      <span className="relative">
        <Icon name="cart" size={20} />
        {itemCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </span>
    </Button>
  )
}
