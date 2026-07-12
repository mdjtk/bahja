import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAuth } from '@/lib/auth-helpers'

export async function POST(req: Request) {
  const user = await verifyAuth(req)
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const phone = (user.phone_number || '').replace(/\D/g, '').slice(-10)
  if (!phone) {
    return NextResponse.json({ error: 'No phone number on account' }, { status: 400 })
  }

  try {
    const { data: orders, error: fetchError } = await supabaseAdmin
      .from('bahja_orders')
      .select('order_id')
      .is('user_id', null)
      .eq('phone', phone)

    if (fetchError) throw fetchError

    if (!orders || orders.length === 0) {
      return NextResponse.json({ claimed: 0 })
    }

    const ids = orders.map((o) => o.order_id)
    const { error: updateError } = await supabaseAdmin
      .from('bahja_orders')
      .update({ user_id: user.uid })
      .in('order_id', ids)

    if (updateError) throw updateError

    return NextResponse.json({ claimed: ids.length })
  } catch (err: any) {
    console.error('Error in POST /api/orders/claim:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
