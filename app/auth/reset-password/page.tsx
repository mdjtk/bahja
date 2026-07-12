'use client'

import { useState, FormEvent } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { toast } from '@/components/Toast'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setSent(true)
    } catch (err: any) {
      toast(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Reset Password</h1>
          <p>Enter your email to receive a reset link</p>
        </div>
      </div>
      <div className="section">
        <div className="container" style={{ maxWidth: 420, margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 16px rgba(58,36,26,0.06)' }}>
            {sent ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 14, color: 'rgba(58,36,26,0.6)' }}>Check your email for a password reset link.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 12 }}>
                  {loading ? 'Sending…' : 'Send Reset Link →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
