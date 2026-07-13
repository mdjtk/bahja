import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendOtpViaWhatsApp } from '@/lib/whatsapp'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()
    const cleaned = phone.replace(/\D/g, '').slice(-10)
    if (cleaned.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const rl = checkRateLimit(`otp:${cleaned}`, { maxTokens: 3 })
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } })
    }

    const fullPhone = '+91' + cleaned
    const otp = String(Math.floor(100000 + Math.random() * 900000))

    await getSupabaseAdmin()
      .from('bahja_otps')
      .delete()
      .eq('phone', cleaned)
      .lt('expires_at', new Date().toISOString())

    const { error: insertError } = await getSupabaseAdmin()
      .from('bahja_otps')
      .insert({
        phone: cleaned,
        code: otp,
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      })

    if (insertError) throw insertError

    // Attempt WhatsApp send; fall back to returning OTP directly
    let whatsappSent = false
    try {
      await sendOtpViaWhatsApp(fullPhone, otp)
      whatsappSent = true
    } catch (waErr) {
      console.warn('WhatsApp send failed, falling back to direct OTP:', waErr)
    }

    return NextResponse.json({ sent: whatsappSent, otp: whatsappSent ? undefined : otp })
  } catch (err: any) {
    console.error('Send OTP error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}