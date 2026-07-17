import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-helpers'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyAuth(req)
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phone } = await req.json()
    const cleaned = phone?.replace(/\s+/g, '')
    if (!cleaned || !/^\d{10}$/.test(cleaned)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const fullPhone = `+91${cleaned}`

    const { error: upsertError } = await (await getSupabaseAdmin())
      .from('bahja_user_profiles')
      .upsert(
        { uid: decoded.uid, phone: fullPhone, updated_at: new Date().toISOString() },
        { onConflict: 'uid' }
      )

    if (upsertError) {
      console.error('Failed to save phone to profile:', upsertError)
    }

    return NextResponse.json({ success: true, phone: fullPhone })
  } catch (err: any) {
    console.error('Error updating phone:', err); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
