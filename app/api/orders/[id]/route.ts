import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyAuth } from '@/lib/auth-helpers'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const decoded = await verifyAuth(req)
  if (!decoded) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { data, error } = await getSupabaseAdmin()
      .from('bahja_orders')
      .select('*')
      .eq('order_id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (data.user_id !== decoded.uid) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Error in GET /api/orders/[id]:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
