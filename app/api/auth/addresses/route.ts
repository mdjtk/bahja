import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAuth } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  const user = await verifyAuth(req)
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { data } = await supabaseAdmin
      .from('bahja_user_profiles')
      .select('address, city, state, pincode')
      .eq('uid', user.uid)
      .single()

    return NextResponse.json({
      addresses: data?.address
        ? [{ id: 'saved', line: data.address, city: data.city || '', state: data.state || '', pincode: data.pincode || '' }]
        : [],
    })
  } catch {
    return NextResponse.json({ addresses: [] })
  }
}

export async function POST(req: NextRequest) {
  const user = await verifyAuth(req)
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { address, city, state, pincode } = await req.json()
    const { error } = await supabaseAdmin
      .from('bahja_user_profiles')
      .upsert({
        uid: user.uid,
        address,
        city,
        state,
        pincode,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'uid' })

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Save address error:', err)
    return NextResponse.json({ error: 'Failed to save address' }, { status: 500 })
  }
}
