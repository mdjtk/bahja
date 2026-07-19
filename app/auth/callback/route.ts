import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/account'
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  const cookieHeader = req.headers.get('cookie') || ''
  const parsedCookies = cookieHeader.split(';').map(c => {
    const [name, ...rest] = c.trim().split('=')
    return { name, value: rest.join('=') }
  }).filter(c => c.name)

  let sessionCookies: { name: string; value: string; options?: any }[] = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return parsedCookies },
        setAll(cookiesToSet) { sessionCookies = cookiesToSet },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[Auth callback] exchangeCodeForSession error:', error)
    return NextResponse.redirect(`${origin}/auth/login`)
  }

  const user = data?.session?.user
  let finalUrl: string

  if (user) {
    const { getSupabaseAdmin } = await import('@/lib/supabase')
    const admin = await getSupabaseAdmin()
    const { data: profile } = await admin
      .from('bahja_user_profiles')
      .select('phone')
      .eq('uid', user.id)
      .single()

    if (!profile?.phone) {
      finalUrl = `${origin}/auth/phone?next=${encodeURIComponent(next)}`
    } else {
      finalUrl = `${origin}${next}`
    }
  } else {
    finalUrl = `${origin}${next}`
  }

  const response = NextResponse.redirect(finalUrl)
  sessionCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options)
  )

  return response
}
