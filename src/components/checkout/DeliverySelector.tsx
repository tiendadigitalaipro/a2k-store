import { Card } from '@/components/ui/Card'
import { SITE } from '@/config/site'
import type { DeliveryMethod } from '@/lib/supabase/types'

interface DeliverySelectorProps {
  value: DeliveryMethod
  onChange: (method: DeliveryMethod) => void
}

export function DeliverySelector({ value, onChange }: DeliverySelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Método de entrega</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card
          className={`cursor-pointer p-4 ${
            value === 'pickup' ? 'border-primary bg-primary-subtle' : ''
          }`}
          onClick={() => onChange('pickup')}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                value === 'pickup' ? 'border-primary bg-primary' : 'border-border'
              }`}
            >
              {value === 'pickup' && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
            </div>
            <div>
              <p className="font-medium text-foreground">Retiro en {SITE.business.pickup}</p>
              <p className="mt-1 text-xs text-muted">
                Horario: {SITE.business.hours}
              </p>
              <p className="mt-1 text-xs font-medium text-success">Gratis</p>
            </div>
          </div>
        </Card>

        <Card
          className={`cursor-pointer p-4 ${
            value === 'shipping' ? 'border-primary bg-primary-subtle' : ''
          }`}
          onClick={() => onChange('shipping')}
        >
          <div className="flex items-start gap-3">
            <div
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                value === 'shipping' ? 'border-primary bg-primary' : 'border-border'
              }`}
            >
              {value === 'shipping' && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
            </div>
            <div>
              <p className="font-medium text-foreground">Envío a domicilio</p>
              <p className="mt-1 text-xs text-muted">
                Envío nacional gratuito
              </p>
              <p className="mt-1 text-xs font-medium text-success">Gratis</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
