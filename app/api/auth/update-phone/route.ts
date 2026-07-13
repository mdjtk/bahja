import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase-admin'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const decoded = await getAdminAuth().verifyIdToken(token)
    const { phone } = await req.json()

    const cleaned = phone?.replace(/\s+/g, '')
    if (!cleaned || !/^\d{10}$/.test(cleaned)) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const fullPhone = `+91${cleaned}`
    await getAdminAuth().updateUser(decoded.uid, { phoneNumber: fullPhone })

    const { error: upsertError } = await getSupabaseAdmin()
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
    if (err.code === 'auth/phone-number-already-exists') {
      return NextResponse.json({ error: 'Phone number already in use by another account' }, { status: 409 })
    }
    console.error('Error updating phone:', err); return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
