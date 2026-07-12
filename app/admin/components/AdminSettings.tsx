'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/components/Toast'

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => { setSettings(data || {}); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error()
      toast('Settings saved')
    } catch { toast('Failed to save settings') }
    setSaving(false)
  }

  if (loading) return <div className="admin-empty"><p>Loading settings…</p></div>

  const fields = [
    { key: 'store_name', label: 'Store Name', type: 'text' },
    { key: 'store_phone', label: 'Phone Number', type: 'text' },
    { key: 'store_email', label: 'Email', type: 'email' },
    { key: 'store_address', label: 'Address', type: 'text' },
    { key: 'shipping_charge', label: 'Shipping Charge (₹)', type: 'number' },
    { key: 'free_shipping_threshold', label: 'Free Shipping Above (₹)', type: 'number' },
    { key: 'tax_rate', label: 'Tax Rate (%)', type: 'number' },
  ]

  return (
    <div style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1C1A16', margin: 0 }}>Store Settings</h3>
        <p style={{ fontSize: 13, color: 'rgba(28,26,22,.4)', marginTop: 6, marginBottom: 0 }}>Configure your store information and business rules</p>
      </div>
      <div style={{ background: '#fff', borderRadius: 14, padding: 24 }}>
        {fields.map((f) => (
          <div className="form-group" key={f.key} style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(28,26,22,.5)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.3px' }}>{f.label}</label>
            <input
              type={f.type}
              value={settings[f.key] || ''}
              onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid rgba(28,26,22,.08)', borderRadius: 10, fontSize: 14, fontFamily: 'var(--font-inter)', background: '#fff', outline: 'none', transition: 'all .2s', color: '#1C1A16', boxSizing: 'border-box' }}
              onFocus={(e) => { e.target.style.borderColor = '#eab704'; e.target.style.boxShadow = '0 0 0 3px rgba(234,183,4,.1)' }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(28,26,22,.08)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        ))}
        <button
          onClick={saveSettings}
          disabled={saving}
          style={{ padding: '12px 28px', border: 'none', borderRadius: 10, background: '#1C1A16', color: '#f9eec0', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-inter)', cursor: 'pointer', transition: 'all .2s', marginTop: 4 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#eab704'; e.currentTarget.style.color = '#1C1A16' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#1C1A16'; e.currentTarget.style.color = '#f9eec0' }}
        >
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
