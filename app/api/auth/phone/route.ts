import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-helpers'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyAuth(req)
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const uid = decoded.uid
    const { data } = await (await getSupabaseAdmin())
      .from('bahja_user_profiles')
      .select('phone')
      .eq('uid', uid)
      .single()

    const phone = data?.phone || ''

    return NextResponse.json({ phone })
  } catch (err: any) {
    console.error('Error fetching phone:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
