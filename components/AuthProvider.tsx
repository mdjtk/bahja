'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

interface AuthContextType {
  user: User | null
  loading: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseBrowser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const supaUser = session?.user ?? null
      if (supaUser) {
        console.log('[AuthProvider] User state changed:', supaUser.id, supaUser.email)
      } else {
        console.log('[AuthProvider] No user (signed out)')
      }
      setUser(supaUser)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const refresh = useCallback(async () => {
    const supabase = getSupabaseBrowser()
    const { data: { user: refreshedUser } } = await supabase.auth.getUser()
    setUser(refreshedUser)
  }, [])

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowser()
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
