/**
 * SEO Engine (Fase 20)
 *
 * Hook centralizado para gestionar por página:
 *  - <title> único
 *  - <meta name="description"> única
 *  - <link rel="canonical"> absoluto
 *  - Open Graph + Twitter Card
 *  - meta robots (noindex para páginas privadas)
 *  - Datos estructurados JSON-LD (Product, Organization, BreadcrumbList, ItemList...)
 *
 * Uso:
 *   useSEO({ title: '...', description: '...', path: '/producto/x', jsonLd: [...] })
 */

import { useEffect } from 'react'
import { SITE } from '@/config/site'

export interface SeoJsonLd {
  [key: string]: unknown
}

export interface SeoOptions {
  /** Título único de la página (se añade " | A2K Store" si no lo trae). */
  title: string
  /** Descripción única de 120–160 caracteres idealmente. */
  description: string
  /** Ruta relativa de la página, ej. '/producto/zapatilla-running-noka'. */
  path?: string
  /** Imagen absoluta para OG/Twitter (por defecto la de marca). */
  image?: string
  /** Tipo de Open Graph. */
  type?: 'website' | 'product' | 'article'
  /** Directiva para crawlers. Default 'index, follow'. */
  robots?: string
  /** Objetos JSON-LD a inyectar (Schema.org). Se limpian al desmontar/cambiar. */
  jsonLd?: SeoJsonLd[]
}

const JSONLD_ATTR = 'data-seo-jsonld'

function upsertMeta(
  attr: 'name' | 'property',
  key: string,
  content: string,
): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function replaceJsonLd(jsonLd: SeoJsonLd[]): void {
  document.head
    .querySelectorAll<HTMLScriptElement>(`script[${JSONLD_ATTR}]`)
    .forEach((node) => node.remove())

  for (const obj of jsonLd) {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute(JSONLD_ATTR, '')
    script.textContent = JSON.stringify(obj)
    document.head.appendChild(script)
  }
}

export function absoluteUrl(path: string): string {
  const base = SITE.url.replace(/\/$/, '')
  if (!path.startsWith('/')) return `${base}/${path}`
  return `${base}${path}`
}

export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(/[,.;:]$/, '')}…`
}

export function useSEO(options: SeoOptions): void {
  const {
    title,
    description,
    path = '/',
    image,
    type = 'website',
    robots = 'index, follow',
    jsonLd = [],
  } = options

  // Serializamos para que el efecto corra cuando el contenido cambia de verdad.
  const deps = JSON.stringify([title, description, path, image, type, robots, jsonLd])

  useEffect(() => {
    const fullTitle = title.includes('A2K Store') ? title : `${title} | ${SITE.name}`
    const desc = truncate(description || SITE.description)
    const url = absoluteUrl(path)
    const ogImage = image ?? absoluteUrl('/og-image.png')

    document.title = fullTitle
    upsertMeta('name', 'description', desc)
    upsertMeta('name', 'robots', robots)
    upsertCanonical(url)

    // Open Graph
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:image', ogImage)
    upsertMeta('property', 'og:site_name', SITE.name)
    upsertMeta('property', 'og:locale', 'es_VE')

    // Twitter
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', desc)
    upsertMeta('name', 'twitter:image', ogImage)

    if (jsonLd.length > 0) replaceJsonLd(jsonLd)
  }, [deps]) // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * Para páginas privadas (admin, checkout, login, cuenta…): salen en
 * resultados de búsqueda con noindex, nofollow y sin canonical pública.
 */
export function useNoIndex(title: string): void {
  useSEO({
    title,
    description: '',
    robots: 'noindex, nofollow',
  })
}

/* ============================================================
 * Generadores de JSON-LD reutilizables
 * ============================================================ */

export function organizationJsonLd(): SeoJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl('/og-image.png'),
    description: SITE.description,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'ventas y atención al cliente',
      telephone: SITE.contact.phone,
      email: SITE.contact.email,
      availableLanguage: ['es'],
      areaServed: 'VE',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE.business.pickup,
      addressCountry: 'VE',
    },
  }
}

export function websiteJsonLd(): SeoJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: 'es-VE',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/catalogo?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): SeoJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

interface ProductJsonLdInput {
  name: string
  slug: string
  description: string
  imageUrl?: string
  gallery?: string[]
  sku: string
  price: number
  currency: string
  categoryName?: string
  rating?: number
  reviewCount?: number
  inStock: boolean
}

export function productJsonLd(input: ProductJsonLdInput): SeoJsonLd {
  const images = [...new Set([input.imageUrl, ...(input.gallery ?? [])])].filter(Boolean)

  const schema: SeoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    sku: input.sku,
    url: absoluteUrl(`/producto/${input.slug}`),
    description: truncate(input.description, 300),
    ...(images.length > 0 ? { image: images } : {}),
    ...(input.categoryName ? { category: input.categoryName } : {}),
    brand: { '@type': 'Brand', name: SITE.name },
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/producto/${input.slug}`),
      price: input.price.toFixed(2),
      priceCurrency: input.currency,
      itemCondition: 'https://schema.org/NewCondition',
      availability: input.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE.name },
    },
  }

  // Solo incluimos reseñas cuando existen datos reales (política de Google).
  if (input.rating && input.reviewCount && input.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.rating,
      reviewCount: input.reviewCount,
    }
  }

  return schema
}

export function itemListJsonLd(
  items: { name: string; slug: string }[],
  listName: string,
): SeoJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(`/producto/${item.slug}`),
    })),
  }
}
