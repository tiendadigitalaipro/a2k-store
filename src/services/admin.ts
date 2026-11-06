/**
 * Admin Service (Fase 19)
 *
 * Panel del dueño: gestión de productos, variantes, imágenes (Storage)
 * y pedidos. Toda operación se apoya en las políticas RLS existentes:
 * solo perfiles con rol admin/superadmin activos pueden escribir.
 *
 * - products / product_variants / product_images: CRUD admin (00010 RLS)
 * - Storage bucket `products`: lectura pública, escritura admin (00022)
 * - orders: lectura + cambio de estado admin; el trigger
 *   trg_orders_log_status_change registra el historial solo.
 */

import { supabase } from '@/lib/supabase'

// ============================================================
// Types
// ============================================================

export interface AdminProduct {
  id: string
  slug: string
  name: string
  description: string
  short_description: string
  price: number
  compare_at_price: number | null
  currency: string
  stock: number
  sku: string
  tags: string[]
  status: 'active' | 'inactive' | 'archived'
  is_featured: boolean
  is_new: boolean
  category_id: string | null
  created_at: string
}

export interface AdminVariant {
  id: string
  product_id: string
  name: string
  sku: string
  price: number | null
  stock: number
  is_active: boolean
  sort_order: number
}

export interface AdminImage {
  id: string
  product_id: string
  url: string
  sort_order: number
}

export interface AdminCategory {
  id: string
  slug: string
  name: string
  is_active: boolean
}

export interface AdminOrder {
  id: string
  order_number: string
  status: string
  delivery_method: string
  subtotal: number
  shipping_cost: number
  total: number
  currency: string
  created_at: string
}

export interface AdminProductFull extends AdminProduct {
  variants: AdminVariant[]
  images: AdminImage[]
}

export interface ProductInput {
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  compare_at_price: number | null
  stock: number
  sku: string
  tags: string[]
  status: AdminProduct['status']
  is_featured: boolean
  is_new: boolean
  category_id: string | null
}

function needClient() {
  const client = supabase()
  if (!client) throw new Error('Supabase no está configurado')
  return client
}

// ============================================================
// Helpers
// ============================================================

export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  const client = needClient()
  let candidate = base || 'producto'
  for (let i = 2; i <= 50; i++) {
    const { data } = await client
      .from('products')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()
    if (!data || data.id === excludeId) return candidate
    candidate = `${base}-${i}`
  }
  return `${base}-${Date.now()}`
}

// ============================================================
// Products
// ============================================================

export async function listAdminProducts(): Promise<{
  data: AdminProductFull[]
  error: string | null
}> {
  try {
    const client = needClient()
    const [{ data: products, error }, { data: variants }, { data: images }] = await Promise.all([
      client.from('products').select('*').order('created_at', { ascending: false }),
      client.from('product_variants').select('*').order('sort_order'),
      client.from('product_images').select('*').order('sort_order'),
    ])
    if (error) return { data: [], error: error.message }

    const byProduct = <T extends { product_id: string }>(rows: T[] | null) => {
      const map: Record<string, T[]> = {}
      for (const row of rows ?? []) {
        ;(map[row.product_id] ??= []).push(row)
      }
      return map
    }

    const vMap = byProduct(variants)
    const iMap = byProduct(images)

    const full: AdminProductFull[] = (products ?? []).map((p: Record<string, unknown>) => ({
      ...(p as unknown as AdminProduct),
      variants: (vMap[String(p.id)] ?? []) as AdminVariant[],
      images: (iMap[String(p.id)] ?? []) as AdminImage[],
    }))

    return { data: full, error: null }
  } catch (e) {
    return { data: [], error: e instanceof Error ? e.message : 'Error inesperado' }
  }
}

