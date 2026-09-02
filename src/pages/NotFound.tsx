import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center justify-center py-32 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="text-7xl font-extrabold text-primary md:text-9xl" aria-hidden="true">
          404
        </p>
        <h1 className="mt-6 text-2xl font-bold text-foreground md:text-3xl">
          Página no encontrada
        </h1>
        <p className="mt-3 max-w-md text-muted">
          La ruta que buscas no existe o ha cambiado. Te ayudamos a volver al catálogo.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/">
            <Button>
              <Icon name="chevron-right" size={18} className="rotate-180" />
              Volver al inicio
            </Button>
          </Link>
          <Link to="/catalogo">
            <Button variant="secondary">Ir al catálogo</Button>
          </Link>
        </div>
      </motion.div>
    </Container>
  )
}
