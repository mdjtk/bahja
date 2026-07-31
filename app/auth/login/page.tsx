'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { useAuth } from '@/components/AuthProvider'
import { toast } from '@/components/Toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const redirect = searchParams.get('redirect') || '/account'
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirect)
    }
  }, [user, authLoading, router, redirect])

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      toast(err.message || 'Google sign-in failed')
      setLoading(false)
    }
  }

  const handleEmailSubmit = async () => {
    const emailVal = email.trim().toLowerCase()
    if (!emailVal || !password) {
      toast('Please enter email and password')
      return
    }
    setLoading(true)
    setInfo('')
    try {
      const supabase = getSupabaseBrowser()
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: emailVal, password })
        if (error) throw error
        router.push(redirect)
      } else {
        const { data, error } = await supabase.auth.signUp({ email: emailVal, password })
        if (error) throw error
        if (data.session) {
          router.push(`/auth/phone?next=${encodeURIComponent(redirect)}`)
        } else {
          setInfo('Account created! Check your email to confirm your account, then sign in.')
          setMode('signin')
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong'
      toast(msg === 'Invalid login credentials' ? 'Wrong email or password' : msg)
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-hex-bg" />
      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <div className="login-logo-wrap">
              <img src="/assets/images/logo.png" alt="Bahja" className="login-logo" />
            </div>
            <h1>{mode === 'signin' ? 'Welcome back' : 'Create account'}</h1>
            <p>{mode === 'signin' ? 'Sign in to your Bahja account' : 'Join Bahja for a faster checkout'}</p>
          </div>

          <form
            className="login-form"
            onSubmit={(e) => { e.preventDefault(); handleEmailSubmit() }}
          >
            {info && <div className="login-note">{info}</div>}

            <div className="login-field">
              <label>Email</label>
              <div className="login-input-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <label>Password</label>
              <div className="login-input-wrap">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="login-input-toggle"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="login-email-btn">
              {loading ? (
                <span className="login-google-loading">
                  <span className="login-spinner" />
                  {mode === 'signin' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                mode === 'signin' ? 'Sign in' : 'Create account'
              )}
            </button>

            <div className="login-switch">
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setInfo('') }}>
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="login-divider">
            <span>or continue with</span>
          </div>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="login-google-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="login-divider">
            <span>Secure & fast checkout</span>
          </div>

          <div className="login-features">
            <div className="login-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Your data is protected</span>
            </div>
            <div className="login-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Save your addresses</span>
            </div>
            <div className="login-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Track your orders</span>
            </div>
          </div>

          <p className="login-terms">
            By continuing, you agree to our{' '}
            <Link href="/terms">Terms of Service</Link> and{' '}
            <Link href="/privacy">Privacy Policy</Link>
          </p>
        </div>

        <Link href="/" className="login-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to shopping
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="login-page">
        <div className="login-hex-bg" />
        <div className="login-container">
          <div className="login-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div className="login-spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 14, color: 'rgba(58,36,26,0.4)' }}>Loading…</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
