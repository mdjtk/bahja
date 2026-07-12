'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/components/Toast'

interface Coupon {
  id: number
  code: string
  discount_type: 'percentage' | 'flat'
  discount_value: number
  min_order: number
  max_uses: number
  current_uses: number
  active: boolean
  expires_at: string | null
  created_at: string
}

const emptyCoupon = () => ({
  code: '',
  discount_type: 'percentage' as const,
  discount_value: 10,
  min_order: 0,
  max_uses: 0,
  active: true,
  expires_at: '',
})

export default function AdminDiscounts() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null)

  const fetchCoupons = () => {
    setLoading(true)
    fetch('/api/coupons')
      .then((r) => r.json())
      .then((data) => { setCoupons(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchCoupons() }, [])

  const saveCoupon = async () => {
    if (!editing) return
    const isNew = !editing.id
    const url = isNew ? '/api/coupons' : `/api/coupons/${editing.id}`
    const method = isNew ? 'POST' : 'PUT'
    const body: any = { ...editing }
    if (body.expires_at && !body.expires_at.includes('T')) {
      body.expires_at = new Date(body.expires_at).toISOString()
    }

    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      toast(isNew ? 'Coupon created' : 'Coupon updated')
      setEditing(null)
      fetchCoupons()
    } catch (err: any) {
      toast(err.message || 'Failed to save coupon')
    }
  }

  const deactivateCoupon = async (id: number) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: false }) })
      if (!res.ok) throw new Error()
      toast('Coupon deactivated')
      fetchCoupons()
    } catch { toast('Failed to update') }
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>Loading coupons…</div>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button onClick={() => setEditing(emptyCoupon())} className="admin-toolbar-btn" style={{ background: '#1C1A16', color: '#f9eec0', border: 'none' }}>+ New Coupon</button>
      </div>

      {coupons.length === 0 ? (
        <div className="admin-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 12H4"/><path d="M12 4v16"/><circle cx="12" cy="12" r="10"/></svg>
          <p>No coupons yet</p>
          <div className="admin-empty-hint">Create discount coupons for your customers</div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Uses</th>
                <th>Expires</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} style={{ opacity: c.active ? 1 : 0.45 }}>
                  <td style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: 13 }}>{c.code}</td>
                  <td>{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                  <td>{c.min_order > 0 ? `₹${c.min_order}` : 'None'}</td>
                  <td>{c.current_uses}{c.max_uses > 0 ? ` / ${c.max_uses}` : ''}</td>
                  <td className="admin-table-date">{c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Never'}</td>
                  <td>
                    <span className="admin-badge" style={{ background: c.active ? '#22c55e15' : '#fce4ec', color: c.active ? '#22c55e' : '#c62828' }}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {c.active && (
                      <button onClick={() => deactivateCoupon(c.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: '#ef4444', padding: '4px 8px' }}>
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="admin-modal-overlay" onClick={() => setEditing(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing.id ? 'Edit Coupon' : 'New Coupon'}</h3>

            <div className="form-group">
              <label>Coupon Code</label>
              <input type="text" value={editing.code || ''} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="e.g. SUMMER20" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select value={editing.discount_type || 'percentage'} onChange={(e) => setEditing({ ...editing, discount_type: e.target.value as any })}>
                  <option value="percentage">Percentage</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Value</label>
                <input type="number" value={editing.discount_value || 0} onChange={(e) => setEditing({ ...editing, discount_value: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Min Order (₹)</label>
                <input type="number" value={editing.min_order ?? 0} onChange={(e) => setEditing({ ...editing, min_order: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="form-group">
                <label>Max Uses (0 = unlimited)</label>
                <input type="number" value={editing.max_uses ?? 0} onChange={(e) => setEditing({ ...editing, max_uses: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            <div className="form-group">
              <label>Expires At</label>
              <input type="date" value={editing.expires_at ? editing.expires_at.slice(0, 10) : ''} onChange={(e) => setEditing({ ...editing, expires_at: e.target.value })} />
            </div>

            <div className="admin-modal-actions">
              <button onClick={saveCoupon} className="btn-primary">{editing.id ? 'Save Changes' : 'Create Coupon'}</button>
              <button onClick={() => setEditing(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
