'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { toast } from '@/components/Toast'
import { createClient } from '@/lib/supabase/client'

interface Order {
  order_id: string
  total: number
  status: string
  created_at: string
}

export default function AccountPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut, refresh } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)

  const name = user?.user_metadata?.full_name || ''
  const phone = user?.phone || ''
  const email = user?.email || user?.user_metadata?.email || ''
  const avatarLetter = name ? name[0].toUpperCase() : phone ? phone[phone.length - 1] : '?'

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login?redirect=/account')
      return
    }
    setEditName(user.user_metadata?.full_name || '')
    fetch('/api/orders/my')
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data.slice(0, 3) : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user, authLoading, router])

  const saveName = async () => {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: { full_name: editName.trim() },
    })
    setSaving(false)
    if (error) {
      toast(error.message)
      return
    }
    toast('Name updated!')
    setEditing(false)
    await refresh()
  }

  const handleLogout = async () => {
    await signOut()
    toast('Logged out')
    router.push('/')
  }

  if (authLoading) {
    return <div style={{ padding: 60, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>Loading…</div>
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>My Account</h1>
          <p>Welcome{name ? `, ${name.split(' ')[0]}` : ''}!</p>
        </div>
      </div>
      <div className="section" style={{ paddingTop: 10 }}>
        <div className="container" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(58,36,26,0.06)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f5f0e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#3A241A', fontWeight: 600 }}>
                {avatarLetter}
              </div>
              <div style={{ flex: 1 }}>
                {editing ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your name"
                      autoFocus
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid rgba(58,36,26,0.15)', borderRadius: 8, fontSize: 15, outline: 'none' }}
                    />
                    <button onClick={saveName} disabled={saving || !editName.trim()} style={{ padding: '8px 16px', border: 'none', borderRadius: 8, background: '#eab704', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: saving || !editName.trim() ? 0.6 : 1 }}>
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => { setEditing(false); setEditName(name) }} style={{ padding: '8px 12px', border: '1px solid rgba(58,36,26,0.1)', borderRadius: 8, background: '#fff', color: '#666', fontSize: 13, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: '#3A241A' }}>{name || 'Set your name'}</span>
                      <button onClick={() => setEditing(true)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#eab704', fontWeight: 600, padding: 0 }}>Edit</button>
                    </div>
                    <div style={{ fontSize: 14, color: 'rgba(58,36,26,0.5)' }}>{phone}</div>
                    {email && <div style={{ fontSize: 13, color: 'rgba(58,36,26,0.4)' }}>{email}</div>}
                  </>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(58,36,26,0.3)', fontSize: 13 }}>Loading orders…</div>
          ) : orders.length > 0 ? (
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(58,36,26,0.06)', overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(58,36,26,0.06)', fontSize: 14, fontWeight: 600, color: '#3A241A' }}>
                Recent Orders
              </div>
              {orders.map((order) => (
                <div key={order.order_id} style={{ padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(58,36,26,0.04)' }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'rgba(58,36,26,0.5)' }}>{new Date(order.created_at).toLocaleDateString()}</div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: '#3A241A' }}>{order.order_id}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: order.status === 'Delivered' ? '#e8f5e9' : '#fff8e1', color: order.status === 'Delivered' ? '#2e7d32' : '#f57f17' }}>{order.status}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#3A241A' }}>₹{order.total}</span>
                  </div>
                </div>
              ))}
              <a href="/my-orders" style={{ display: 'block', padding: '12px 24px', textAlign: 'center', fontSize: 13, color: '#eab704', fontWeight: 600, textDecoration: 'none' }}>
                View all orders →
              </a>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 16px rgba(58,36,26,0.06)', padding: 32, textAlign: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: 'rgba(58,36,26,0.4)', marginBottom: 12 }}>No orders yet</p>
              <a href="/shop" style={{ color: '#eab704', fontWeight: 600, fontSize: 14 }}>Shop now →</a>
            </div>
          )}

          <button onClick={handleLogout} style={{ width: '100%', padding: 14, border: '1px solid rgba(198,40,40,0.15)', borderRadius: 12, background: '#fff', color: '#c62828', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </div>
    </>
  )
}
