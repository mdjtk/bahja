import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signAdminSession } from '@/lib/admin-auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
    const { allowed, retryAfter } = checkRateLimit(`admin-verify:${ip}`, { maxTokens: 10 })
    if (!allowed) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(retryAfter) } })
    }

    const { password } = await req.json();
    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    let storedPassword = process.env.ADMIN_PASSWORD;
    if (!storedPassword) {
      try {
        const { data } = await supabaseAdmin
          .from('bahja_settings')
          .select('value')
          .eq('key', 'admin_password')
          .single()
        if (data) storedPassword = data.value
      } catch {
        console.error('Could not read bahja_settings (table may not exist yet)')
      }
    }

    if (!storedPassword) {
      return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
    }

    // Compare with bcrypt if already hashed, otherwise plaintext fallback
    let match: boolean
    if (storedPassword.startsWith('$2')) {
      match = await bcrypt.compare(password, storedPassword)
    } else {
      match = password === storedPassword
      // Upgrade plaintext to bcrypt hash on successful login
      if (match) {
        try {
          const hash = await bcrypt.hash(password, 10)
          await supabaseAdmin
            .from('bahja_settings')
            .update({ value: hash, updated_at: new Date().toISOString() })
            .eq('key', 'admin_password')
        } catch (err) {
          console.error('Failed to upgrade admin password hash:', err)
        }
      }
    }

    if (!match) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = signAdminSession();
    const response = NextResponse.json({ success: true });
    const isSecure = req.headers.get('x-forwarded-proto') === 'https' || process.env.NODE_ENV === 'production';
    response.cookies.set('bahja_admin', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    return response;
  } catch (err: any) {
    console.error('Admin verify error:', err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
