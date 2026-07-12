import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ADMIN_ROUTES = ['/admin/login', '/api/admin/verify']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public admin routes through without auth
  if (PUBLIC_ADMIN_ROUTES.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
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

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
