import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { data, error } = await (await getSupabaseAdmin())
    .from('bahja_coupons')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('Error fetching coupons:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 }) }
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { code, type, value, min_cart, max_uses, expires_at } = body
    if (!code || !value) {
      return NextResponse.json({ error: 'code and value are required' }, { status: 400 })
    }
    const { data, error } = await (await getSupabaseAdmin())
      .from('bahja_coupons')
      .insert({ code: code.toUpperCase(), type, value, min_cart: min_cart || 0, max_uses: max_uses || 0, expires_at: expires_at || null })
      .select()
      .single()
    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })
      console.error('Error inserting coupon:', error); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Error in POST /api/coupons:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
