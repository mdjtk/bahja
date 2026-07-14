// Server-side product helpers — always reads from Supabase (single source of truth).

import { getSupabaseAdmin } from './supabase'
import type { Product } from './data'

function mapProduct(p: any): Product {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    slug: p.slug,
    image: p.image,
    rating: p.rating,
    description: p.description,
    variantOrder: p.variant_order,
    variants: p.variants,
    active: p.active,
  }
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await (await getSupabaseAdmin())
    .from('bahja_products')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return (data || []).filter((p: any) => p.active !== false).map(mapProduct)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await (await getSupabaseAdmin())
    .from('bahja_products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return mapProduct(data)
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await (await getSupabaseAdmin())
    .from('bahja_products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return mapProduct(data)
}
