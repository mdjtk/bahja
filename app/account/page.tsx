'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchWithAuth } from '@/lib/fetch-with-auth'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { useAuth } from '@/components/AuthProvider'
import { savePhoneLocal, getPhoneLocal } from '@/lib/store'
import { toast } from '@/components/Toast'

interface Order {
  order_id: string
  total: number
  status: string
  created_at: string
  payment_method: string
  razorpay_payment_id?: string
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  if (digits.length === 12 && digits.startsWith('91')) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`
  return raw
}

function stripCountry(raw: string): string {
  return raw.replace(/\D/g, '').replace(/^91/, '').slice(-10)
}



export default function AccountPage() {
  const router = useRouter()
  const { user, loading: authLoading, signOut, refresh } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const [editingName, setEditingName] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [apiPhone, setApiPhone] = useState('')
  const [synced, setSynced] = useState(false)

  const [addresses, setAddresses] = useState<{ id: string; line: string; city: string; state: string; pincode: string }[]>([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({ line: '', city: '', state: '', pincode: '' })

  const [whatsAppOptIn, setWhatsAppOptIn] = useState(true)
  const [emailOptIn, setEmailOptIn] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('bahja_addresses')
    if (stored) try { setAddresses(JSON.parse(stored)) } catch {}
    const wa = localStorage.getItem('bahja_whatsapp_opt')
    if (wa !== null) setWhatsAppOptIn(wa === 'true')
    const em = localStorage.getItem('bahja_email_opt')
    if (em !== null) setEmailOptIn(em === 'true')
  }, [])

  const saveAddresses = (list: typeof addresses) => {
    setAddresses(list)
    localStorage.setItem('bahja_addresses', JSON.stringify(list))
  }

  const syncAddressToServer = async (line: string, city: string, state: string, pincode: string) => {
    try {
      const supabase = getSupabaseBrowser()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return
      await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ address: line, city, state, pincode }),
      })
    } catch {}
  }

  const handleAddAddress = async () => {
    if (!addressForm.line || !addressForm.city || !addressForm.state || addressForm.pincode.length !== 6) return
    const newAddr = { id: Date.now().toString(), ...addressForm }
    saveAddresses([...addresses, newAddr])
    syncAddressToServer(addressForm.line, addressForm.city, addressForm.state, addressForm.pincode)
    setAddressForm({ line: '', city: '', state: '', pincode: '' })
    setShowAddressForm(false)
    toast('Address added')
  }

  const handleDeleteAddress = (id: string) => {
    saveAddresses(addresses.filter((a) => a.id !== id))
    toast('Address removed')
  }

  const meta = user?.user_metadata || {}
  const name = meta.full_name || meta.name || ''
  const email = user?.email || ''
  const displayPhone = user?.phone || apiPhone || getPhoneLocal()
  const initial = name ? name[0].toUpperCase() : email ? email[0].toUpperCase() : '?'

  const sectionHeading: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase',
    color: 'rgba(58,36,26,0.25)', marginBottom: 12,
  }
  const cardStyle: React.CSSProperties = {
    background: '#fff', borderRadius: 14, padding: 20, marginBottom: 24,
    boxShadow: '0 1px 4px rgba(58,36,26,0.04)',
  }
  const label: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: '#3A241A',
  }
  const muted: React.CSSProperties = {
    fontSize: 11, color: 'rgba(58,36,26,0.35)', marginTop: 2,
  }
  const linkBtn: React.CSSProperties = {
    padding: '6px 14px', borderRadius: 8, border: '1px solid rgba(58,36,26,0.08)',
    background: '#fff', color: '#C5700A', fontSize: 12, fontWeight: 600,
    textDecoration: 'none', cursor: 'pointer',
  }
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label style={{ position: 'relative', display: 'inline-block', width: 38, height: 20, cursor: 'pointer', flexShrink: 0 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{
        position: 'absolute', inset: 0, background: checked ? '#C5700A' : 'rgba(197,112,10,0.15)', borderRadius: 10, transition: '.2s',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: checked ? 20 : 2, width: 16, height: 16, borderRadius: '50%',
          background: '#fff', transition: '.2s',
        }} />
      </span>
    </label>
  )

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login?redirect=/account'); return }
    const meta2 = user?.user_metadata || {}
    setEditName(meta2.full_name || meta2.name || '')
    syncPhone()
    fetchWithAuth('/api/orders/my')
      .then((r) => r.json())
      .then((data) => { setOrders(Array.isArray(data) ? data.slice(0, 5) : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user, authLoading, router])

  const syncPhone = () => {
    if (synced) return
    setSynced(true)
    if (user?.phone) return
    const local = getPhoneLocal()
    if (local) { setApiPhone(local); return }
    getSupabaseBrowser().auth.getSession().then((result: { data: { session: any } }) => {
      const session = result.data?.session
      if (!session?.access_token) return
      fetch('/api/auth/phone', { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then((r) => r.json())
        .then((d) => { if (d.phone) { setApiPhone(d.phone); savePhoneLocal(d.phone) } })
        .catch(() => {})
    })
  }

  const handleSaveName = async () => {
    const trimmed = editName.trim()
    if (!trimmed) return
    setSaving('name')
    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.auth.updateUser({ data: { full_name: trimmed } })
      if (error) throw error
      toast('Name updated')
      setEditingName(false)
      setSaving(null)
      await refresh()
    } catch { toast('Failed to update name'); setSaving(null) }
  }

  const handleSavePhone = async () => {
    if (editPhone.length !== 10) return
    setSaving('phone')
    try {
      const supabase = getSupabaseBrowser()
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/auth/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ phone: editPhone }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      const full = `+91${editPhone}`
      savePhoneLocal(full)
      setApiPhone(full)
      setEditPhone('')
      setEditingPhone(false)
      toast('Phone number saved')
      setSaving(null)
      await refresh()
    } catch (err: any) { toast(err.message || 'Failed to save phone'); setSaving(null) }
  }

  const handleLogout = async () => {
    await signOut()
    toast('Logged out')
    router.push('/')
  }

  if (authLoading) {
    return (
      <div className="page-header">
        <div className="container">
          <h1>My Account</h1>
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 0' }}>
            <div className="skeleton-shimmer" style={{ height: 100, borderRadius: 16, marginBottom: 24 }} />
            <div className="skeleton-shimmer" style={{ height: 60, borderRadius: 12, marginBottom: 24 }} />
            <div className="skeleton-shimmer" style={{ height: 200, borderRadius: 14, marginBottom: 24 }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>My Account</h1>
        </div>
      </div>

      <div className="section" style={{ paddingTop: 10 }}>
        <div className="container" style={{ maxWidth: 680, margin: '0 auto' }}>

          {/* Profile Card */}
          <div style={{
            background: 'linear-gradient(135deg, #C5700A 0%, #E2A137 100%)',
            borderRadius: 16, padding: '28px 32px', marginBottom: 28,
            display: 'flex', alignItems: 'center', gap: 20,
            color: '#fff', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -40, right: -40, width: 160, height: 160,
              borderRadius: '50%', background: 'rgba(255,255,255,0.08)',
            }} />
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {initial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
                {editingName ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1 }}>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your name"
                      style={{
                        flex: 1, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 18, fontWeight: 600,
                        outline: 'none', fontFamily: 'inherit',
                      }}
                      autoFocus
                    />
                    <button onClick={handleSaveName} disabled={saving === 'name' || !editName.trim()}
                      style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#fff', color: '#C5700A', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving === 'name' || !editName.trim() ? 0.6 : 1, whiteSpace: 'nowrap' }}
                    >{saving === 'name' ? 'Saving…' : 'Save'}</button>
                    <button onClick={() => { setEditingName(false); setEditName(name) }}
                      style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'rgba(255,255,255,0.8)', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >Cancel</button>
                  </div>
                ) : (
                  <>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{name || 'Your Name'}</h2>
                    <button onClick={() => setEditingName(true)}
                      style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, padding: '3px 8px', color: 'rgba(255,255,255,0.8)', fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >Edit</button>
                  </>
                )}
              </div>
              {email && <div style={{ fontSize: 12, opacity: 0.65 }}>{email}</div>}
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {editingPhone ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', padding: '0 10px' }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 500, marginRight: 4 }}>+91</span>
                      <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
                      <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="9876543210"
                        style={{ border: 'none', background: 'transparent', padding: '7px 10px', fontSize: 13, outline: 'none', color: '#fff', fontFamily: 'inherit', width: 130 }}
                        autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleSavePhone() }}
                      />
                    </div>
                    <button onClick={handleSavePhone} disabled={saving === 'phone' || editPhone.length !== 10}
                      style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: editPhone.length === 10 ? '#fff' : 'rgba(255,255,255,0.2)', color: editPhone.length === 10 ? '#C5700A' : 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, cursor: editPhone.length === 10 ? 'pointer' : 'default' }}
                    >{saving === 'phone' ? 'Saving…' : 'Save'}</button>
                    <button onClick={() => { setEditingPhone(false); setEditPhone('') }}
                      style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 12, cursor: 'pointer' }}
                    >Cancel</button>
                  </>
                ) : (
                  <>
                    {displayPhone ? (
                      <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: 0.3, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {formatPhone(displayPhone)}
                        <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 7px', borderRadius: 7, background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>Verified</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, opacity: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        No phone number set
                      </span>
                    )}
                    <button onClick={() => { setEditingPhone(true); setEditPhone(stripCountry(displayPhone)) }}
                      style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 11, cursor: 'pointer' }}
                    >{displayPhone ? 'Change' : 'Add Phone'}</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={sectionHeading}>Quick Actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 28 }}>
            <Link href="/my-orders" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#f9f6ef', borderRadius: 12, textDecoration: 'none', fontSize: 13, fontWeight: 500, color: '#3A241A', transition: 'background .15s' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C5700A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 17.5h11l2-13h-15l2 13z"/><circle cx="9" cy="21" r="1"/><circle cx="15" cy="21" r="1"/></svg>My Orders
            </Link>
            <Link href="/shop" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#f9f6ef', borderRadius: 12, textDecoration: 'none', fontSize: 13, fontWeight: 500, color: '#3A241A', transition: 'background .15s' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C5700A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>Shop Now
            </Link>
            <Link href="/cart" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#f9f6ef', borderRadius: 12, textDecoration: 'none', fontSize: 13, fontWeight: 500, color: '#3A241A', transition: 'background .15s' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#C5700A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 17.5h11l2-13h-15l2 13z"/><circle cx="9" cy="21" r="1"/><circle cx="15" cy="21" r="1"/></svg>View Cart
            </Link>
            <a href="https://wa.me/918086872603" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#f9f6ef', borderRadius: 12, textDecoration: 'none', fontSize: 13, fontWeight: 500, color: '#3A241A', transition: 'background .15s' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Contact Support
            </a>
          </div>

          {/* Orders */}
          <div style={sectionHeading}>Recent Orders</div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#3A241A' }}>{loading ? '' : orders.length === 0 ? 'Nothing yet' : `${orders.length} order${orders.length > 1 ? 's' : ''}`}</div>
              {orders.length > 0 && (
                <Link href="/my-orders" style={{ fontSize: 11, color: '#C5700A', fontWeight: 600, textDecoration: 'none' }}>View all &rarr;</Link>
              )}
            </div>
            {loading ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'rgba(58,36,26,0.15)', fontSize: 12 }}>Loading orders…</div>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(58,36,26,0.08)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 10 }}>
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                <p style={{ fontSize: 12, color: 'rgba(58,36,26,0.2)', marginBottom: 10 }}>No orders yet</p>
                <Link href="/shop" style={{ color: '#C5700A', fontWeight: 600, fontSize: 12 }}>Start Shopping &rarr;</Link>
              </div>
            ) : (
              <div>
                {orders.map((order) => {
                  const canCancel = order.status !== 'Delivered' && order.status !== 'Cancelled'
                  return (
                  <div key={order.order_id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(58,36,26,0.04)' }}>
                    <Link href={`/my-orders?id=${order.order_id}`}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', transition: 'background .15s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#faf8f5')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div>
                        <div style={{ fontSize: 10, color: 'rgba(58,36,26,0.3)', marginBottom: 1 }}>
                          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 500, color: '#3A241A', fontFamily: 'monospace' }}>{order.order_id}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                          background: order.status === 'Delivered' ? '#e8f5e9' : order.status === 'Cancelled' ? '#fbe9e7' : '#fff8e1',
                          color: order.status === 'Delivered' ? '#2e7d32' : order.status === 'Cancelled' ? '#c62828' : '#f57f17',
                        }}>{order.status}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#3A241A' }}>₹{order.total}</span>
                      </div>
                    </Link>
                    {canCancel && (
                      <button onClick={async (e) => {
                        e.preventDefault()
                        if (!confirm('Cancel this order?')) return
                        try {
                          const supabase = getSupabaseBrowser()
                          const { data: { session } } = await supabase.auth.getSession()
                          const res = await fetch('/api/orders/cancel', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ order_id: order.order_id }),
                          })
                          if (!res.ok) { toast('Failed to cancel'); return }
                          setOrders((prev) => prev.map((o) => o.order_id === order.order_id ? { ...o, status: 'Cancelled' } : o))
                          toast('Order cancelled')
                        } catch { toast('Failed to cancel') }
                      }}
                        style={{ marginTop: 6, padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(198,40,40,0.1)', background: 'transparent', color: '#c62828', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit' }}
                      >Cancel Order</button>
                    )}
                  </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Addresses */}
          <div style={sectionHeading}>Saved Addresses</div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#3A241A' }}>{addresses.length} address{addresses.length !== 1 ? 'es' : ''}</div>
              <button onClick={() => setShowAddressForm(!showAddressForm)}
                style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: showAddressForm ? '#f5f0eb' : '#C5700A', color: showAddressForm ? '#666' : '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
              >{showAddressForm ? 'Cancel' : '+ Add Address'}</button>
            </div>

            {showAddressForm && (
              <div style={{ background: '#f9f6ef', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'grid', gap: 10 }}>
                  <input value={addressForm.line} onChange={(e) => setAddressForm({ ...addressForm, line: e.target.value })}
                    placeholder="Address line (house, street, area)"
                    style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(58,36,26,0.08)', fontSize: 12, outline: 'none', fontFamily: 'inherit', color: '#3A241A' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="City"
                      style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(58,36,26,0.08)', fontSize: 12, outline: 'none', fontFamily: 'inherit', color: '#3A241A' }}
                    />
                    <input value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      placeholder="State"
                      style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(58,36,26,0.08)', fontSize: 12, outline: 'none', fontFamily: 'inherit', color: '#3A241A' }}
                    />
                  </div>
                  <input value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    placeholder="Pincode"
                    style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(58,36,26,0.08)', fontSize: 12, outline: 'none', fontFamily: 'inherit', color: '#3A241A' }}
                  />
                  <button onClick={handleAddAddress}
                    disabled={!addressForm.line || !addressForm.city || !addressForm.state || addressForm.pincode.length !== 6}
                    style={{ padding: '9px', borderRadius: 8, border: 'none', background: addressForm.line && addressForm.city && addressForm.state && addressForm.pincode.length === 6 ? '#C5700A' : '#ddd', color: addressForm.line && addressForm.city && addressForm.state && addressForm.pincode.length === 6 ? '#fff' : '#999', fontSize: 12, fontWeight: 700, cursor: addressForm.line && addressForm.city && addressForm.state && addressForm.pincode.length === 6 ? 'pointer' : 'default' }}
                  >Save Address</button>
                </div>
              </div>
            )}

            {addresses.length === 0 && !showAddressForm ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(58,36,26,0.08)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                <p style={{ fontSize: 12, color: 'rgba(58,36,26,0.2)', margin: 0 }}>No saved addresses</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {addresses.map((addr) => (
                  <div key={addr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 14px', background: '#f9f6ef', borderRadius: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500, color: '#3A241A', marginBottom: 2 }}>{addr.line}</div>
                      <div style={{ fontSize: 11, color: 'rgba(58,36,26,0.4)' }}>{addr.city}, {addr.state} &mdash; {addr.pincode}</div>
                    </div>
                    <button onClick={() => handleDeleteAddress(addr.id)}
                      style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(198,40,40,0.1)', background: 'transparent', color: '#c62828', fontSize: 10, cursor: 'pointer', flexShrink: 0 }}
                    >Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div style={sectionHeading}>Settings</div>
          <div style={cardStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <div>
                  <div style={label}>Password</div>
                  <div style={muted}>Last changed: {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-IN') : 'N/A'}</div>
                </div>
                <Link href="/auth/reset-password" style={linkBtn}>Reset</Link>
              </div>
              <div style={{ height: 1, background: 'rgba(58,36,26,0.04)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <div>
                  <div style={label}>Email Notifications</div>
                  <div style={muted}>Order updates, promotions &amp; offers</div>
                </div>
                <Toggle checked={emailOptIn} onChange={setEmailOptIn} />
              </div>
              <div style={{ height: 1, background: 'rgba(58,36,26,0.04)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <div>
                  <div style={label}>WhatsApp Updates</div>
                  <div style={muted}>Receive order tracking on WhatsApp</div>
                </div>
                <Toggle checked={whatsAppOptIn} onChange={setWhatsAppOptIn} />
              </div>
              <div style={{ height: 1, background: 'rgba(58,36,26,0.04)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                <div>
                  <div style={label}>Account Created</div>
                  <div style={muted}>
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Unknown'}
                  </div>
                </div>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(58,36,26,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div style={{ marginTop: 28, marginBottom: 40 }}>
            <button onClick={handleLogout}
              style={{ width: '100%', padding: 13, border: '1px solid rgba(198,40,40,0.1)', borderRadius: 12, background: '#fff', color: '#c62828', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background .15s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#fff5f5')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign Out
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
