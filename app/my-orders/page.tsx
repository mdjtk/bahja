'use client'

import { Suspense, useState, useEffect, FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { fetchWithAuth } from '@/lib/fetch-with-auth'
import { getOrderByIdDb, OrderInfo } from '@/lib/store'

const timeline = ['Order Placed', 'Confirmed', 'Preparing', 'Dispatched', 'Out for Delivery', 'Delivered']

function OrderTimeline({ status }: { status?: string }) {
  const currentStep = timeline.indexOf(status ?? '')
  return (
    <div className="timeline" style={{ display: 'flex', gap: 4, margin: '12px 0', flexWrap: 'wrap' }}>
      {timeline.map((step, i) => (
        <div key={step} style={{ flex: 1, minWidth: 80, textAlign: 'center', opacity: i <= currentStep ? 1 : 0.3 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: i <= currentStep ? '#eab704' : '#ddd', margin: '0 auto 4px' }} />
          <div style={{ fontSize: 10, color: '#3A241A', fontWeight: i === currentStep ? 700 : 400 }}>{step}</div>
        </div>
      ))}
    </div>
  )
}

function MyOrdersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<OrderInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const initialId = searchParams.get('id') || ''
  const [searchId, setSearchId] = useState(initialId)
  const [trackedOrder, setTrackedOrder] = useState<OrderInfo | undefined | null>(undefined)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login?redirect=/my-orders')
      return
    }
    fetchWithAuth('/api/orders/my')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const mapped: OrderInfo[] = data.map((o: any) => ({
            id: o.order_id,
            items: o.items,
            name: o.customer_name || '',
            phone: o.phone || '',
            email: o.email || '',
            address: o.address || '',
            city: o.city || '',
            state: o.state || '',
            pincode: o.pincode || '',
            payment: o.payment_method,
            total: o.total,
            date: o.created_at,
            status: o.status,
            razorpayPaymentId: o.razorpay_payment_id,
          }))
          setOrders(mapped)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user, authLoading, router])

  useEffect(() => {
    if (initialId && user) {
      getOrderByIdDb(initialId).then((o) => setTrackedOrder(o ?? null))
    }
  }, [initialId, user])

  const handleTrack = async (e: FormEvent) => {
    e.preventDefault()
    if (!searchId.trim()) return
    const found = await getOrderByIdDb(searchId.trim())
    setTrackedOrder(found ?? null)
  }

  if (authLoading || loading) {
    return (
      <>
        <div className="page-header">
          <div className="container">
            <h1>My Orders &amp; Tracking</h1>
            <p>View your order history or track a specific order</p>
          </div>
        </div>
        <div className="section" style={{ paddingTop: 10 }}>
          <div className="container" style={{ maxWidth: 700, margin: '0 auto' }}>
            <div className="skeleton-shimmer" style={{ height: 44, borderRadius: 8, marginBottom: 32 }} />
            <div className="skeleton-shimmer" style={{ height: 20, width: '40%', borderRadius: 6, marginBottom: 16 }} />
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(58,36,26,0.06)', padding: '14px 20px', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div className="skeleton-shimmer" style={{ height: 14, width: '40%', borderRadius: 4, marginBottom: 8 }} />
                    <div className="skeleton-shimmer" style={{ height: 12, width: '25%', borderRadius: 4 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="skeleton-shimmer" style={{ height: 22, width: 60, borderRadius: 12 }} />
                    <div className="skeleton-shimmer" style={{ height: 14, width: 50, borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>My Orders &amp; Tracking</h1>
          <p>View your order history or track a specific order</p>
        </div>
      </div>

      <div className="section" style={{ paddingTop: 10 }}>
        <div className="container" style={{ maxWidth: 700, margin: '0 auto' }}>
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
            <input
              type="text"
              placeholder="Search order ID (e.g. BHJ2A3F8K)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              style={{ flex: 1, padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(58,36,26,0.15)', fontSize: 14, outline: 'none' }}
            />
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Track</button>
          </form>

          {trackedOrder === null && searchId && (
            <p style={{ textAlign: 'center', color: 'rgba(58,36,26,0.45)', marginBottom: 24, fontSize: 13 }}>
              No order found with that ID. It may belong to a different account.
            </p>
          )}

          {trackedOrder && (
            <div style={{ background: '#fef9e7', borderRadius: 12, padding: 20, marginBottom: 24, border: '1px solid #eab704' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <strong style={{ fontSize: 15, color: '#3A241A' }}>#{trackedOrder.id}</strong>
                  <span style={{ fontSize: 12, color: 'rgba(58,36,26,0.45)', marginLeft: 8 }}>{new Date(trackedOrder.date).toLocaleDateString()}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12, background: trackedOrder.status === 'Delivered' ? '#e8f5e9' : '#fff8e1', color: trackedOrder.status === 'Delivered' ? '#2e7d32' : '#f57f17' }}>{trackedOrder.status}</span>
              </div>
              <OrderTimeline status={trackedOrder.status} />
              {trackedOrder.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(58,36,26,0.55)', marginBottom: 4 }}>
                  <span>{item.name} ({item.variant}) × {item.qty}</span>
                  <span>₹{item.price * item.qty}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#3A241A', borderTop: '1px solid rgba(58,36,26,0.08)', marginTop: 8, paddingTop: 8 }}>
                <span>Total</span>
                <span>₹{trackedOrder.total}</span>
              </div>
              {trackedOrder.address && (
                <div style={{ fontSize: 12, color: 'rgba(58,36,26,0.4)', marginTop: 10, lineHeight: 1.7 }}>
                  <div><strong>Shipping:</strong> {trackedOrder.address}{trackedOrder.city ? `, ${trackedOrder.city}` : ''}{trackedOrder.pincode ? ` – ${trackedOrder.pincode}` : ''}</div>
                  <div><strong>Payment:</strong> {trackedOrder.payment === 'cod' ? 'Cash on Delivery' : trackedOrder.payment}</div>
                </div>
              )}
            </div>
          )}

          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#3A241A', marginBottom: 16 }}>Order History</h3>

          {orders.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>
              <p>No orders yet.</p>
              <Link href="/shop" style={{ color: '#eab704', fontWeight: 600 }}>Shop now →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {orders.map((order) => (
                <div key={order.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(58,36,26,0.06)', overflow: 'hidden' }}>
                  <div onClick={() => setExpanded(expanded === order.id ? null : order.id)} style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#3A241A' }}>{order.id}</div>
                      <div style={{ fontSize: 12, color: 'rgba(58,36,26,0.45)', marginTop: 2 }}>{new Date(order.date).toLocaleDateString()}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 12, background: order.status === 'Delivered' ? '#e8f5e9' : '#fff8e1', color: order.status === 'Delivered' ? '#2e7d32' : '#f57f17' }}>{order.status}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#3A241A' }}>₹{order.total}</span>
                      <span style={{ color: 'rgba(58,36,26,0.2)', fontSize: 18 }}>{expanded === order.id ? '−' : '+'}</span>
                    </div>
                  </div>
                  {expanded === order.id && (
                    <div style={{ padding: '0 20px 16px', fontSize: 13, color: 'rgba(58,36,26,0.6)', lineHeight: 1.8 }}>
                      <OrderTimeline status={order.status} />
                      <div style={{ borderTop: '1px solid rgba(58,36,26,0.06)', margin: '8px 0', paddingTop: 8 }}>
                        <strong>Items:</strong>
                        {order.items.map((item: any, i: number) => (
                          <div key={i} style={{ marginTop: 4, paddingLeft: 8, borderLeft: '2px solid #eab704', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.name} ({item.variant}) × {item.qty}</span>
                            <span>₹{item.price * item.qty}</span>
                          </div>
                        ))}
                      </div>
                      <div><strong>Payment:</strong> {order.payment === 'razorpay' ? 'Online (Razorpay)' : 'Cash on Delivery'}</div>
                      {order.address && (
                        <div><strong>Shipping:</strong> {order.address}{order.city ? `, ${order.city}` : ''}{order.pincode ? ` – ${order.pincode}` : ''}</div>
                      )}
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

export default function MyOrdersPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center', color: 'rgba(58,36,26,0.4)' }}>Loading…</div>}>
      <MyOrdersContent />
    </Suspense>
  )
}
