/**
 * Checkout Confirmation Page
 *
 * Shows order number, total and payment instructions after a
 * successful checkout.
 */

import { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/format'
import { SITE } from '@/config/site'

interface PaymentMethodSummary {
  id: string
  name: string
  instructions: string | null
}

interface CheckoutState {
  orderId: string
  orderNumber: string
  total: number
  paymentMethod: PaymentMethodSummary | null
}

export default function CheckoutConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()

  const state = location.state as CheckoutState | null

  // Redirect if accessed directly without checkout state
  useEffect(() => {
    if (!state?.orderNumber) {
      navigate('/catalogo')
    }
  }, [state, navigate])

  if (!state) return null

  const { orderNumber, total, paymentMethod } = state

  return (
    <Container className="py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-xl text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <svg
            className="h-10 w-10 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          ¡Orden creada exitosamente!
        </h1>
        <p className="mt-2 text-muted">
          Tu número de orden es <span className="font-semibold text-foreground">{orderNumber}</span>
        </p>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-6 text-left">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">Total a pagar</span>
            <span className="text-xl font-bold text-foreground">{formatPrice(total)}</span>
          </div>

          <div className="mt-4 space-y-2 text-sm text-muted">
            <p>
              <span className="font-medium text-foreground">Estado:</span>{' '}
              <Badge variant="warning">Pendiente de pago</Badge>
            </p>

            {paymentMethod && (
              <>
                <p>
                  <span className="font-medium text-foreground">Método de pago:</span>{' '}
                  {paymentMethod.name}
                </p>
                {paymentMethod.instructions && (
                  <div className="mt-2 rounded-lg bg-surface-elevated p-3 text-xs">
                    <p className="font-medium text-foreground">Instrucciones:</p>
                    <p className="mt-1">{paymentMethod.instructions}</p>
                  </div>
                )}
              </>
            )}

            <p>
              <span className="font-medium text-foreground">Próximos pasos:</span>{' '}
              Sigue las instrucciones de pago y sube tu comprobante en "Mis pedidos".
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <Link to="/mi-cuenta">
            <Button className="w-full">Ver mis pedidos</Button>
          </Link>
          <Link to="/catalogo">
            <Button variant="ghost" className="w-full">Volver al catálogo</Button>
          </Link>
        </div>

        <p className="mt-6 text-xs text-muted">
          ¿Dudas? Escríbenos por WhatsApp al{' '}
          <a
            href={`https://wa.me/${SITE.contact.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {SITE.contact.phone}
          </a>
        </p>
      </motion.div>
    </Container>
  )
}
