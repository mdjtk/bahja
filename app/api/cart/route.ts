import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAuth } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req)
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('bahja_cart')
      .select('*')
      .eq('user_id', user.uid)

    if (error) throw error
    return NextResponse.json(data.map((item) => ({
      id: item.product_id,
      variant: item.variant,
      qty: item.qty,
    })))
  } catch (err: any) {
    console.error('Error in GET /api/cart:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req)
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { product_id, variant, qty } = await req.json()

    const { data: existing } = await supabaseAdmin
      .from('bahja_cart')
      .select('*')
      .eq('user_id', user.uid)
      .eq('product_id', product_id)
      .eq('variant', variant)
      .single()

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('bahja_cart')
        .update({ qty })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json({ id: data.product_id, variant: data.variant, qty: data.qty })
    }

    const { data, error } = await supabaseAdmin
      .from('bahja_cart')
      .insert({
        user_id: user.uid,
        product_id,
        variant,
        qty,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ id: data.product_id, variant: data.variant, qty: data.qty })
  } catch (err: any) {
    console.error('Error in POST /api/cart:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await verifyAuth(req)
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { product_id, variant } = await req.json()

    const { error } = await supabaseAdmin
      .from('bahja_cart')
      .delete()
      .eq('user_id', user.uid)
      .eq('product_id', product_id)
      .eq('variant', variant)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Error in DELETE /api/cart:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
