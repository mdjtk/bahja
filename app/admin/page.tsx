'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/Toast'
import AdminProducts from '@/components/AdminProducts'
import AdminOverview from './components/AdminOverview'
import AdminDiscounts from './components/AdminDiscounts'
import AdminSettings from './components/AdminSettings'
import AdminCustomers from './components/AdminCustomers'
import AdminRevenue from './components/AdminRevenue'

interface Order {
  order_id: string
  customer_name: string
  phone: string
  email: string | null
  address: string
  city: string | null
  pincode: string | null
  payment_method: string
  total: number
  razorpay_payment_id: string | null
  status: string
  items: any[]
  user_id: string | null
  created_at: string
  tracking_number?: string
  admin_notes?: string
}

interface AdminUser {
  uid: string
  email: string | null
  displayName: string | null
  phoneNumber: string | null
  photoURL: string | null
  createdAt: string
  lastSignInAt: string | null
  provider: string[]
  disabled: boolean
}

interface Subscriber {
  id: number
  email: string
  created_at: string
}

interface Contact {
  id: number
  name: string
  email: string
  subject: string | null
  message: string
  created_at: string
}

const STATUSES = ['Confirmed', 'Preparing', 'Dispatched', 'Out for Delivery', 'Delivered', 'Cancelled']
const STATUS_COLORS: Record<string, string> = {
  'Confirmed': '#f59e0b', 'Preparing': '#3b82f6', 'Dispatched': '#8b5cf6',
  'Out for Delivery': '#06b6d4', 'Delivered': '#22c55e', 'Cancelled': '#ef4444',
}

