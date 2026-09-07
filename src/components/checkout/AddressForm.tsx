import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createCustomerAddress } from '@/services/addresses'

interface AddressFormProps {
  customerId: string
  onSuccess: (addressId: string) => void
  onCancel: () => void
}

export function AddressForm({ customerId, onSuccess, onCancel }: AddressFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    whatsapp: '',
    state: '',
    city: '',
    addressLine: '',
    reference: '',
    label: '',
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.fullName || !formData.whatsapp || !formData.state || !formData.city || !formData.addressLine) {
      setError('Completa los campos obligatorios')
      return
    }

    setLoading(true)

    const { data, error: createError } = await createCustomerAddress({
      customerId,
      label: formData.label || undefined,
      fullName: formData.fullName,
      whatsapp: formData.whatsapp,
      state: formData.state,
      city: formData.city,
      addressLine: formData.addressLine,
      reference: formData.reference || undefined,
      isDefault: true,
    })

    setLoading(false)

    if (createError || !data) {
      setError(createError ?? 'No se pudo guardar la dirección')
      return
    }

    onSuccess(data.id)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-4">
      <h3 className="font-medium text-foreground">Nueva dirección</h3>

      {error && (
        <div className="rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nombre completo *"
          value={formData.fullName}
          onChange={(e) => setFormData((d) => ({ ...d, fullName: e.target.value }))}
          required
        />
        <Input
          label="WhatsApp *"
          value={formData.whatsapp}
          onChange={(e) => setFormData((d) => ({ ...d, whatsapp: e.target.value }))}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Estado *"
          value={formData.state}
          onChange={(e) => setFormData((d) => ({ ...d, state: e.target.value }))}
          required
        />
        <Input
          label="Ciudad *"
          value={formData.city}
          onChange={(e) => setFormData((d) => ({ ...d, city: e.target.value }))}
          required
        />
      </div>

      <Input
        label="Dirección *"
        value={formData.addressLine}
        onChange={(e) => setFormData((d) => ({ ...d, addressLine: e.target.value }))}
        required
      />

      <Input
        label="Referencia"
        value={formData.reference}
        onChange={(e) => setFormData((d) => ({ ...d, reference: e.target.value }))}
      />

      <Input
        label="Etiqueta (ej: Casa, Trabajo)"
        value={formData.label}
        onChange={(e) => setFormData((d) => ({ ...d, label: e.target.value }))}
      />

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar dirección'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
