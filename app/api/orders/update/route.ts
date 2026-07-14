import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/admin-auth'

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { order_id, tracking_number, admin_notes } = await req.json()
    if (!order_id) {
      return NextResponse.json({ error: 'order_id is required' }, { status: 400 })
    }
    const update: Record<string, any> = {}
    if (tracking_number !== undefined) update.tracking_number = tracking_number
    if (admin_notes !== undefined) update.admin_notes = admin_notes

    const { data, error } = await (await getSupabaseAdmin())
      .from('bahja_orders')
      .update(update)
      .eq('order_id', order_id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Error in PATCH /api/orders/update:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
