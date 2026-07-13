import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { getSupabaseAdmin } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth-helpers'

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) {
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 })
  }

  try {
    const { order_id } = await req.json()
    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
    }

    const { data: order, error: fetchError } = await getSupabaseAdmin()
      .from('bahja_orders')
      .select('*')
      .eq('order_id', order_id)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.payment_method !== 'razorpay' || !order.razorpay_payment_id) {
      return NextResponse.json({ error: 'No Razorpay payment to refund' }, { status: 400 })
    }

    const razorpay = new Razorpay({ key_id, key_secret })
    const refund = await razorpay.payments.refund(order.razorpay_payment_id, {
      amount: Math.round(order.total * 100),
    })

    const { error: updateError } = await getSupabaseAdmin()
      .from('bahja_orders')
      .update({ status: 'Refunded', admin_notes: `Refund initiated: ${refund.id}` })
      .eq('order_id', order_id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, refund_id: refund.id })
  } catch (err: any) {
    console.error('Refund error:', err)
    return NextResponse.json({ error: err.message || 'Refund failed' }, { status: 500 })
  }
}
