import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

function mapProduct(p: any) {
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
    created_at: p.created_at,
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()

    const { data, error } = await (await getSupabaseAdmin())
      .from('bahja_products')
      .update({
        name: body.name,
        type: body.type,
        slug: body.slug,
        image: body.image,
        rating: body.rating,
        description: body.description,
        variant_order: body.variantOrder || body.variant_order,
        variants: body.variants,
        active: body.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      throw error
    }
    return NextResponse.json(mapProduct(data))
  } catch (err: any) {
    console.error('Error in PUT /api/products/[id]:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { data, error } = await (await getSupabaseAdmin())
      .from('bahja_products')
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      throw error
    }
    return NextResponse.json(mapProduct(data))
  } catch (err: any) {
    console.error('Error in DELETE /api/products/[id]:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
