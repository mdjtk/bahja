import { NextRequest } from 'next/server'
import { verifyAdminSession } from './admin-auth'

export async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    console.warn('[verifyAuth] Missing or invalid Authorization header')
    return null
  }
  try {
    const token = authHeader.slice(7)
    const { getSupabaseAdmin } = await import('./supabase')
    const supabase = await getSupabaseAdmin()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      console.error('[verifyAuth] Supabase token verification failed:', error)
      return null
    }
    return {
      uid: user.id,
      email: user.email,
      phone_number: user.phone,
      ...user.user_metadata,
    }
  } catch (err) {
    console.error('[verifyAuth] Token verification failed:', err)
    return null
  }
}

export function isAdmin(req: NextRequest) {
  const cookie = req.headers.get('cookie') || ''
  const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('bahja_admin='))
  if (!match) return false
  const token = match.split('=')[1]
  if (!token) return false
  return verifyAdminSession(token)
}
