import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { adminAuth } from '@/lib/firebase-admin'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const { phone, code } = await req.json()
    const cleaned = phone.replace(/\D/g, '').slice(-10)
    if (cleaned.length < 10 || !code) {
      return NextResponse.json({ error: 'Invalid phone or code' }, { status: 401 })
    }

    const rl = checkRateLimit(`verify-otp:${cleaned}`, { maxTokens: 10 })
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
    }

    // Find valid OTP
    const { data: otpRecord, error: findError } = await supabaseAdmin
      .from('bahja_otps')
      .select('*')
      .eq('phone', cleaned)
      .eq('code', code)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (findError || !otpRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 })
    }

    // Delete the used OTP
    await supabaseAdmin.from('bahja_otps').delete().eq('id', otpRecord.id)

    // Get or create Firebase user by phone
    const fullPhone = '+91' + cleaned
    let firebaseUid: string

    try {
      const fbUser = await adminAuth.getUserByPhoneNumber(fullPhone)
      firebaseUid = fbUser.uid
    } catch {
      const fbUser = await adminAuth.createUser({
        phoneNumber: fullPhone,
      })
      firebaseUid = fbUser.uid
    }

    // Generate Firebase custom token
    const customToken = await adminAuth.createCustomToken(firebaseUid)

    return NextResponse.json({ token: customToken })
  } catch (err: any) {
    console.error('Error in POST /api/auth/verify-whatsapp-otp:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
