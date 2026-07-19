import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/account'
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin

  if (code) {
    const supabaseResponse = NextResponse.redirect(`${origin}${next}`)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            const cookieHeader = req.headers.get('cookie') || ''
            return cookieHeader.split(';').map(c => {
              const [name, ...rest] = c.trim().split('=')
              return { name, value: rest.join('=') }
            }).filter(c => c.name)
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return supabaseResponse
    }
    console.error('[Auth callback] exchangeCodeForSession error:', error)
  }

  return NextResponse.redirect(`${origin}/auth/login`)
}
