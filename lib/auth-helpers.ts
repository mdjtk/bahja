import { NextRequest } from 'next/server'
import { getAdminAuth } from './firebase-admin'
import { verifyAdminSession } from './admin-auth'

export async function verifyAuth(req: Request) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    console.warn('[verifyAuth] Missing or invalid Authorization header')
    return null
  }
  try {
    const token = authHeader.slice(7)
    const decoded = await getAdminAuth().verifyIdToken(token)
    return decoded
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
