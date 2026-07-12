'use client'

import { useState } from 'react'

interface AdminCustomersProps {
  users: any[]
  orders: any[]
}

export default function AdminCustomers({ users, orders }: AdminCustomersProps) {
  const [search, setSearch] = useState('')
  const [selectedUid, setSelectedUid] = useState<string | null>(null)

  const enriched = users.map((u) => {
    const userOrders = orders.filter((o: any) => o.user_id === u.uid)
    return {
      ...u,
      orderCount: userOrders.length,
      totalSpent: userOrders.reduce((s: number, o: any) => s + (o.total || 0), 0),
      lastOrder: userOrders.length ? userOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at : null,
    }
  })

  const filtered = enriched.filter((u) => {
    const q = search.toLowerCase()
    return !q || u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phoneNumber?.includes(q)
  })

  const selectedUser = selectedUid ? enriched.find((u) => u.uid === selectedUid) : null
  const userOrders = selectedUid ? orders.filter((o: any) => o.user_id === selectedUid) : []

  if (users.length === 0) {
    return (
      <div className="admin-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        <p>No customers yet</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 16, flexDirection: 'column' }}>
      <div className="admin-search" style={{ maxWidth: 380 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {selectedUser ? (
        <div>
          <button onClick={() => setSelectedUid(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: '#8B7355', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Back to all customers
          </button>
          <div className="admin-content" style={{ margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              {selectedUser.photoURL ? (
                <img src={selectedUser.photoURL} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#eab70420', color: '#eab704', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>
                  {selectedUser.displayName?.charAt(0) || selectedUser.email?.charAt(0) || '?'}
                </div>
              )}
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#3A241A' }}>{selectedUser.displayName || 'Anonymous'}</div>
                <div style={{ fontSize: 13, color: 'rgba(58,36,26,0.4)' }}>{selectedUser.email || selectedUser.phoneNumber || 'No contact info'}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, textAlign: 'right' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#3A241A' }}>{selectedUser.orderCount}</div>
                  <div style={{ fontSize: 11, color: 'rgba(58,36,26,0.4)' }}>Orders</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>₹{selectedUser.totalSpent.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'rgba(58,36,26,0.4)' }}>Total Spent</div>
                </div>
              </div>
            </div>
            <div><strong style={{ fontSize: 11, fontWeight: 600, color: 'rgba(58,36,26,0.35)', textTransform: 'uppercase', letterSpacing: '.5px' }}>Joined</strong><span style={{ display: 'block', fontSize: 13, color: '#3A241A', marginTop: 2 }}>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span></div>

            {userOrders.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <strong style={{ fontSize: 11, fontWeight: 600, color: 'rgba(58,36,26,0.35)', textTransform: 'uppercase', letterSpacing: '.5px', display: 'block', marginBottom: 8 }}>Order History</strong>
                <div className="admin-order-list">
                  {userOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order: any) => (
                    <div key={order.order_id} className="admin-order-card" style={{ borderLeftColor: order.status === 'Cancelled' ? '#ef4444' : order.status === 'Delivered' ? '#22c55e' : '#eab704' }}>
                      <div className="admin-order-header" style={{ cursor: 'default' }}>
                        <div className="admin-order-info">
                          <div className="admin-order-id">{order.order_id}</div>
                          <div className="admin-order-customer">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                        </div>
                        <div className="admin-order-meta">
                          <span className="admin-badge" style={{ background: `${order.payment_method === 'razorpay' ? '#22c55e' : '#f59e0b'}15`, color: order.payment_method === 'razorpay' ? '#22c55e' : '#f59e0b' }}>
                            {order.payment_method === 'razorpay' ? 'Paid' : 'COD'}
                          </span>
                          <span className="admin-badge" style={{ background: '#3A241A10', color: '#3A241A' }}>{order.status}</span>
                          <span className="admin-order-total">₹{order.total}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
              </tr>
            </thead>
            <tbody>
              {filtered.sort((a, b) => b.totalSpent - a.totalSpent).map((u) => (
                <tr key={u.uid} style={{ cursor: 'pointer' }} onClick={() => setSelectedUid(u.uid)}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {u.photoURL ? (
                      <img src={u.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eab70420', color: '#eab704', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                        {u.displayName?.charAt(0) || u.email?.charAt(0) || '?'}
                      </div>
                    )}
                    {u.displayName || '—'}
                  </td>
                  <td>{u.email || '—'}</td>
                  <td>{u.phoneNumber || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{u.orderCount}</td>
                  <td style={{ fontWeight: 600, color: '#22c55e' }}>₹{u.totalSpent.toLocaleString()}</td>
                  <td className="admin-table-date">{u.lastOrder ? new Date(u.lastOrder).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
