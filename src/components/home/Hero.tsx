import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Icon } from '@/components/ui/Icon'
import { getNewProducts } from '@/services/products'
import type { Product } from '@/types'

/**
 * Hero — portada de la tienda.
 *
 * Las 3 fotos laterales son productos REALES del catálogo (los más recientes
 * con imagen), enlazados a su ficha. Si el catálogo está vacío o sin imágenes,
 * cae al diseño de texto centrado original — nunca un espacio vacío roto.
 */
const collageTilts = [
  'lg:translate-y-2 lg:-rotate-3',
  'lg:-translate-y-8 lg:rotate-2',
  'lg:translate-y-6 lg:rotate-3',
]

export function Hero() {
  const [shots, setShots] = useState<Product[]>([])

  useEffect(() => {
    let cancelled = false
    getNewProducts(6).then(({ data }) => {
      if (cancelled) return
      setShots((data ?? []).filter((p) => p.imageUrl).slice(0, 3))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const withCollage = shots.length === 3

  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
      <div className="gradient-radial pointer-events-none absolute inset-0 -z-10" aria-hidden="true" />

      <Container>
        <div className={`grid items-center gap-12 ${withCollage ? 'lg:grid-cols-[1.05fr_1fr]' : ''}`}>
          <div className={withCollage ? 'text-center lg:text-left' : 'mx-auto max-w-3xl text-center'}>
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
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link to="/catalogo">
                <Button size="lg" className="min-w-[180px]">
                  Ver catálogo
                  <Icon name="arrow-right" size={18} />
                </Button>
              </Link>
              <a href="#por-que-a2k">
                <Button size="lg" variant="secondary">
                  Saber más
                </Button>
              </a>
            </motion.div>
          </div>

          {withCollage && (
            <div className="relative mx-auto grid w-full max-w-lg grid-cols-3 items-center gap-4 lg:max-w-none">
              {shots.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.25 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className={collageTilts[i]}
                >
                  <motion.div
                    animate={{ y: [0, -9, 0] }}
                    transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                  >
                    <Link
                      to={`/producto/${product.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/50"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        className="aspect-[3/4] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
