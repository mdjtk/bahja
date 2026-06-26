'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/components/Toast'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/auth/login')
    })
  }, [supabase, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      toast('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      toast(error.message)
      return
    }
    toast('Password updated!')
    router.push('/my-orders')
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Set New Password</h1>
        </div>
      </div>
      <div className="section">
        <div className="container" style={{ maxWidth: 420, margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 2px 16px rgba(58,36,26,0.06)' }}>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 12 }}>
                {loading ? 'Updating…' : 'Update Password →'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
