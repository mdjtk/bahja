import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth-helpers'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const body = await req.json()
    const update: Record<string, any> = {}
    if (body.code !== undefined) update.code = body.code.toUpperCase()
    if (body.type !== undefined) update.type = body.type
    if (body.value !== undefined) update.value = body.value
    if (body.min_cart !== undefined) update.min_cart = body.min_cart
    if (body.max_uses !== undefined) update.max_uses = body.max_uses
    if (body.expires_at !== undefined) update.expires_at = body.expires_at || null
    if (body.active !== undefined) update.active = body.active

    const { data, error } = await supabaseAdmin
      .from('bahja_coupons')
      .update(update)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })
      console.error('Error updating coupon:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Error in PUT /api/coupons/[id]:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await params
    const { data, error } = await supabaseAdmin
      .from('bahja_coupons')
      .update({ active: false })
      .eq('id', id)
      .select()
      .single()
    if (error) { console.error('Error deleting coupon:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Error in DELETE /api/coupons/[id]:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