export async function createProduct(
  input: ProductInput,
): Promise<{ data: AdminProduct | null; error: string | null }> {
  try {
    const client = needClient()
    const slug = await uniqueSlug(input.slug || slugify(input.name))
    const { data, error } = await client
      .from('products')
      .insert({ ...input, slug, currency: 'USD' })
      .select('*')
      .single()
    if (error) return { data: null, error: error.message }
    return { data: data as AdminProduct, error: null }
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Error inesperado' }
  }
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<{ error: string | null }> {
  try {
    const client = needClient()
    const patch = { ...input }
    if (input.slug) patch.slug = await uniqueSlug(input.slug, id)
    const { error } = await client.from('products').update(patch).eq('id', id)
    return { error: error?.message ?? null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error inesperado' }
  }
}

/** Borrado suave: archived sale del catálogo sin perder historial de pedidos. */
export async function archiveProduct(id: string): Promise<{ error: string | null }> {
  const client = needClient()
  const { error } = await client.from('products').update({ status: 'archived' }).eq('id', id)
  return { error: error?.message ?? null }
}

// ============================================================
// Variants
// ============================================================

export async function createVariant(
  productId: string,
  input: { name: string; sku: string; price: number | null; stock: number },
): Promise<{ error: string | null }> {
  try {
    const client = needClient()
    const { data: last } = await client
      .from('product_variants')
      .select('sort_order')
      .eq('product_id', productId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()
    const sortOrder = (last?.sort_order ?? -1) + 1
    const { error } = await client
      .from('product_variants')
      .insert({ product_id: productId, is_active: true, sort_order: sortOrder, ...input })
    return { error: error?.message ?? null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error inesperado' }
  }
}

export async function updateVariant(
  id: string,
  input: Partial<{ name: string; sku: string; price: number | null; stock: number; is_active: boolean }>,
): Promise<{ error: string | null }> {
  const client = needClient()
  const { error } = await client.from('product_variants').update(input).eq('id', id)
  return { error: error?.message ?? null }
}

export async function deleteVariant(id: string): Promise<{ error: string | null }> {
  const client = needClient()
  const { error } = await client.from('product_variants').delete().eq('id', id)
  return { error: error?.message ?? null }
}

// ============================================================
// Images (Storage bucket `products`)
// ============================================================

const MAX_SIZE = 10 * 1024 * 1024 // 10 MB, igual que el bucket
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function uploadProductImage(
  productId: string,
  file: File,
): Promise<{ data: AdminImage | null; error: string | null }> {
  try {
    if (!ALLOWED.includes(file.type)) {
      return { data: null, error: 'Formato no permitido. Usa JPG, PNG, WebP o GIF.' }
    }
    if (file.size > MAX_SIZE) {
      return { data: null, error: 'La imagen pesa más de 10 MB.' }
    }

    const client = needClient()
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'webp'
    const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    const { error: upError } = await client.storage.from('products').upload(path, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    })
    if (upError) return { data: null, error: `No se pudo subir: ${upError.message}` }

    const { data: publicUrl } = client.storage.from('products').getPublicUrl(path)
    if (!publicUrl?.publicUrl) {
      return { data: null, error: 'La imagen se subió pero no se pudo obtener su URL.' }
    }

    const { data: last } = await client
      .from('product_images')
      .select('sort_order')
      .eq('product_id', productId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: img, error: insError } = await client
      .from('product_images')
      .insert({
        product_id: productId,
        url: publicUrl.publicUrl,
        alt: file.name.replace(/\.[^.]+$/, ''),
        sort_order: (last?.sort_order ?? -1) + 1,
      })
      .select('*')
      .single()
    if (insError) return { data: null, error: insError.message }

    return { data: img as AdminImage, error: null }
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : 'Error inesperado' }
  }
}

/** Marca una imagen como principal (sort_order más bajo). */
export async function setPrimaryImage(productId: string, imageId: string): Promise<{ error: string | null }> {
  try {
    const client = needClient()
    const { data: images } = await client
      .from('product_images')
      .select('id')
      .eq('product_id', productId)
    const ordered = (images ?? []).map((r) => r.id)
    const target = ordered.indexOf(imageId)
    if (target < 0) return { error: 'Imagen no encontrada' }
    const reordered = [imageId, ...ordered.filter((id) => id !== imageId)]
    for (let i = 0; i < reordered.length; i++) {
      const { error } = await client
        .from('product_images')
        .update({ sort_order: i })
        .eq('id', reordered[i])
      if (error) return { error: error.message }
    }
    return { error: null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error inesperado' }
  }
}

export async function deleteProductImage(image: AdminImage): Promise<{ error: string | null }> {
  try {
    const client = needClient()
    const marker = '/storage/v1/object/public/products/'
    const idx = image.url.indexOf(marker)
    if (idx >= 0) {
      const path = image.url.slice(idx + marker.length)
      const { error: rmError } = await client.storage.from('products').remove([path])
      if (rmError) return { error: `No se pudo borrar el archivo: ${rmError.message}` }
    }
    const { error } = await client.from('product_images').delete().eq('id', image.id)
    return { error: error?.message ?? null }
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error inesperado' }
  }
}

// ============================================================
// Categories
// ============================================================

export async function listCategories(): Promise<{ data: AdminCategory[]; error: string | null }> {
  const client = needClient()
  const { data, error } = await client
    .from('categories')
    .select('id, slug, name, is_active')
    .order('name')
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as AdminCategory[], error: null }
}

// ============================================================
// Orders
// ============================================================

export async function listAdminOrders(limit = 100): Promise<{
  data: AdminOrder[]
  error: string | null
}> {
  const client = needClient()
  const { data, error } = await client
    .from('orders')
    .select('id, order_number, status, delivery_method, subtotal, shipping_cost, total, currency, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return { data: [], error: error.message }
  return { data: (data ?? []) as AdminOrder[], error: null }
}

/** El trigger trg_orders_log_status_change deja el historial automáticamente. */
export async function updateOrderStatus(
  orderId: string,
  status: AdminOrder['status'],
): Promise<{ error: string | null }> {
  const client = needClient()
  const { error } = await client.from('orders').update({ status }).eq('id', orderId)
  return { error: error?.message ?? null }
}

// ============================================================
// Dashboard stats
// ============================================================

export interface AdminStats {
  totalProducts: number
  activeProducts: number
  outOfStock: number
  totalOrders: number
  pendingOrders: number
  deliveredOrders: number
  revenue: number
}

export async function getAdminStats(): Promise<{
  data: AdminStats
  error: string | null
}> {
  try {
    const client = needClient()
    const [{ data: products }, { data: orders }] = await Promise.all([
      client.from('products').select('status, stock'),
      client.from('orders').select('status, total, currency'),
    ])

    const stats: AdminStats = {
      totalProducts: products?.length ?? 0,
      activeProducts: (products ?? []).filter((p) => p.status === 'active').length,
      outOfStock: (products ?? []).filter((p) => p.status === 'active' && Number(p.stock) <= 0).length,
      totalOrders: orders?.length ?? 0,
      pendingOrders: (orders ?? []).filter((o) =>
        ['pending_payment', 'payment_verification', 'preparing'].includes(o.status),
      ).length,
      deliveredOrders: (orders ?? []).filter((o) => o.status === 'delivered').length,
      revenue: (orders ?? [])
        .filter((o) => ['payment_approved', 'preparing', 'shipped', 'delivered'].includes(o.status))
        .reduce((sum, o) => sum + Number(o.total ?? 0), 0),
    }
    return { data: stats, error: null }
  } catch (e) {
    return {
      data: { totalProducts: 0, activeProducts: 0, outOfStock: 0, totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, revenue: 0 },
      error: e instanceof Error ? e.message : 'Error inesperado',
    }
  }
}
