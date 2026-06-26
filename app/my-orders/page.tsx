'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

interface Order {
  order_id: string
  customer_name: string
  total: number
  payment_method: string
  status: string
  items: any[]
  created_at: string
  razorpay_payment_id: string | null
}

export default function MyOrdersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login?redirect=/my-orders')
      return
    }
    fetch('/api/orders/my')
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return <div style={{ padding: 60, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>Loading…</div>
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>My Orders</h1>
          <p>View your order history</p>
        </div>
      </div>
      <div className="section" style={{ paddingTop: 10 }}>
        <div className="container" style={{ maxWidth: 700, margin: '0 auto' }}>
          {orders.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>
              <p>No orders yet.</p>
              <a href="/shop" style={{ color: '#eab704', fontWeight: 600 }}>Shop now →</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map((order) => (
                <div key={order.order_id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(58,36,26,0.06)', overflow: 'hidden' }}>
                  <div onClick={() => setExpanded(expanded === order.order_id ? null : order.order_id)} style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#3A241A' }}>{order.order_id}</div>
                      <div style={{ fontSize: 12, color: 'rgba(58,36,26,0.45)', marginTop: 2 }}>{new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12, background: order.status === 'Delivered' ? '#e8f5e9' : '#fff8e1', color: order.status === 'Delivered' ? '#2e7d32' : '#f57f17' }}>{order.status}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#3A241A' }}>₹{order.total}</span>
                      <span style={{ color: 'rgba(58,36,26,0.2)', fontSize: 18 }}>{expanded === order.order_id ? '−' : '+'}</span>
                    </div>
                  </div>
                  {expanded === order.order_id && (
                    <div style={{ padding: '0 20px 16px', fontSize: 13, color: 'rgba(58,36,26,0.6)', lineHeight: 1.8 }}>
                      <div><strong>Order ID:</strong> {order.order_id}</div>
                      <div><strong>Payment:</strong> {order.payment_method === 'razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery'}</div>
                      {order.razorpay_payment_id && <div><strong>Payment ID:</strong> {order.razorpay_payment_id}</div>}
                      <div><strong>Status:</strong> {order.status}</div>
                      <div style={{ borderTop: '1px solid rgba(58,36,26,0.06)', margin: '8px 0', paddingTop: 8 }}>
                        <strong>Items:</strong>
                        {order.items.map((item: any, i: number) => (
                          <div key={i} style={{ marginTop: 4, paddingLeft: 8, borderLeft: '2px solid #eab704' }}>{item.name} ({item.variant}) × {item.qty} = ₹{item.price * item.qty}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
