/**
 * Categories Service
 *
 * Loads active categories from Supabase.
 */

import { supabase } from '@/lib/supabase'
import type { Category } from '@/types'

export async function getActiveCategories(): Promise<{
  data: Category[]
  error: string | null
}> {
  const client = supabase()
  if (!client) return { data: [], error: 'Supabase not configured' }

  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) return { data: [], error: error.message }

  return {
    data:
      data?.map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.name,
        description: category.description ?? '',
        imageUrl: category.image_url ?? undefined,
      })) ?? [],
    error: null,
  }
}
