import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth-helpers'

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

export async function GET() {
  try {
    if (!process.env.SUPABASE_URL) throw new Error('SUPABASE_URL missing')
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing')

    const { data, error } = await supabaseAdmin
      .from('bahja_products')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json(data.map(mapProduct))
  } catch (err: any) {
    console.error('Error in GET /api/products:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from('bahja_products')
      .upsert({
        id: body.id,
        name: body.name,
        type: body.type,
        slug: body.slug,
        image: body.image,
        rating: body.rating || 5.0,
        description: body.description,
        variant_order: body.variantOrder || body.variant_order,
        variants: body.variants,
        active: body.active !== undefined ? body.active : true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(mapProduct(data), { status: 201 })
  } catch (err: any) {
    console.error('Error in POST /api/products:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
