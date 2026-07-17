import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
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
    const { data: otpRecord, error: findError } = await (await getSupabaseAdmin())
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
    await (await getSupabaseAdmin()).from('bahja_otps').delete().eq('id', otpRecord.id)

    // Get or create Supabase user by phone
    const fullPhone = '+91' + cleaned
    const supabase = await getSupabaseAdmin()

    // Check if user exists by listing users with phone
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) throw listError

    let userId: string | undefined = existingUsers?.users?.find((u: any) => u.phone === fullPhone)?.id

    if (!userId) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        phone: fullPhone,
        phone_confirm: true,
      })
      if (createError) throw createError
      userId = newUser.user?.id
    }

    return NextResponse.json({ success: true, userId })
  } catch (err: any) {
    console.error('Error in POST /api/auth/verify-whatsapp-otp:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
