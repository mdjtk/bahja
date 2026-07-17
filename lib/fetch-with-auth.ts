import { getSupabaseBrowser } from './supabase-browser'

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
  const supabase = getSupabaseBrowser()
  const headers = new Headers(init?.headers)

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`)
    } else {
      console.warn('[fetchWithAuth] No active session for request:', input)
    }
  } catch (err) {
    console.error('[fetchWithAuth] Failed to get session:', err)
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return fetch(input, { ...init, headers })
}
