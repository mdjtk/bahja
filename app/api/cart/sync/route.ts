import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAuth } from '@/lib/auth-helpers'

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req)
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { items } = await req.json()
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ synced: 0 })
    }

    for (const item of items) {
      // Validate product and variant exist
      const { data: product } = await supabaseAdmin
        .from('bahja_products')
        .select('variants')
        .eq('id', item.id)
        .single()

      if (!product) continue // skip invalid products
      const variantData = product.variants?.[item.variant]
      if (!variantData) continue

      const { data: existing } = await supabaseAdmin
        .from('bahja_cart')
        .select('*')
        .eq('user_id', user.uid)
        .eq('product_id', item.id)
        .eq('variant', item.variant)
        .single()

      if (existing) {
        await supabaseAdmin
          .from('bahja_cart')
          .update({ qty: item.qty })
          .eq('id', existing.id)
      } else {
        await supabaseAdmin
          .from('bahja_cart')
          .insert({
            user_id: user.uid,
            product_id: item.id,
            variant: item.variant,
            qty: item.qty,
          })
      }
    }

    return NextResponse.json({ synced: items.length })
  } catch (err: any) {
    console.error('Error in POST /api/cart/sync:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
