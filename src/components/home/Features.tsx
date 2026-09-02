import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Icon } from '@/components/ui/Icon'

const features = [
  {
    icon: 'package',
    title: 'Envío rápido',
    description: 'Preparamos tu pedido en 24h y lo enviamos con seguimiento en tiempo real.',
  },
  {
    icon: 'star',
    title: 'Productos seleccionados',
    description: 'Cada artículo pasa por un filtro de calidad, diseño y rendimiento real.',
  },
  {
    icon: 'user',
    title: 'Atención personalizada',
    description: 'Resuelve dudas por WhatsApp o email con un equipo que entiende de tecnología.',
  },
]

export function Features() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <Card className="h-full p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                  <Icon name={feature.icon as never} size={20} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
