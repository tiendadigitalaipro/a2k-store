import { Card } from '@/components/ui/Card'
import type { PaymentMethod } from '@/lib/supabase/types'

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function PaymentMethodSelector({ methods, selectedId, onSelect }: PaymentMethodSelectorProps) {
  if (methods.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-4 text-sm text-muted">
        No hay métodos de pago disponibles en este momento.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Método de pago</h2>

      <div className="grid gap-3">
        {methods.map((method) => (
          <Card
            key={method.id}
            className={`cursor-pointer p-4 ${
              selectedId === method.id ? 'border-primary bg-primary-subtle' : ''
            }`}
            onClick={() => onSelect(method.id)}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                  selectedId === method.id ? 'border-primary bg-primary' : 'border-border'
                }`}
              >
                {selectedId === method.id && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{method.name}</p>
                {method.instructions && (
                  <p className="mt-1 text-xs text-muted">{method.instructions}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
