import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ADMIN_ROUTES = ['/admin/login', '/api/admin/verify']

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session to keep auth cookies alive
  await supabase.auth.getUser()

  const { pathname } = req.nextUrl

  // Allow public admin routes through without auth
  if (PUBLIC_ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
    return supabaseResponse
  }

  // Restrict all other admin routes
  if (pathname.startsWith('/api/admin')) {
    const cookie = req.headers.get('cookie') || ''
    const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('bahja_admin='))
    if (!match) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (pathname.startsWith('/admin')) {
    const cookie = req.headers.get('cookie') || ''
    const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('bahja_admin='))
    if (!match) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
