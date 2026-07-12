'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { onAuthStateChanged, signOut as firebaseSignOut, reload, User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        console.log('[AuthProvider] User signed in:', firebaseUser.uid, firebaseUser.email)
      } else {
        console.log('[AuthProvider] No user (signed out)')
      }
      setUser(firebaseUser)
      setLoading(false)
    }, (error) => {
      console.error('[AuthProvider] onAuthStateChanged error:', error)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const refresh = useCallback(async () => {
    if (auth.currentUser) {
      await reload(auth.currentUser)
      setUser(auth.currentUser)
    }
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
