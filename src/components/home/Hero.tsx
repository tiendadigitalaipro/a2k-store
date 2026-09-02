import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
      <div className="gradient-radial pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Badge variant="primary" className="mb-6">
              Tecnología seleccionada
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Tu tienda online, <span className="text-primary">lista para crecer.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-balance text-lg leading-relaxed text-muted md:text-xl"
          >
            Productos tecnológicos premium, una experiencia de compra moderna y una arquitectura
            construida para escalar sin límites.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link to="/catalogo">
              <Button size="lg" className="min-w-[180px]">
                Ver catálogo
                <Icon name="arrow-right" size={18} />
              </Button>
            </Link>
            <Button size="lg" variant="secondary">
              Saber más
            </Button>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
