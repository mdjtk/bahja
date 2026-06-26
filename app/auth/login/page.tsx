'use client'

import { useState, FormEvent, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { loadCart } from '@/lib/store'
import { toast } from '@/components/Toast'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/account'
  const supabase = createClient()

  const [tab, setTab] = useState<'phone' | 'google'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((v) => v - 1), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  const syncCart = async () => {
    try {
      const cart = loadCart()
      if (cart.length > 0) {
        await fetch('/api/cart/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart }),
        })
      }
    } catch {}
  }

  const sendOtp = async (e: FormEvent) => {
    e.preventDefault()
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 10) {
      toast('Enter a valid 10-digit phone number')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      phone: '+91' + cleaned,
    })
    setLoading(false)
    if (error) {
      toast(error.message)
      return
    }
    setSent(true)
    setResendCooldown(30)
    toast('OTP sent to ' + phone)
  }

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault()
    const cleaned = phone.replace(/\D/g, '')
    if (!otp || otp.length < 4) {
      toast('Enter the OTP code')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      phone: '+91' + cleaned,
      token: otp,
      type: 'sms',
    })
    setLoading(false)
    if (error) {
      toast(error.message)
      return
    }
    await syncCart()
    toast('Logged in!')
    router.push(redirect)
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: location.origin + '/auth/callback?redirect=' + encodeURIComponent(redirect) },
    })
    if (error) {
      toast(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 16px rgba(58,36,26,0.06)' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: '#3A241A', marginBottom: 4, textAlign: 'center' }}>Welcome to Bahja</h2>
          <p style={{ fontSize: 13, color: 'rgba(58,36,26,0.45)', marginBottom: 24, textAlign: 'center' }}>Sign in to continue your order</p>

          <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid rgba(58,36,26,0.08)' }}>
            <button onClick={() => setTab('phone')} style={{ flex: 1, padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: tab === 'phone' ? '#eab704' : 'rgba(58,36,26,0.4)', borderBottom: tab === 'phone' ? '2px solid #eab704' : '2px solid transparent', marginBottom: -2 }}>Phone OTP</button>
            <button onClick={() => setTab('google')} style={{ flex: 1, padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: tab === 'google' ? '#eab704' : 'rgba(58,36,26,0.4)', borderBottom: tab === 'google' ? '2px solid #eab704' : '2px solid transparent', marginBottom: -2 }}>Google</button>
          </div>

          {tab === 'phone' && !sent && (
            <form onSubmit={sendOtp}>
              <div className="form-group">
                <label>Phone Number</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(58,36,26,0.12)', borderRadius: 8, overflow: 'hidden' }}>
                  <span style={{ padding: '10px 12px', background: '#f5f0e8', fontSize: 14, color: '#3A241A', fontWeight: 500, borderRight: '1px solid rgba(58,36,26,0.08)' }}>+91</span>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="9876543210" style={{ flex: 1, border: 'none', padding: '10px 12px', fontSize: 16, outline: 'none' }} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 12 }}>
                {loading ? 'Sending…' : 'Send OTP →'}
              </button>
            </form>
          )}

          {tab === 'phone' && sent && (
            <form onSubmit={verifyOtp}>
              <div className="form-group">
                <label>Enter OTP sent to {phone}</label>
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" style={{ fontSize: 24, letterSpacing: 8, textAlign: 'center' }} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 12 }}>
                {loading ? 'Verifying…' : 'Verify & Login →'}
              </button>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12 }}>
                <button type="button" onClick={() => { setSent(false); setOtp('') }} style={{ border: 'none', background: 'none', color: '#8B7355', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>Change number</button>
                <button type="button" onClick={sendOtp} disabled={resendCooldown > 0} style={{ border: 'none', background: 'none', color: '#eab704', cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: resendCooldown > 0 ? 0.5 : 1 }}>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {tab === 'google' && (
            <button onClick={signInWithGoogle} disabled={loading} style={{ width: '100%', padding: '12px 0', border: '1px solid rgba(58,36,26,0.12)', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {loading ? 'Redirecting…' : 'Sign in with Google'}
            </button>
          )}

          <p style={{ fontSize: 11, color: 'rgba(58,36,26,0.3)', textAlign: 'center', marginTop: 20 }}>
            By signing in, you agree to our Terms & Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Sign In</h1>
          <p>Login with your phone number or Google</p>
        </div>
      </div>
      <Suspense fallback={<div className="section"><div className="container" style={{ maxWidth: 420, margin: '0 auto', textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>Loading…</div></div>}>
        <LoginForm />
      </Suspense>
    </>
  )
}