function formatDate(d: string) {
  const date = new Date(d)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

function StatusBadge({ status }: { status: string }) {
  const icons: Record<string, string> = {
    'Confirmed': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'Preparing': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    'Dispatched': 'M13 10V3L4 14h7v7l9-11h-7z',
    'Out for Delivery': 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z',
    'Delivered': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'Cancelled': 'M18 6L6 18M6 6l12 12',
  }
  return (
    <span className="admin-badge" style={{ background: `${STATUS_COLORS[status] || '#6b7280'}15`, color: STATUS_COLORS[status] || '#6b7280' }}>
      {icons[status] && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={icons[status]}/></svg>}
      {status}
    </span>
  )
}

function PaymentBadge({ method }: { method: string }) {
  const isPaid = method === 'razorpay'
  return (
    <span className="admin-badge" style={{ background: isPaid ? '#22c55e15' : '#f59e0b15', color: isPaid ? '#22c55e' : '#f59e0b' }}>
      {isPaid ? 'Paid' : 'COD'}
    </span>
  )
}

interface SidebarGroup {
  label: string
  tabs: { key: string; label: string; icon: string }[]
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    label: 'Dashboard',
    tabs: [{ key: 'overview', label: 'Overview', icon: 'grid' }],
  },
  {
    label: 'Sales',
    tabs: [
      { key: 'orders', label: 'Orders', icon: 'box' },
      { key: 'revenue', label: 'Revenue', icon: 'dollar' },
    ],
  },
  {
    label: 'Products',
    tabs: [{ key: 'products', label: 'Products', icon: 'tag' }],
  },
  {
    label: 'Marketing',
    tabs: [
      { key: 'discounts', label: 'Discounts', icon: 'percent' },
      { key: 'subscribers', label: 'Subscribers', icon: 'mail' },
    ],
  },
  {
    label: 'People',
    tabs: [
      { key: 'customers', label: 'Customers', icon: 'users' },
      { key: 'contacts', label: 'Messages', icon: 'message' },
    ],
  },
  {
    label: 'System',
    tabs: [
      { key: 'users', label: 'Users', icon: 'user' },
      { key: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
]

function SidebarIcon({ name }: { name: string }) {
  const icons: Record<string, React.JSX.Element> = {
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    box: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
    dollar: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    tag: <><path d="M12 2a4 4 0 0 0-4 4c0 1.1.5 2 1.3 2.7L8 16h8l-1.3-7.3A3.9 3.9 0 0 0 16 6a4 4 0 0 0-4-4z"/><path d="M6 18h12v2a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2z"/></>,
    percent: <><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    message: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  }
  const d = icons[name]
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d}
    </svg>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [tab, setTab] = useState<string>('overview')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandAll, setExpandAll] = useState(false)
  const [seenOrders, setSeenOrders] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bahja_seen_orders')
      if (saved) setSeenOrders(new Set(JSON.parse(saved)))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('bahja_seen_orders', JSON.stringify([...seenOrders]))
    } catch {}
  }, [seenOrders])

  const loadData = async () => {
    setRefreshing(true)
    try {
      const [o, u, s, c] = await Promise.all([
        fetch('/api/orders').then((r) => r.json()),
        fetch('/api/admin/users').then((r) => r.json()),
        fetch('/api/subscribers').then((r) => r.json()),
        fetch('/api/contacts').then((r) => r.json()),
      ])
      setOrders(Array.isArray(o) ? o : [])
      setUsers(Array.isArray(u) ? u : [])
      setSubscribers(Array.isArray(s) ? s : [])
      setContacts(Array.isArray(c) ? c : [])
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
    } catch {}
    setRefreshing(false)
  }

  useEffect(() => {
    fetch('/api/admin/check', { method: 'POST' }).then(async (res) => {
      if (res.ok) {
        setAuthed(true)
        await loadData()
      } else {
        setAuthed(false)
      }
      setLoading(false)
    }).catch(() => {
      setAuthed(false)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (authed === false) router.push('/admin/login')
  }, [authed, router])

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/orders/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: newStatus }),
      })
      if (!res.ok) throw new Error()
      setOrders((prev) => prev.map((o) => o.order_id === orderId ? { ...o, status: newStatus } : o))
      toast(`Status → "${newStatus}"`)
    } catch { toast('Failed to update status') }
  }

  const exportCSV = () => {
    const headers = ['Email', 'Date']
    const rows = subscribers.map((s) => `${s.email},${new Date(s.created_at).toISOString()}`)
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bahja-subscribers-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('Subscribers exported')
  }

  const logout = async () => {
    await fetch('/api/admin/check', { method: 'POST' })
    document.cookie = 'bahja_admin=; path=/; max-age=0'
    router.push('/admin/login')
  }

  const markSeen = (orderId: string) => {
    setSeenOrders((prev) => {
      if (prev.has(orderId)) return prev
      const next = new Set(prev)
      next.add(orderId)
      return next
    })
  }

  const toggleExpand = (orderId: string) => {
    if (expandAll) {
      setExpandAll(false)
      setExpandedId(orderId)
    } else {
      setExpandedId(expandedId === orderId ? null : orderId)
    }
    markSeen(orderId)
  }

  const toggleExpandAll = () => {
    if (expandAll) {
      setExpandAll(false)
      setExpandedId(null)
    } else {
      setExpandAll(true)
      setExpandedId(null)
      filteredOrders.forEach((o) => markSeen(o.order_id))
    }
  }

  const unseenCount = orders.filter((o) => !seenOrders.has(o.order_id)).length

  const matchDateFilter = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    switch (dateFilter) {
      case 'today': return dDate.getTime() === today.getTime()
      case 'week': {
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return dDate >= weekAgo
      }
      case 'month': return dDate.getMonth() === today.getMonth() && dDate.getFullYear() === today.getFullYear()
      default: return true
    }
  }

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase()
    const matchesSearch = !q || o.order_id.toLowerCase().includes(q) || o.customer_name.toLowerCase().includes(q) || o.phone.includes(q)
    const matchesStatus = !statusFilter || o.status === statusFilter
    const matchesDate = matchDateFilter(o.created_at)
    return matchesSearch && matchesStatus && matchesDate
  })

  if (authed === false || !authed) return null
  if (loading) return (
    <div className="admin-loading">
      <div className="admin-loading-spinner" />
      <span className="admin-loading-text">Loading dashboard…</span>
    </div>
  )

  const renderOrdersTab = () => (
    <>
      <div className="admin-toolbar">
        <div className="admin-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search by order ID, name, or phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="admin-toolbar-group">
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="admin-filter">
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-filter">
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="admin-toolbar-btn" onClick={toggleExpandAll}>
            {expandAll
              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>}
            {expandAll ? 'Collapse' : 'Expand'}
          </button>
          {unseenCount > 0 && !expandAll && (
            <button className="admin-toolbar-btn unseen" onClick={() => { setExpandAll(true); setExpandedId(null); filteredOrders.forEach((o) => markSeen(o.order_id)) }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {unseenCount} new
            </button>
          )}
        </div>
      </div>
      {filteredOrders.length === 0 ? (
        <div className="admin-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <p>{search || statusFilter || dateFilter !== 'all' ? 'No orders match your filters' : 'No orders yet'}</p>
        </div>
      ) : (
        <div className="admin-order-list">
          {filteredOrders.map((order) => {
            const isUnseen = !seenOrders.has(order.order_id)
            const isExpanded = expandAll || expandedId === order.order_id
            return (
            <div key={order.order_id} className={`admin-order-card ${isExpanded ? 'expanded' : ''} ${isUnseen ? 'unseen' : ''}`}>
              <div className="admin-order-header" onClick={() => toggleExpand(order.order_id)}>
                <div className="admin-order-info">
                  <div className="admin-order-id">{isUnseen && <span className="admin-unseen-dot" />}{order.order_id}</div>
                  <div className="admin-order-customer">{order.customer_name}<span className="admin-order-date">{formatDate(order.created_at)}</span></div>
                </div>
                <div className="admin-order-meta">
                  <PaymentBadge method={order.payment_method} />
                  <StatusBadge status={order.status} />
                  <span className="admin-order-total">₹{order.total}</span>
                  <svg className="admin-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
              </div>
              {isExpanded && (
                <div className="admin-order-detail">
                  <div className="admin-order-detail-grid">
                    <div><strong>Order ID</strong><span>{order.order_id}</span></div>
                    <div><strong>Name</strong><span>{order.customer_name}</span></div>
                    <div><strong>Phone</strong><span>{order.phone}</span></div>
                    <div className="admin-order-actions">
                      <a href={`https://wa.me/${order.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="admin-contact-btn wa">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> WhatsApp
                      </a>
                      <a href={`tel:${order.phone}`} className="admin-contact-btn call">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> Call
                      </a>
                      {order.email && (
                        <a href={`mailto:${order.email}`} className="admin-contact-btn email">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Email
                        </a>
                      )}
                    </div>
                    <div><strong>Address</strong><span>{order.address}{order.city ? `, ${order.city}` : ''}{order.pincode ? ` — ${order.pincode}` : ''}</span></div>
                    <div><strong>Payment</strong><span>{order.payment_method === 'razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery'}</span></div>
                    {order.razorpay_payment_id && <div><strong>Payment ID</strong><span>{order.razorpay_payment_id}</span></div>}
                    <div>
                      <strong>Status</strong>
                      <select value={order.status} onChange={(e) => updateStatus(order.order_id, e.target.value)} className="admin-status-select" style={{ borderColor: STATUS_COLORS[order.status] || '#6b7280' }}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {order.status !== 'Cancelled' && (
                      <div>
                        <strong>Cancel</strong>
                        <button className="admin-cancel-btn" onClick={() => { if (confirm(`Cancel order ${order.order_id}? This cannot be undone.`)) { updateStatus(order.order_id, 'Cancelled') } }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="admin-order-items">
                    <strong>Items</strong>
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="admin-order-item">
                        <span className="admin-order-item-name">{item.name}</span>
                        <span className="admin-order-item-variant">{item.variant}</span>
                        <span className="admin-order-item-qty">×{item.qty}</span>
                        <span className="admin-order-item-price">₹{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            )
          })}
        </div>
      )}
    </>
  )

  const renderRevenueTab = () => (
    <AdminRevenue orders={orders} onTabChange={setTab} />
  )

  const renderUsersTab = () => (
    <>
      <div className="admin-toolbar">
        <div className="admin-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" placeholder="Search by name, email or phone…" value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
        </div>
        <span className="admin-toolbar-count">{users.length} user{users.length !== 1 ? 's' : ''}</span>
      </div>
      {users.length === 0 ? (
        <div className="admin-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <p>No users yet</p>
          <div className="admin-empty-hint">Users appear after they sign in with Google or phone</div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Provider</th>
                <th>Joined</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.filter((u) => {
                const q = userSearch.toLowerCase()
                return !q || u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phoneNumber?.includes(q)
              }).map((u) => (
                <tr key={u.uid}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {u.photoURL ? (
                      <img src={u.photoURL} alt={u.displayName || 'User'} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#eab70420', color: '#eab704', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                        {u.displayName?.charAt(0) || u.email?.charAt(0) || '?'}
                      </div>
                    )}
                    {u.displayName || '—'}
                  </td>
                  <td>{u.email || '—'}</td>
                  <td>{u.phoneNumber || '—'}</td>
                  <td><span className="admin-provider-badge">{u.provider.join(', ')}</span></td>
                  <td className="admin-table-date">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td className="admin-table-date">{u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )

  const renderSubscribersTab = () => (
    <>
      <div className="admin-toolbar">
        <span className="admin-toolbar-count">{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}</span>
        {subscribers.length > 0 && (
          <button className="admin-export-btn" onClick={exportCSV}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
        )}
      </div>
      {subscribers.length === 0 ? (
        <div className="admin-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <p>No subscribers yet</p>
          <div className="admin-empty-hint">Newsletter sign-ups will appear here</div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Email</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr key={s.id}>
                  <td className="admin-table-num">{i + 1}</td>
                  <td>{s.email}</td>
                  <td className="admin-table-date">{new Date(s.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )

  const renderContactsTab = () => (
    contacts.length === 0 ? (
      <div className="admin-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <p>No messages yet</p>
        <div className="admin-empty-hint">Contact form submissions will appear here</div>
      </div>
    ) : (
      <div className="admin-contact-list">
        {contacts.map((c) => (
          <div key={c.id} className="admin-contact-card">
            <div className="admin-contact-top">
              <div className="admin-contact-avatar">{c.name.charAt(0).toUpperCase()}</div>
              <div className="admin-contact-info">
                <div className="admin-contact-name">{c.name}</div>
                <div className="admin-contact-email">{c.email}</div>
              </div>
              <span className="admin-contact-date">{formatDate(c.created_at)}</span>
            </div>
            {c.subject && <div className="admin-contact-subject">{c.subject}</div>}
            <p className="admin-contact-message">{c.message}</p>
            <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              <a href={`mailto:${c.email}?subject=Re: ${c.subject || 'Your message'}`} className="admin-contact-btn email" style={{ fontSize: 11, padding: '4px 10px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Reply via Email
              </a>
              <a href={`mailto:${c.email}?subject=Re: ${c.subject || 'Your message'}`} className="admin-contact-btn email" style={{ fontSize: 11, padding: '4px 10px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Call
              </a>
              <a href={`tel:${c.email}`} className="admin-contact-btn whatsapp" style={{ fontSize: 11, padding: '4px 10px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    )
  )

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <div className="admin-header-logo">B</div>
            <h1>Dashboard</h1>
          </div>
          <div className="admin-header-right">
            <button className="admin-header-refresh" onClick={loadData} disabled={refreshing} title="Refresh data">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </button>
            {lastUpdated && <span className="admin-header-updated">{lastUpdated}</span>}
            <button onClick={logout} className="admin-header-logout">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="admin-accent-bar" />

      <div className="admin-body">
        <div className="admin-layout">
          <div className="admin-sidebar">
            {SIDEBAR_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="admin-sidebar-label">{group.label}</div>
                {group.tabs.map((t) => (
                  <button
                    key={t.key}
                    className={`admin-tab ${tab === t.key ? 'active' : ''}`}
                    onClick={() => setTab(t.key)}
                  >
                    <SidebarIcon name={t.icon} />
                    <span className="admin-tab-label">{t.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="admin-main">
            {tab === 'overview' && (
              <div className="admin-content-full">
                <AdminOverview orders={orders} users={users} subscribers={subscribers} contacts={contacts} onTabChange={setTab} />
              </div>
            )}
            {tab !== 'overview' && (
              <div className="admin-content">
                {tab === 'orders' && renderOrdersTab()}
                {tab === 'revenue' && renderRevenueTab()}
                {tab === 'products' && <AdminProducts />}
                {tab === 'discounts' && <AdminDiscounts />}
                {tab === 'subscribers' && renderSubscribersTab()}
                {tab === 'customers' && <AdminCustomers users={users} orders={orders} />}
                {tab === 'contacts' && renderContactsTab()}
                {tab === 'users' && renderUsersTab()}
                {tab === 'settings' && <AdminSettings />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
