/**
 * Checkout Page
 *
 * Protected route. Collects delivery method, address (if shipping),
 * payment method, then creates the order atomically via a single
 * PostgreSQL RPC that handles order, items, payment and stock
 * reservations in one transaction.
 */

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import { DeliverySelector } from '@/components/checkout/DeliverySelector'
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector'
import { AddressForm } from '@/components/checkout/AddressForm'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/context/AuthContext'
import { getActivePaymentMethods } from '@/services/payments'
import { getCustomerAddresses } from '@/services/addresses'
import { createOrderCheckout } from '@/services/checkout'
import { getReservationDurationMinutes } from '@/services/settings'
import { formatPrice } from '@/lib/format'
import type { PaymentMethod, CustomerAddress, DeliveryMethod } from '@/lib/supabase/types'

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export default function Checkout() {
  const navigate = useNavigate()
  const { customer } = useAuth()
  const { items, subtotal, clearCart } = useCart()

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup')
  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reservationMinutes, setReservationMinutes] = useState<number>(30)

  // Redirect empty cart
  useEffect(() => {
    if (items.length === 0) {
      navigate('/catalogo')
    }
  }, [items, navigate])

  // Load payment methods, addresses and settings
  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!customer) return

      const [methodsResult, addressesResult, reservationMinutesResult] = await Promise.all([
        getActivePaymentMethods(),
        getCustomerAddresses(customer.id),
        getReservationDurationMinutes(),
      ])

      if (cancelled) return

      if (methodsResult.error) {
        setError(methodsResult.error)
      } else {
        setPaymentMethods(methodsResult.data ?? [])
      }

      const loadedAddresses = addressesResult.data ?? []
      setAddresses(loadedAddresses)
      const defaultAddress = loadedAddresses.find((a) => a.is_default)
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id)
      }

      setReservationMinutes(reservationMinutesResult)
      setInitialLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [customer])

  const shippingCost = 0
  const discountTotal = 0
  const total = useMemo(
    () => Math.max(0, subtotal - discountTotal + shippingCost),
    [subtotal, discountTotal, shippingCost],
  )

  const selectedPaymentMethod = paymentMethods.find((m) => m.id === selectedPaymentMethodId)

  const validateCartIds = (): string | null => {
    for (const item of items) {
      if (!isValidUuid(item.product.id)) {
        return `El producto "${item.product.name}" no tiene un identificador válido de Supabase. El catálogo debe estar conectado a la base de datos antes de procesar checkout.`
      }
      if (item.variantId && !isValidUuid(item.variantId)) {
        return `La variante seleccionada de "${item.product.name}" no tiene un identificador válido.`
      }
    }
    return null
  }

  const handleSubmit = async () => {
    setError(null)

    if (!customer) {
      setError('Debes iniciar sesión para continuar')
      return
    }

    if (!selectedPaymentMethodId) {
      setError('Selecciona un método de pago')
      return
    }

    if (deliveryMethod === 'shipping' && !selectedAddressId) {
      setError('Selecciona o agrega una dirección de envío')
      return
    }

    const cartError = validateCartIds()
    if (cartError) {
      setError(cartError)
      return
    }

    setLoading(true)

    const checkoutItems = items.map((item) => ({
      product_id: item.product.id,
      variant_id: item.variantId ?? undefined,
      quantity: item.quantity,
    }))

    const { data, error: checkoutError } = await createOrderCheckout({
      addressId: deliveryMethod === 'shipping' ? selectedAddressId ?? undefined : undefined,
      deliveryMethod,
      items: checkoutItems,
      paymentMethodId: selectedPaymentMethodId,
      reservationMinutes,
    })

    setLoading(false)

    if (checkoutError || !data) {
      setError(checkoutError ?? 'No se pudo procesar el checkout')
      return
    }

    clearCart()

    navigate('/checkout/confirmado', {
      state: {
        orderId: data.order_id,
        orderNumber: data.order_number,
        total: data.total,
        paymentMethod: selectedPaymentMethod
          ? {
              id: selectedPaymentMethod.id,
              name: selectedPaymentMethod.name,
              instructions: selectedPaymentMethod.instructions,
            }
          : null,
      },
    })
  }

  if (initialLoading) {
    return (
      <Container className="py-20 text-center">
        <p className="text-muted">Cargando opciones de checkout...</p>
      </Container>
    )
  }

  return (
    <Container className="py-10 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Checkout</h1>
        <p className="mt-2 text-sm text-muted">Revisa tu pedido y elige cómo pagar.</p>

        {error && (
          <div className="mt-6 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main form */}
          <div className="space-y-8 lg:col-span-2">
            <DeliverySelector value={deliveryMethod} onChange={setDeliveryMethod} />

            {deliveryMethod === 'shipping' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Dirección de envío</h2>
                  {!showAddressForm && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAddressForm(true)}
                    >
                      + Agregar dirección
                    </Button>
                  )}
                </div>

                {showAddressForm ? (
                  <AddressForm
                    customerId={customer?.id ?? ''}
                    onSuccess={(id) => {
                      setSelectedAddressId(id)
                      setShowAddressForm(false)
                      if (customer) {
                        getCustomerAddresses(customer.id).then(({ data }) => {
                          if (data) setAddresses(data)
                        })
                      }
                    }}
                    onCancel={() => setShowAddressForm(false)}
                  />
                ) : addresses.length === 0 ? (
                  <Card className="p-4 text-sm text-muted">
                    No tienes direcciones guardadas. Agrega una para continuar.
                  </Card>
                ) : (
                  <div className="grid gap-3">
                    {addresses.map((address) => (
                      <Card
                        key={address.id}
                        className={`cursor-pointer p-4 ${
                          selectedAddressId === address.id ? 'border-primary bg-primary-subtle' : ''
                        }`}
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                              selectedAddressId === address.id
                                ? 'border-primary bg-primary'
                                : 'border-border'
                            }`}
                          >
                            {selectedAddressId === address.id && (
                              <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {address.label}
                              {address.is_default && (
                                <Badge variant="primary" className="ml-2">
                                  Principal
                                </Badge>
                              )}
                            </p>
                            <p className="mt-1 text-sm text-muted">
                              {address.full_name} — {address.whatsapp}
                            </p>
                            <p className="text-sm text-muted">
                              {address.address_line}, {address.city}, {address.state}
                            </p>
                            {address.reference && (
                              <p className="text-xs text-muted">Ref: {address.reference}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            <PaymentMethodSelector
              methods={paymentMethods}
              selectedId={selectedPaymentMethodId}
              onSelect={setSelectedPaymentMethodId}
            />
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 p-6">
              <OrderSummary shippingCost={shippingCost} discountTotal={discountTotal} />

              <div className="mt-6 space-y-3">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={loading || items.length === 0}
                >
                  {loading ? 'Procesando...' : `Pagar ${formatPrice(total)}`}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => navigate('/catalogo')}
                  disabled={loading}
                >
                  Seguir comprando
                </Button>
              </div>

              <p className="mt-4 text-xs text-muted">
                Al confirmar se creará tu orden en estado pendiente de pago. El stock se reservará por{' '}
                {reservationMinutes} {reservationMinutes === 1 ? 'minuto' : 'minutos'}.
              </p>
            </Card>
          </div>
        </div>
      </motion.div>
    </Container>
  )
}
