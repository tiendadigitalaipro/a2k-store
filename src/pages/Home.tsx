import { Hero } from '@/components/home/Hero'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { Features } from '@/components/home/Features'
import { SITE } from '@/config/site'
import { useSEO, websiteJsonLd } from '@/lib/seo'

export default function Home() {
  // SEO (Fase 20): JSON-LD de WebSite + SearchAction. La Organization ya
  // viene del JSON-LD estático de index.html (evita duplicados).
  useSEO({
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    path: '/',
    jsonLd: [websiteJsonLd()],
  })

  return (
    <>
      <Hero />
      <FeaturedProducts />
      <Features />
    </>
  )
}
