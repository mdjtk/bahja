'use client';

import { useState, useEffect } from 'react';
import { getAllOrders, OrderInfo } from '@/lib/store';

function loadSubscribers(): string[] {
  try {
    return JSON.parse(localStorage.getItem('bahja_subscribers') || '[]');
  } catch {
    return [];
  }
}

function loadContacts(): { name: string; email: string; subject: string; message: string; date: string }[] {
  try {
    return JSON.parse(localStorage.getItem('bahja_contacts') || '[]');
  } catch {
    return [];
  }
}

export default function AdminPage() {
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [tab, setTab] = useState<'orders' | 'subscribers' | 'contacts'>('orders');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setOrders(getAllOrders());
    setSubscribers(loadSubscribers());
    setContacts(loadContacts());
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Admin Dashboard</h1>
          <p>Manage orders, subscribers & contacts</p>
        </div>
      </div>

      <div className="section" style={{ paddingTop: 10 }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 16, marginBottom: 30, flexWrap: 'wrap' }}>
            <div className="stat-card">
              <div style={{ fontSize: 24, fontWeight: 700, color: '#3A241A' }}>{orders.length}</div>
              <div style={{ fontSize: 12, color: '#8B7355', marginTop: 4 }}>Total Orders</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: 24, fontWeight: 700, color: '#3A241A' }}>₹{totalRevenue.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#8B7355', marginTop: 4 }}>Total Revenue</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: 24, fontWeight: 700, color: '#3A241A' }}>{subscribers.length}</div>
              <div style={{ fontSize: 12, color: '#8B7355', marginTop: 4 }}>Subscribers</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: 24, fontWeight: 700, color: '#3A241A' }}>{contacts.length}</div>
              <div style={{ fontSize: 12, color: '#8B7355', marginTop: 4 }}>Messages</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid rgba(58,36,26,0.08)' }}>
            {(['orders', 'subscribers', 'contacts'] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 600,
                color: tab === t ? '#eab704' : 'rgba(58,36,26,0.4)',
                borderBottom: tab === t ? '2px solid #eab704' : '2px solid transparent',
                marginBottom: -2, textTransform: 'capitalize', letterSpacing: 0.5,
              }}>
                {t}
              </button>
            ))}
          </div>

          {tab === 'orders' && (
            orders.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>No orders yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[...orders].reverse().map((order) => (
                  <div key={order.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(58,36,26,0.06)', overflow: 'hidden' }}>
                    <div
                      onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                      style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#3A241A' }}>{order.id}</div>
                        <div style={{ fontSize: 12, color: 'rgba(58,36,26,0.45)', marginTop: 2 }}>{order.name} · {new Date(order.date).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12,
                          background: order.payment === 'razorpay' ? '#e8f5e9' : '#fff8e1',
                          color: order.payment === 'razorpay' ? '#2e7d32' : '#f57f17',
                        }}>
                          {order.payment === 'razorpay' ? 'PAID' : 'COD'}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#3A241A' }}>₹{order.total}</span>
                        <span style={{ color: 'rgba(58,36,26,0.2)', fontSize: 18 }}>{expanded === order.id ? '−' : '+'}</span>
                      </div>
                    </div>
                    {expanded === order.id && (
                      <div style={{ padding: '0 20px 16px', fontSize: 13, color: 'rgba(58,36,26,0.6)', lineHeight: 1.8 }}>
                        <div><strong>Name:</strong> {order.name}</div>
                        <div><strong>Phone:</strong> {order.phone}</div>
                        <div><strong>Email:</strong> {order.email || '—'}</div>
                        <div><strong>Address:</strong> {order.address}, {order.city} — {order.pincode}</div>
                        <div><strong>Payment:</strong> {order.payment === 'razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery'}</div>
                        {order.razorpayPaymentId && <div><strong>Payment ID:</strong> {order.razorpayPaymentId}</div>}
                        <div><strong>Status:</strong> {order.status}</div>
                        <div style={{ borderTop: '1px solid rgba(58,36,26,0.06)', margin: '8px 0', paddingTop: 8 }}>
                          <strong>Items:</strong>
                          {order.items.map((item, i) => (
                            <div key={i} style={{ marginTop: 4, paddingLeft: 8, borderLeft: '2px solid #eab704' }}>
                              {item.name} ({item.variant}) × {item.qty} = ₹{item.price * item.qty}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'subscribers' && (
            subscribers.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>No subscribers yet.</div>
            ) : (
              <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden' }}>
                {subscribers.map((email, i) => (
                  <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid rgba(58,36,26,0.04)', fontSize: 14, color: '#3A241A' }}>
                    {i + 1}. {email}
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'contacts' && (
            contacts.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>No messages yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[...contacts].reverse().map((c, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(58,36,26,0.06)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#3A241A' }}>{c.name} ({c.email})</div>
                    <div style={{ fontSize: 12, color: 'rgba(58,36,26,0.4)', marginTop: 2 }}>{c.subject} · {new Date(c.date).toLocaleDateString()}</div>
                    <div style={{ fontSize: 13, color: 'rgba(58,36,26,0.6)', marginTop: 8, lineHeight: 1.5 }}>{c.message}</div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
}
