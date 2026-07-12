import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth-helpers'

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { order_id, status } = await req.json()
    if (!order_id || !status) {
      return NextResponse.json({ error: 'order_id and status are required' }, { status: 400 })
    }

    const validStatuses = ['Confirmed', 'Preparing', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('bahja_orders')
      .update({ status })
      .eq('order_id', order_id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Error in PATCH /api/orders/status:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
