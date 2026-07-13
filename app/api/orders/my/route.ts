import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyAuth } from '@/lib/auth-helpers'

export async function GET(req: Request) {
  const user = await verifyAuth(req)
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from('bahja_orders')
      .select('*')
      .eq('user_id', user.uid)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Error in GET /api/orders/my:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
