import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const decoded = await getAdminAuth().verifyIdToken(token)
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
