/**
 * Generador de sitemap.xml (Fase 20 SEO)
 *
 * Se ejecuta automáticamente en cada build (`npm run build` → prebuild).
 * Consulta Supabase REST para obtener categorías y productos ACTIVOS y
 * genera public/sitemap.xml con:
 *   /                     (prioridad 1.0)
 *   /catalogo             (0.9)
 *   /categoria/:slug      (0.8)
 *   /producto/:slug       (0.7 + lastmod con updated_at)
 *
 * Usa las mismas variables de entorno que la app:
 *   VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
 * Si no están disponibles (build local sin env), genera el sitemap con las
 * páginas estáticas y deja un aviso en consola.
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, '..', 'public')

// Dominio canónico (mismo que src/config/site.ts). Se puede sobreescribir
// con SITE_URL en el entorno de build.
const BASE_URL = (process.env.SITE_URL || 'https://store.a2kdigitalstudio.online').replace(/\/$/, '')

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''

function xmlEscape(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function urlEntry(path, priority, changefreq, lastmod) {
  const loc = `${BASE_URL}${path}`
  const lastmodTag = lastmod
    ? `\n    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>`
    : ''
  return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmodTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

async function fetchRows(table, select) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${select}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })
  if (!res.ok) throw new Error(`${table}: HTTP ${res.status}`)
  return res.json()
}

async function main() {
  const urls = [
    urlEntry('/', '1.0', 'daily'),
    urlEntry('/catalogo', '0.9', 'daily'),
  ]

  let categoriesCount = 0
  let productsCount = 0

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const categories = await fetchRows(
        'categories',
        'slug,updated_at&is_active=eq.true',
      )
      for (const cat of categories) {
        urls.push(urlEntry(`/categoria/${cat.slug}`, '0.8', 'weekly', cat.updated_at))
        categoriesCount++
      }

      const products = await fetchRows(
        'products',
        'slug,updated_at&status=eq.active',
      )
      for (const prod of products) {
        urls.push(urlEntry(`/producto/${prod.slug}`, '0.7', 'weekly', prod.updated_at))
        productsCount++
      }
      console.log(`  sitemap: ${categoriesCount} categorías + ${productsCount} productos desde Supabase`)
    } catch (err) {
      console.warn(`  sitemap: aviso — no se pudo consultar Supabase (${err.message}); sitemap solo con páginas estáticas`)
    }
  } else {
    console.warn('  sitemap: aviso — VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY no definidas; sitemap solo con páginas estáticas (se completará al construir en Vercel)')
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`

  writeFileSync(join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8')
  console.log(`  sitemap: ${urls.length} URLs escritas en public/sitemap.xml`)
}

main()
