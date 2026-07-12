'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/Toast'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!password.trim()) { toast('Enter your password'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Invalid password' }))
        console.error('[AdminLogin] Verify failed:', res.status, errBody)
        toast(errBody.error || 'Invalid password')
        setLoading(false)
        return
      }
      console.log('[AdminLogin] Login successful, redirecting to /admin')
      router.push('/admin')
    } catch (err) {
      console.error('[AdminLogin] Network error:', err)
      toast('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg">
        <div className="admin-login-grid" />
      </div>
      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="admin-login-brand">
            <div className="admin-login-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 0-4 4c0 1.1.5 2 1.3 2.7L8 16h8l-1.3-7.3A3.9 3.9 0 0 0 16 6a4 4 0 0 0-4-4z"/>
                <path d="M6 18h12v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2z"/>
              </svg>
            </div>
            <h1>Bahja</h1>
            <p>Admin Portal</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="admin-login-field">
              <label htmlFor="admin-pwd">Password</label>
              <div className="admin-login-input-wrap">
                <input
                  id="admin-pwd"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                  placeholder="Enter admin password"
                />
                <button type="button" className="admin-login-toggle" onClick={() => setShowPwd(!showPwd)} tabIndex={-1}>
                  {showPwd ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="admin-login-submit" disabled={loading}>
              {loading ? (
                <span className="admin-login-spinner" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="admin-login-footer">
            <Link href="/">← Back to site</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
