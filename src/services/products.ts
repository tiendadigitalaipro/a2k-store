/**
 * Products Service
 *
 * Loads products, variants and images from Supabase.
 */

import { supabase } from '@/lib/supabase'
import type { Product, ProductVariant } from '@/types'
import type { Product as DBProduct, ProductVariant as DBVariant, ProductImage } from '@/lib/supabase/types'

function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const value = String(item[key])
    if (!acc[value]) acc[value] = []
    acc[value].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

function mapVariant(variant: DBVariant): ProductVariant {
  return {
    id: variant.id,
    name: variant.name,
    sku: variant.sku,
    price: variant.price ?? 0,
    stock: variant.stock,
  }
}

interface MapContext {
  categoriesMap: Map<string, { id: string; slug: string; name: string }>
  variantsMap: Record<string, DBVariant[]>
  imagesMap: Record<string, ProductImage[]>
}

function mapProduct(product: DBProduct, ctx: MapContext): Product {
  const category = product.category_id ? ctx.categoriesMap.get(product.category_id) : undefined
  const variants = (ctx.variantsMap[product.id] ?? [])
    .filter((v) => v.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapVariant)

  const images = (ctx.imagesMap[product.id] ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.url)

  const imageUrl = images[0] ?? ''
  const gallery = images.slice(1)

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description ?? '',
    shortDescription: product.short_description ?? '',
    price: Number(product.price),
    compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : undefined,
    currency: product.currency,
    imageUrl,
    gallery: gallery.length > 0 ? gallery : undefined,
    categoryId: category?.id ?? product.category_id ?? '',
    categorySlug: category?.slug,
    categoryName: category?.name,
    stock: product.stock,
    sku: product.sku,
    tags: product.tags ?? [],
    variants: variants.length > 0 ? variants : undefined,
    isFeatured: product.is_featured,
    isNew: product.is_new,
  }
}

export async function getActiveProducts(): Promise<{
  data: Product[]
  error: string | null
}> {
  const client = supabase()
  if (!client) return { data: [], error: 'Supabase not configured' }

  const { data: products, error } = await client
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) return { data: [], error: error.message }
  if (!products || products.length === 0) return { data: [], error: null }

  const productIds = products.map((p) => p.id)

  const [{ data: variants }, { data: images }, { data: categories }] = await Promise.all([
    client.from('product_variants').select('*').in('product_id', productIds),
    client.from('product_images').select('*').in('product_id', productIds).order('sort_order'),
    client.from('categories').select('*').eq('is_active', true),
  ])

  const ctx: MapContext = {
    categoriesMap: new Map((categories ?? []).map((c) => [c.id, c])),
    variantsMap: groupBy(variants ?? [], 'product_id'),
    imagesMap: groupBy(images ?? [], 'product_id'),
  }

  return { data: products.map((p) => mapProduct(p, ctx)), error: null }
}

export async function getProductBySlug(
  slug: string,
): Promise<{ data: Product | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data: product, error } = await client
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error) return { data: null, error: error.message }
  if (!product) return { data: null, error: null }

  const [{ data: variants }, { data: images }, { data: categories }] = await Promise.all([
    client.from('product_variants').select('*').eq('product_id', product.id),
    client.from('product_images').select('*').eq('product_id', product.id).order('sort_order'),
    client.from('categories').select('*').eq('is_active', true),
  ])

  const ctx: MapContext = {
    categoriesMap: new Map((categories ?? []).map((c) => [c.id, c])),
    variantsMap: groupBy(variants ?? [], 'product_id'),
    imagesMap: groupBy(images ?? [], 'product_id'),
  }

  return { data: mapProduct(product, ctx), error: null }
}

export async function getFeaturedProducts(limit = 4): Promise<{
  data: Product[]
  error: string | null
}> {
  const client = supabase()
  if (!client) return { data: [], error: 'Supabase not configured' }

  const { data: products, error } = await client
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { data: [], error: error.message }
  if (!products || products.length === 0) return { data: [], error: null }

  const productIds = products.map((p) => p.id)

  const [{ data: variants }, { data: images }, { data: categories }] = await Promise.all([
    client.from('product_variants').select('*').in('product_id', productIds),
    client.from('product_images').select('*').in('product_id', productIds).order('sort_order'),
    client.from('categories').select('*').eq('is_active', true),
  ])

  const ctx: MapContext = {
    categoriesMap: new Map((categories ?? []).map((c) => [c.id, c])),
    variantsMap: groupBy(variants ?? [], 'product_id'),
    imagesMap: groupBy(images ?? [], 'product_id'),
  }

  return { data: products.map((p) => mapProduct(p, ctx)), error: null }
}

export async function getNewProducts(limit = 4): Promise<{
  data: Product[]
  error: string | null
}> {
  const client = supabase()
  if (!client) return { data: [], error: 'Supabase not configured' }

  const { data: products, error } = await client
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { data: [], error: error.message }
  if (!products || products.length === 0) return { data: [], error: null }

  const productIds = products.map((p) => p.id)

  const [{ data: variants }, { data: images }, { data: categories }] = await Promise.all([
    client.from('product_variants').select('*').in('product_id', productIds),
    client.from('product_images').select('*').in('product_id', productIds).order('sort_order'),
    client.from('categories').select('*').eq('is_active', true),
  ])

  const ctx: MapContext = {
    categoriesMap: new Map((categories ?? []).map((c) => [c.id, c])),
    variantsMap: groupBy(variants ?? [], 'product_id'),
    imagesMap: groupBy(images ?? [], 'product_id'),
  }

  return { data: products.map((p) => mapProduct(p, ctx)), error: null }
}
