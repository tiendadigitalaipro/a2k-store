#!/usr/bin/env node
/**
 * FASE 2.12 — Carga segura de medios reales a Supabase Storage
 *
 * Lee STORAGE_UPLOAD_PLAN.json, valida archivos locales, sube imágenes al bucket
 * `products` y crea registros en `product_images` solo después de confirmar
 * subida exitosa.
 *
 * Uso:
 *   node upload_real_media.cjs --dry-run
 *   VITE_SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=ey... node upload_real_media.cjs
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { createClient } = require('@supabase/supabase-js')

const PLAN_PATH = './STORAGE_UPLOAD_PLAN.json'
const REPORT_PATH = './UPLOAD_REAL_MEDIA_REPORT.json'
const BUCKET_NAME = 'products'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const DRY_RUN = process.argv.includes('--dry-run')

function log(...args) {
  console.log('[UPLOAD]', ...args)
}

function logError(...args) {
  console.error('[ERROR]', ...args)
}

function loadEnv() {
  // Carga .env.local manualmente (sin dependencia dotenv)
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
      // Quitar comillas si las hay
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      if (!(key in process.env)) {
        process.env[key] = value
      }
    }
  }
}

async function validatePlan(plan) {
  log('Iniciando validación del plan...')

  if (!Array.isArray(plan.uploads) || plan.uploads.length === 0) {
    throw new Error('El plan no contiene uploads válidos')
  }

  const uploads = plan.uploads
  const errors = []

  // Verificar duplicados de storage_path
  const pathCounts = {}
  for (const u of uploads) {
    pathCounts[u.storage_path] = (pathCounts[u.storage_path] || 0) + 1
  }
  for (const [p, count] of Object.entries(pathCounts)) {
    if (count > 1) errors.push(`storage_path duplicado: ${p} (${count} veces)`)
  }

  // Verificar exactamente 1 main por SKU
  const skuMains = {}
  for (const u of uploads) {
    if (u.image_role === 'main') skuMains[u.sku] = (skuMains[u.sku] || 0) + 1
  }
  const skus = [...new Set(uploads.map((u) => u.sku))]
  for (const sku of skus) {
    if (skuMains[sku] !== 1) {
      errors.push(`SKU ${sku} no tiene exactamente 1 main (tiene ${skuMains[sku] || 0})`)
    }
  }

  // Verificar sort_order único por SKU
  const skuSortOrders = {}
  for (const u of uploads) {
    if (!skuSortOrders[u.sku]) skuSortOrders[u.sku] = new Set()
    if (skuSortOrders[u.sku].has(u.sort_order)) {
      errors.push(`SKU ${sku} tiene sort_order duplicado: ${u.sort_order}`)
    }
    skuSortOrders[u.sku].add(u.sort_order)
  }

  // Validar cada archivo local
  for (const u of uploads) {
    const sourcePath = path.resolve(u.source_path)
    if (!fs.existsSync(sourcePath)) {
      errors.push(`Archivo no existe: ${sourcePath}`)
      continue
    }
    const stats = fs.statSync(sourcePath)
    if (stats.size > MAX_FILE_SIZE) {
      errors.push(`Archivo excede 10 MB: ${sourcePath} (${Math.round(stats.size / 1024 / 1024)} MB)`)
    }
    if (!ALLOWED_MIME_TYPES.includes(u.mime_type)) {
      errors.push(`MIME no permitido: ${u.mime_type} para ${sourcePath}`)
    }
    // Verificar SHA-256
    const hash = crypto.createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex')
    if (hash !== u.sha256) {
      errors.push(`SHA-256 no coincide para ${sourcePath}`)
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validación fallida:\n${errors.join('\n')}`)
  }

  log(`Validación OK: ${uploads.length} imágenes, ${skus.length} SKUs, 0 errores`)
  return uploads
}

function getBucketPath(storagePath) {
  // storage_path incluye el bucket como primer segmento: products/.../...
  const parts = storagePath.split('/')
  if (parts[0] !== BUCKET_NAME) {
    throw new Error(`storage_path no comienza con ${BUCKET_NAME}: ${storagePath}`)
  }
  return parts.slice(1).join('/')
}

function getPublicUrl(supabaseUrl, storagePath) {
  return `${supabaseUrl}/storage/v1/object/public/${storagePath}`
}

async function uploadBatch(supabase, uploads, report) {
  const total = uploads.length
  let uploaded = 0
  let skipped = 0
  const uploadedItems = []

  for (const u of uploads) {
    const bucketPath = getBucketPath(u.storage_path)
    const sourcePath = path.resolve(u.source_path)

    // Verificar si ya existe en Storage
    const { data: existing, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(bucketPath.split('/').slice(0, -1).join('/'), {
        search: bucketPath.split('/').pop(),
      })

    if (listError) {
      logError(`No se pudo verificar existencia de ${u.storage_path}: ${listError.message}`)
      report.failed.push({ ...u, error: `list_error: ${listError.message}` })
      continue
    }

    const alreadyExists = existing && existing.some((f) => f.name === bucketPath.split('/').pop())

    if (alreadyExists) {
      log(`Ya existe en Storage (skip): ${u.storage_path}`)
      skipped++
      uploadedItems.push({ ...u, public_url: getPublicUrl(report.supabase_url, u.storage_path), action: 'skipped' })
      continue
    }

    const fileBuffer = fs.readFileSync(sourcePath)
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(bucketPath, fileBuffer, {
        contentType: u.mime_type,
        upsert: false,
      })

    if (error) {
      logError(`Fallo al subir ${u.storage_path}: ${error.message}`)
      report.failed.push({ ...u, error: error.message })
      continue
    }

    uploaded++
    const publicUrl = getPublicUrl(report.supabase_url, u.storage_path)
    uploadedItems.push({ ...u, public_url: publicUrl, action: 'uploaded' })
    log(`Subido ${uploaded}/${total}: ${u.storage_path}`)
  }

  report.uploaded_count = uploaded
  report.skipped_count = skipped
  report.failed_count = report.failed.length
  return uploadedItems
}

async function insertProductImages(supabase, items, report) {
  if (items.length === 0) {
    log('No hay imágenes para registrar en product_images')
    return
  }

  const rows = items.map((item) => ({
    product_id: item.product_id,
    url: item.public_url,
    alt_text: item.product_name,
    sort_order: item.sort_order,
  }))

  // Insert en lotes de 50 para evitar payloads grandes
  const BATCH_SIZE = 50
  let inserted = 0
  const failedRows = []

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE)
    const { data, error } = await supabase.from('product_images').insert(batch).select('id,product_id,url,sort_order')

    if (error) {
      logError(`Fallo al insertar lote ${i / BATCH_SIZE + 1}: ${error.message}`)
      failedRows.push(...batch.map((r) => ({ ...r, error: error.message })))
    } else {
      inserted += data.length
      log(`Insertados ${inserted}/${rows.length} registros en product_images`)
    }
  }

  report.product_images_inserted = inserted
  report.product_images_failed = failedRows
}

async function runVerification(supabase, report) {
  log('Iniciando verificación post-carga...')

  // 1. Contar objetos en bucket products
  const { data: objects, error: listError } = await supabase.storage.from(BUCKET_NAME).list('', { limit: 1000 })
  if (listError) {
    report.verification.storage_count_error = listError.message
  } else {
    // Contar recursivamente todos los objetos
    let totalObjects = 0
    const countRecursive = async (prefix = '') => {
      const { data: list, error } = await supabase.storage.from(BUCKET_NAME).list(prefix, { limit: 1000 })
      if (error) throw error
      for (const item of list || []) {
        if (item.id) {
          totalObjects++
        } else {
          // Es un "folder"
          await countRecursive(prefix ? `${prefix}/${item.name}` : item.name)
        }
      }
    }
    await countRecursive()
    report.verification.storage_total_objects = totalObjects
  }

  // 2. Contar registros product_images para los 16 SKUs
  const skuList = [...new Set(report.uploaded_items.map((i) => i.sku))]
  const { data: imagesCount, error: countError } = await supabase
    .from('products')
    .select('sku, product_images(count)')
    .in('sku', skuList)

  if (countError) {
    report.verification.product_images_count_error = countError.message
  } else {
    report.verification.product_images_by_sku = imagesCount.map((row) => ({
      sku: row.sku,
      count: row.product_images[0]?.count || 0,
    }))
    report.verification.product_images_total = report.verification.product_images_by_sku.reduce(
      (sum, r) => sum + r.count,
      0,
    )
  }

  // 3. Verificar relación SKU → imagen principal
  const { data: mainImages, error: mainError } = await supabase
    .from('product_images')
    .select('product_id, url, sort_order, products!inner(sku)')
    .eq('sort_order', 0)
    .in('products.sku', skuList)

  if (mainError) {
    report.verification.main_images_error = mainError.message
  } else {
    report.verification.main_images = mainImages.map((img) => ({
      sku: img.products.sku,
      url: img.url,
    }))
  }

  // 4. Verificar duplicados de URL en product_images para estos productos
  const productIds = [...new Set(report.uploaded_items.map((i) => i.product_id))]
  const { data: dupUrls, error: dupError } = await supabase.rpc('find_duplicate_product_image_urls', {
    product_ids: productIds,
  })

  if (dupError) {
    // Fallback: contar URLs duplicadas manualmente
    const { data: allUrls, error: urlError } = await supabase
      .from('product_images')
      .select('url')
      .in('product_id', productIds)
    if (urlError) {
      report.verification.duplicates_error = urlError.message
    } else {
      const counts = {}
      for (const r of allUrls || []) counts[r.url] = (counts[r.url] || 0) + 1
      report.verification.duplicate_urls = Object.entries(counts)
        .filter(([_, c]) => c > 1)
        .map(([url, count]) => ({ url, count }))
    }
  } else {
    report.verification.duplicate_urls = dupUrls || []
  }

  log('Verificación completada')
}

async function main() {
  loadEnv()

  const plan = JSON.parse(fs.readFileSync(PLAN_PATH, 'utf8'))

  // Modo validación previa: no requiere service role key ni toca Supabase
  if (DRY_RUN) {
    log('MODO DRY-RUN: solo validación, no se subirá ni modificará nada')
    try {
      const uploads = await validatePlan(plan)
      log(`\n=== VALIDACIÓN OK ===`)
      log(`Imágenes planificadas: ${uploads.length}`)
      log(`SKUs: ${[...new Set(uploads.map((u) => u.sku))].length}`)
      log('Puedes ejecutar sin --dry-run para subir las imágenes.')
      process.exit(0)
    } catch (err) {
      logError(err.message)
      process.exit(1)
    }
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    logError('Faltan variables de entorno:')
    logError('  VITE_SUPABASE_URL=' + (supabaseUrl ? '***' : 'NO DEFINIDO'))
    logError('  SUPABASE_SERVICE_ROLE_KEY=' + (serviceRoleKey ? '***' : 'NO DEFINIDO'))
    logError('')
    logError('Ejemplo de uso:')
    logError('  VITE_SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=ey... node upload_real_media.cjs')
    process.exit(1)
  }

  const report = {
    started_at: new Date().toISOString(),
    supabase_url: supabaseUrl,
    total_planned: plan.uploads.length,
    uploaded_count: 0,
    skipped_count: 0,
    failed_count: 0,
    failed: [],
    uploaded_items: [],
    product_images_inserted: 0,
    product_images_failed: [],
    verification: {},
    completed_at: null,
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  try {
    const uploads = await validatePlan(plan)
    report.total_planned = uploads.length

    const uploadedItems = await uploadBatch(supabase, uploads, report)
    report.uploaded_items = uploadedItems

    if (report.failed_count > 0) {
      logError(`Hay ${report.failed_count} imágenes que fallaron. No se crearán product_images hasta resolver los errores.`)
      report.completed_at = new Date().toISOString()
      fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))
      process.exit(1)
    }

    log('Todas las imágenes fueron confirmadas en Storage. Procediendo a crear product_images...')
    await insertProductImages(supabase, uploadedItems, report)

    await runVerification(supabase, report)

    report.completed_at = new Date().toISOString()
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))

    log('\n=== RESUMEN ===')
    log(`Planificadas: ${report.total_planned}`)
    log(`Subidas: ${report.uploaded_count}`)
    log(`Omitidas (ya existían): ${report.skipped_count}`)
    log(`Fallidas: ${report.failed_count}`)
    log(`Registros product_images creados: ${report.product_images_inserted}`)
    log(`Objetos en Storage (total): ${report.verification.storage_total_objects ?? 'N/A'}`)
    log(`Registros product_images (total para SKUs): ${report.verification.product_images_total ?? 'N/A'}`)
    log(`URLs duplicadas: ${report.verification.duplicate_urls?.length ?? 'N/A'}`)
    log(`Reporte guardado en: ${REPORT_PATH}`)
  } catch (err) {
    logError(err.message)
    report.completed_at = new Date().toISOString()
    report.error = err.message
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))
    process.exit(1)
  }
}

main()
