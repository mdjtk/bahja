import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET env not set')
  return secret
}

export function signAdminSession(): string {
  return jwt.sign({ role: 'admin', ts: Date.now() }, getSecret(), { algorithm: 'HS256', expiresIn: '24h' })
}

export function verifyAdminSession(token: string): boolean {
  try {
    jwt.verify(token, getSecret(), { algorithms: ['HS256'] })
    return true
  } catch {
    return false
  }
}

export function isAdmin(req: NextRequest): boolean {
  const cookie = req.headers.get('cookie') || ''
  const match = cookie.split(';').map(c => c.trim()).find(c => c.startsWith('bahja_admin='))
  if (!match) return false
  const token = match.split('=')[1]
  if (!token) return false
  return verifyAdminSession(token)
}
