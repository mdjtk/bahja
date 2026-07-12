import { auth } from './firebase'

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const user = auth.currentUser
  const headers = new Headers(init?.headers)

  if (user) {
    try {
      const token = await user.getIdToken()
      headers.set('Authorization', `Bearer ${token}`)
    } catch (err) {
      console.error('[fetchWithAuth] Failed to get ID token:', err)
    }
  } else {
    console.warn('[fetchWithAuth] No current user for request:', input)
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(input, { ...init, headers })
}
