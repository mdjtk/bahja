'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { fetchWithAuth } from '@/lib/fetch-with-auth'
import { loadCart, savePhoneLocal } from '@/lib/store'
import { useAuth } from '@/components/AuthProvider'
import { toast } from '@/components/Toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refresh } = useAuth()
  const redirect = searchParams.get('redirect') || '/account'
  const [loading, setLoading] = useState(false)
  const [showPhonePrompt, setShowPhonePrompt] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [savingPhone, setSavingPhone] = useState(false)

  const syncCart = async () => {
    try {
      const cart = loadCart()
      if (cart.length > 0) {
        await fetchWithAuth('/api/cart/sync', {
          method: 'POST',
          body: JSON.stringify({ items: cart }),
        })
      }
    } catch {}
  }

  const claimOrders = async () => {
    try {
      const res = await fetchWithAuth('/api/orders/claim', { method: 'POST' })
      const data = await res.json()
      if (data.claimed > 0) {
        toast(`${data.claimed} order${data.claimed > 1 ? 's' : ''} linked to your account`)
      }
    } catch {}
  }

  const savePhone = async () => {
    if (!phoneInput || !/^\d{10}$/.test(phoneInput)) return
    setSavingPhone(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch('/api/auth/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: phoneInput }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      savePhoneLocal(phoneInput)
      await refresh()
      toast('Phone number saved!')
    } catch (err: any) {
      toast(err.message || 'Failed to save phone')
    }
    setSavingPhone(false)
    setShowPhonePrompt(false)
    finishSignIn()
  }

  const skipPhone = () => {
    setShowPhonePrompt(false)
    finishSignIn()
  }

  const finishSignIn = async () => {
    try {
      await syncCart()
      await claimOrders()
    } catch {}
    toast('Logged in!')
    router.push(redirect)
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      console.log('[Login] Google sign-in success:', result.user.uid, result.user.email)
      if (!result.user.phoneNumber) {
        setShowPhonePrompt(true)
        setLoading(false)
        return
      }
      await finishSignIn()
    } catch (err: any) {
      console.error('[Login] Google sign-in error:', err.code, err.message)
      if (err.code !== 'auth/popup-closed-by-user') {
        toast(err.message || 'Google sign-in failed')
      }
    } finally {
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
            <h1>Welcome back</h1>
            <p>Sign in to your Bahja account</p>
          </div>

          {showPhonePrompt ? (
            <div className="phone-section">
              <div className="phone-label">Add your phone number</div>
              <div className="phone-hint">Required for order updates and tracking</div>
              <div className="phone-input-row">
                <span className="phone-prefix">+91</span>
                <input
                  type="tel"
                  className="phone-input"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter' && phoneInput.length === 10) savePhone() }}
                />
              </div>
              <button
                onClick={savePhone}
                disabled={phoneInput.length !== 10 || savingPhone}
                className={`phone-btn-save ${phoneInput.length === 10 ? 'active' : 'inactive'}`}
                style={{ marginBottom: 8 }}
              >
                {savingPhone ? 'Saving…' : 'Save & Continue'}
              </button>
              <button onClick={skipPhone} className="phone-btn-skip">
                Skip for now
              </button>
            </div>
          ) : (
            <>
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
                {loading ? (
                  <span className="login-google-loading">
                    <span className="login-spinner" />
                    Signing in…
                  </span>
                ) : (
                  'Continue with Google'
                )}
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
                <a href="/terms">Terms of Service</a> and{' '}
                <a href="/privacy">Privacy Policy</a>
              </p>
            </>
          )}
        </div>

        <a href="/" className="login-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to shopping
        </a>
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
