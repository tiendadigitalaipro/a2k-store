/**
 * Catalog Service
 *
 * Handles products, categories, brands, variants, images.
 * Separates UI from Supabase implementation.
 */

import { supabase } from '@/lib/supabase'
import type { Product, ProductVariant, ProductImage, Category, Subcategory, Brand } from '@/lib/supabase/types'

// ============================================================
// Products
// ============================================================

export async function getProducts(options?: {
  categorySlug?: string
  subcategorySlug?: string
  brandSlug?: string
  search?: string
  featured?: boolean
  isNew?: boolean
  inStock?: boolean
  minPrice?: number
  maxPrice?: number
  sort?: 'relevance' | 'price-asc' | 'price-desc' | 'newest' | 'rating'
  limit?: number
  offset?: number
}): Promise<{ data: Product[] | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  let query = client
    .from('products')
    .select('*')
    .eq('status', 'active')

  if (options?.categorySlug) {
    query = query.eq('category_slug', options.categorySlug)
  }
  if (options?.featured) {
    query = query.eq('is_featured', true)
  }
  if (options?.isNew) {
    query = query.eq('is_new', true)
  }
  if (options?.inStock) {
    query = query.gt('stock', 0)
  }
  if (options?.minPrice !== undefined) {
    query = query.gte('price', options.minPrice)
  }
  if (options?.maxPrice !== undefined) {
    query = query.lte('price', options.maxPrice)
  }
  if (options?.search) {
    query = query.or(
      `name.ilike.%${options.search}%,` +
      `description.ilike.%${options.search}%,` +
      `sku.ilike.%${options.search}%`,
    )
  }

  // Sort
  switch (options?.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1)
  }

  const { data, error } = await query
  return { data, error: error?.message ?? null }
}

export async function getProductBySlug(
  slug: string,
): Promise<{ data: Product | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  return { data, error: error?.message ?? null }
}

export async function getProductVariants(
  productId: string,
): Promise<{ data: ProductVariant[] | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .eq('is_active', true)
    .order('sort_order')

  return { data, error: error?.message ?? null }
}

export async function getProductImages(
  productId: string,
): Promise<{ data: ProductImage[] | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('product_images')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order')

  return { data, error: error?.message ?? null }
}

// ============================================================
// Categories
// ============================================================

export async function getCategories(): Promise<{
  data: Category[] | null
  error: string | null
}> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  return { data, error: error?.message ?? null }
}

export async function getSubcategories(
  categoryId: string,
): Promise<{ data: Subcategory[] | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('subcategories')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('sort_order')

  return { data, error: error?.message ?? null }
}

// ============================================================
// Brands
// ============================================================

export async function getBrands(): Promise<{
  data: Brand[] | null
  error: string | null
}> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('name')

  return { data, error: error?.message ?? null }
}

export async function getBrandBySlug(
  slug: string,
): Promise<{ data: Brand | null; error: string | null }> {
  const client = supabase()
  if (!client) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await client
    .from('brands')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  return { data, error: error?.message ?? null }
}
