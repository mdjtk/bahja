import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyAuth } from '@/lib/auth-helpers'

export async function POST(req: NextRequest) {
  const decoded = await verifyAuth(req)
  if (!decoded) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const { order_id } = await req.json()
    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    const { data: order, error: fetchError } = await (await getSupabaseAdmin())
      .from('bahja_orders')
      .select('*')
      .eq('order_id', order_id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.user_id !== decoded.uid) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'Delivered' || order.status === 'Cancelled') {
      return NextResponse.json({ error: 'Order cannot be cancelled' }, { status: 400 })
    }

    const { error: updateError } = await (await getSupabaseAdmin())
      .from('bahja_orders')
      .update({ status: 'Cancelled' })
      .eq('order_id', order_id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Cancel order error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
