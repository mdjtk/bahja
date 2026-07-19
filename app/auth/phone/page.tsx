'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { toast } from '@/components/Toast'

function PhoneForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/account'
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (phone.length !== 10) return
    setLoading(true)
    try {
      const supabase = getSupabaseBrowser()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/auth/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ phone }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to save') }
      setDone(true)
      toast('Phone number saved')
      setTimeout(() => router.push(next), 600)
    } catch (err: any) {
      toast(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="login-page">
        <div className="login-hex-bg" />
        <div className="login-container">
          <div className="login-card" style={{ textAlign: 'center' }}>
            <div className="login-brand">
              <img src="/assets/images/logo.png" alt="Bahja" className="login-logo" />
              <h1>All set!</h1>
              <p>Redirecting you…</p>
            </div>
          </div>
        </div>
      </div>
    )
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
            <h1>One last step</h1>
            <p>Enter your phone number to complete sign-up</p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f5f0eb', borderRadius: 10, border: '1px solid rgba(58,36,26,0.08)', padding: '0 14px' }}>
              <span style={{ fontSize: 13, color: 'rgba(58,36,26,0.4)', fontWeight: 500, marginRight: 6 }}>+91</span>
              <span style={{ color: 'rgba(58,36,26,0.1)' }}>|</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                style={{
                  flex: 1, border: 'none', background: 'transparent', padding: '12px 10px',
                  fontSize: 16, outline: 'none', color: '#3A241A', fontFamily: 'inherit',
                }}
              />
            </div>
            <p style={{ fontSize: 11, color: 'rgba(58,36,26,0.3)', marginTop: 6, paddingLeft: 4 }}>
              We'll send order updates via WhatsApp
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={phone.length !== 10 || loading}
            className="login-google-btn"
            style={{
              background: phone.length === 10 ? '#C5700A' : 'rgba(58,36,26,0.06)',
              color: phone.length === 10 ? '#fff' : 'rgba(58,36,26,0.15)',
              border: 'none', width: '100%', padding: 14, borderRadius: 12,
              fontSize: 15, fontWeight: 700, cursor: phone.length === 10 ? 'pointer' : 'default',
              transition: 'all .15s',
            }}
          >
            {loading ? 'Saving…' : 'Continue'}
          </button>

          <div className="login-divider" style={{ marginTop: 20 }}>
            <span>Your number is safe with us</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PhonePage() {
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
      <PhoneForm />
    </Suspense>
  )
}
