#!/usr/bin/env node
/**
 * Verificación independiente de la carga de medios reales.
 *
 * Usa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para consultas de solo lectura.
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')
const https = require('https')
const http = require('http')

const REPORT_PATH = './UPLOAD_REAL_MEDIA_REPORT.json'

function loadEnv() {
  const envPath = path.resolve('.env.local')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIndex = trimmed.indexOf('=')
      if (eqIndex === -1) continue
      const key = trimmed.slice(0, eqIndex).trim()
      let value = trimmed.slice(eqIndex + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (!(key in process.env)) {
        process.env[key] = value
      }
    }
  }
}

function headRequest(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https:') ? https : http
    const req = client.request(url, { method: 'HEAD', timeout: 15000 }, (res) => {
      resolve({ status: res.statusCode, contentType: res.headers['content-type'], size: res.headers['content-length'] })
    })
    req.on('error', (err) => resolve({ status: 0, error: err.message }))
    req.on('timeout', () => {
      req.destroy()
      resolve({ status: 0, error: 'timeout' })
    })
    req.end()
  })
}

async function main() {
  loadEnv()

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    console.error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en .env.local')
    process.exit(1)
  }

  if (!fs.existsSync(REPORT_PATH)) {
    console.error('No se encontró UPLOAD_REAL_MEDIA_REPORT.json')
    process.exit(1)
  }

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'))
  const items = report.uploaded_items || []
  const productIds = [...new Set(items.map((i) => i.product_id))]

  console.log('=== VERIFICACIÓN INDEPENDIENTE DE CARGA ===\n')
  console.log(`URL del proyecto: ${supabaseUrl}`)
  console.log(`Items en reporte: ${items.length}`)
  console.log(`SKUs únicos: ${productIds.length}`)
  console.log(`Subidas reportadas: ${report.uploaded_count}`)
  console.log(`Registros product_images reportados: ${report.product_images_inserted}`)
  console.log(`Fallidas: ${report.failed_count}`)
  console.log('')

  const supabase = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // 1. Verificar product_images en base de datos
  console.log('1. Consultando product_images en Supabase...')
  const { data: dbImages, error: dbError } = await supabase
    .from('product_images')
    .select('id, product_id, url, sort_order')
    .in('product_id', productIds)

  if (dbError) {
    console.error('   Error al consultar product_images:', dbError.message)
  } else {
    console.log(`   Registros encontrados: ${dbImages.length}`)

    // Verificar que cada item del reporte tenga su registro
    const dbUrls = new Set((dbImages || []).map((r) => r.url))
    const missingInDb = items.filter((i) => !dbUrls.has(i.public_url))
    console.log(`   Items del reporte sin registro en DB: ${missingInDb.length}`)
    if (missingInDb.length > 0) {
      console.log('   Primeros faltantes:', missingInDb.slice(0, 3).map((i) => i.storage_path))
    }

    // Verificar main images
    const mainImages = (dbImages || []).filter((r) => r.sort_order === 0)
    console.log(`   Imágenes principales (sort_order=0): ${mainImages.length}`)

    const mainByProduct = {}
    for (const r of mainImages) {
      mainByProduct[r.product_id] = (mainByProduct[r.product_id] || 0) + 1
    }
    const badMains = Object.entries(mainByProduct).filter(([_, count]) => count !== 1)
    console.log(`   Productos con exactamente 1 main: ${productIds.length - badMains.length}/${productIds.length}`)
    if (badMains.length > 0) {
      console.log('   Productos con main incorrecto:', badMains)
    }
  }

  // 2. Verificar acceso público a URLs
  console.log('\n2. Verificando acceso público a URLs de Storage...')
  const sampleSize = Math.min(20, items.length)
  const sample = items.sort(() => 0.5 - Math.random()).slice(0, sampleSize)
  let accessible = 0
  let failedUrls = []

  for (const item of sample) {
    const result = await headRequest(item.public_url)
    if (result.status === 200) {
      accessible++
    } else {
      failedUrls.push({ path: item.storage_path, status: result.status, error: result.error })
    }
  }

  console.log(`   URLs verificadas: ${sampleSize}`)
  console.log(`   URLs accesibles (HTTP 200): ${accessible}`)
  if (failedUrls.length > 0) {
    console.log('   URLs con problema:', failedUrls)
  }

  // 3. Verificar duplicados de URL
  console.log('\n3. Verificando duplicados de URL en product_images...')
  const urlCounts = {}
  for (const r of dbImages || []) {
    urlCounts[r.url] = (urlCounts[r.url] || 0) + 1
  }
  const duplicates = Object.entries(urlCounts).filter(([_, count]) => count > 1)
  console.log(`   URLs duplicadas: ${duplicates.length}`)
  if (duplicates.length > 0) {
    console.log('   Duplicados:', duplicates)
  }

  // 4. Resumen por SKU
  console.log('\n4. Resumen por SKU...')
  const skuSummary = {}
  for (const item of items) {
    if (!skuSummary[item.sku]) {
      skuSummary[item.sku] = { name: item.product_name, product_id: item.product_id, total: 0, main: null }
    }
    skuSummary[item.sku].total++
    if (item.image_role === 'main') {
      skuSummary[item.sku].main = item.storage_path
    }
  }

  console.log('   SKU | Producto | Total imágenes | Main path')
  for (const [sku, info] of Object.entries(skuSummary)) {
    console.log(`   ${sku} | ${info.name} | ${info.total} | ${info.main}`)
  }

  // 5. Verificar inconsistencias entre reporte y DB
  console.log('\n5. Validación cruzada reporte ↔ DB...')
  const reportUrls = new Set(items.map((i) => i.public_url))
  const extraDbUrls = (dbImages || []).filter((r) => !reportUrls.has(r.url))
  console.log(`   Registros en DB que no están en el reporte: ${extraDbUrls.length}`)
  if (extraDbUrls.length > 0) {
    console.log('   Extra:', extraDbUrls.slice(0, 3))
  }

  console.log('\n=== FIN DE VERIFICACIÓN ===')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
