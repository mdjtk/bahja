'use client'

import { useMemo } from 'react'

interface AdminRevenueProps {
  orders: any[]
  onTabChange: (tab: string) => void
}

export default function AdminRevenue({ orders, onTabChange }: AdminRevenueProps) {
  const onlineCollected = orders.filter((o: any) => o.payment_method === 'razorpay' && o.razorpay_payment_id).reduce((s: number, o: any) => s + (o.total || 0), 0)
  const onlinePending = orders.filter((o: any) => o.payment_method === 'razorpay' && !o.razorpay_payment_id && o.status !== 'Cancelled').reduce((s: number, o: any) => s + (o.total || 0), 0)
  const codCollected = orders.filter((o: any) => o.payment_method === 'cod' && o.status === 'Delivered').reduce((s: number, o: any) => s + (o.total || 0), 0)
  const codPending = orders.filter((o: any) => o.payment_method === 'cod' && o.status !== 'Delivered' && o.status !== 'Cancelled').reduce((s: number, o: any) => s + (o.total || 0), 0)
  const cancelledRev = orders.filter((o: any) => o.status === 'Cancelled').reduce((s: number, o: any) => s + (o.total || 0), 0)
  const collected = onlineCollected + codCollected
  const pending = onlinePending + codPending
  const totalRevenue = orders.reduce((s: number, o: any) => s + (o.total || 0), 0)
  const paidOrders = orders.filter((o: any) => o.payment_method === 'razorpay').length
  const codOrders = orders.filter((o: any) => o.payment_method === 'cod').length
  const deliveredOrders = orders.filter((o: any) => o.status === 'Delivered').length
  const cancelledOrders = orders.filter((o: any) => o.status === 'Cancelled').length
  const pendingOrders = orders.filter((o: any) => o.status !== 'Delivered' && o.status !== 'Cancelled').length
  const collectionRate = totalRevenue > 0 ? Math.round(collected / totalRevenue * 100) : 0
  const deliveryRate = orders.length > 0 ? Math.round(deliveredOrders / orders.length * 100) : 0

  const chartData = useMemo(() => {
    const days: { label: string; orders: number; revenue: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString()
      const dayOrders = orders.filter((o: any) => o.created_at >= dayStart && o.created_at < dayEnd)
      days.push({ label: dateStr, orders: dayOrders.length, revenue: dayOrders.reduce((s: number, o: any) => s + (o.total || 0), 0) })
    }
    return days
  }, [orders])

  const maxRev = Math.max(...chartData.map((x) => x.revenue), 1)
  const totalOrders = orders.length

  return (
    <div>
      <div className="admin-stats">
        <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg,#f0fdf4,#fff)' }}>
          <div className="admin-stat-top">
            <div className="admin-stat-icon" style={{ background: '#22c55e15', color: '#22c55e' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <span className="admin-stat-trend up">{collectionRate}% collected</span>
          </div>
          <div className="admin-stat-num">₹{collected.toLocaleString()}</div>
          <div className="admin-stat-label">Collected Revenue</div>
        </div>
        <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg,#fff7ed,#fff)' }}>
          <div className="admin-stat-top">
            <div className="admin-stat-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <span className="admin-stat-trend" style={{ color: 'rgba(58,36,26,0.35)' }}>{pendingOrders} pending orders</span>
          </div>
          <div className="admin-stat-num">₹{pending.toLocaleString()}</div>
          <div className="admin-stat-label">Awaiting Collection</div>
        </div>
        <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg,#fef2f2,#fff)' }}>
          <div className="admin-stat-top">
            <div className="admin-stat-icon" style={{ background: '#ef444415', color: '#ef4444' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <span className="admin-stat-trend" style={{ color: '#ef4444' }}>{cancelledOrders} cancelled</span>
          </div>
          <div className="admin-stat-num">₹{cancelledRev.toLocaleString()}</div>
          <div className="admin-stat-label">Cancelled Orders</div>
        </div>
        <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg,#faf5ff,#fff)' }}>
          <div className="admin-stat-top">
            <div className="admin-stat-icon" style={{ background: '#8b5cf615', color: '#8b5cf6' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span className="admin-stat-trend up">{deliveryRate}% delivered</span>
          </div>
          <div className="admin-stat-num">{deliveredOrders}/{totalOrders}</div>
          <div className="admin-stat-label">Delivery Rate</div>
        </div>
      </div>

      <div className="admin-breakdown" style={{ marginTop: 20 }}>
        <div className="admin-breakdown-header">
          <h3>Revenue Breakdown</h3>
        </div>
        <div className="admin-breakdown-grid">
          <div className="admin-breakdown-card" style={{ borderLeft: '3px solid #3b82f6' }}>
            <div className="admin-bd-label">Online (Razorpay)</div>
            <div className="admin-bd-amount">₹{onlineCollected.toLocaleString()}</div>
            <div className="admin-bd-sub">
              <span style={{ color: onlinePending > 0 ? '#f59e0b' : '#22c55e' }}>
                {onlinePending > 0 ? `₹${onlinePending.toLocaleString()} pending` : 'All cleared'}
              </span>
              <span>{paidOrders} transactions</span>
            </div>
          </div>
          <div className="admin-breakdown-card" style={{ borderLeft: '3px solid #f59e0b' }}>
            <div className="admin-bd-label">Cash on Delivery</div>
            <div className="admin-bd-amount">₹{codCollected.toLocaleString()}</div>
            <div className="admin-bd-sub">
              <span style={{ color: codPending > 0 ? '#f59e0b' : '#22c55e' }}>
                {codPending > 0 ? `₹${codPending.toLocaleString()} uncollected` : 'All collected'}
              </span>
              <span>{codOrders} orders</span>
            </div>
          </div>
          <div className="admin-breakdown-card" style={{ borderLeft: '3px solid #22c55e' }}>
            <div className="admin-bd-label">Total Gross Revenue</div>
            <div className="admin-bd-amount" style={{ fontSize: 28 }}>₹{totalRevenue.toLocaleString()}</div>
            <div className="admin-bd-sub">
              <span style={{ color: '#22c55e' }}>Net: ₹{collected.toLocaleString()}</span>
              <span>{totalOrders} total orders</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-insights" style={{ marginTop: 20 }}>
        <div className="admin-chart">
          <div className="admin-chart-header">
            <h3>Revenue Trend</h3>
            <span className="admin-chart-toggle" onClick={() => onTabChange('orders')}>View orders →</span>
          </div>
          <div className="admin-chart-bars">
            {chartData.map((d) => (
              <div key={d.label} className="admin-chart-col">
                <div className="admin-chart-bar-wrap">
                  <div className="admin-chart-bar" style={{ height: `${(d.revenue / maxRev) * 100}%`, background: 'linear-gradient(180deg,#22c55e,#16a34a)' }}>
                    <span className="admin-chart-bar-val" style={{ color: '#fff' }}>₹{d.revenue}</span>
                  </div>
                </div>
                <span className="admin-chart-label">{d.label}</span>
                <span className="admin-chart-rev">{d.orders} ord</span>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-chart">
          <div className="admin-chart-header"><h3>Payment Split</h3></div>
          <div className="admin-pie-wrap">
            <div className="admin-pie" style={{ background: `conic-gradient(#3b82f6 0deg ${totalOrders > 0 ? (paidOrders / totalOrders) * 360 : 0}deg, #f59e0b ${totalOrders > 0 ? (paidOrders / totalOrders) * 360 : 0}deg 360deg)` }}>
              <div className="admin-pie-inner">
                <span className="admin-pie-total">{totalOrders}</span>
                <span className="admin-pie-label">Orders</span>
              </div>
            </div>
            <div className="admin-pie-legend">
              <div className="admin-pie-legend-item">
                <span className="admin-pie-dot" style={{ background: '#3b82f6' }} />
                <span>Online</span>
                <span className="admin-pie-num">{paidOrders} ({totalOrders > 0 ? Math.round(paidOrders / totalOrders * 100) : 0}%)</span>
              </div>
              <div className="admin-pie-legend-item">
                <span className="admin-pie-dot" style={{ background: '#f59e0b' }} />
                <span>COD</span>
                <span className="admin-pie-num">{codOrders} ({totalOrders > 0 ? Math.round(codOrders / totalOrders * 100) : 0}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-table-wrap" style={{ marginTop: 20 }}>
        <div className="admin-toolbar">
          <span className="admin-toolbar-count">
            <strong>{orders.length}</strong> transactions
          </span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {[...orders].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((o: any) => (
              <tr key={o.order_id} style={{ opacity: o.status === 'Cancelled' ? 0.45 : 1 }}>
                <td className="admin-table-id">{o.order_id}</td>
                <td>{o.customer_name}</td>
                <td style={{ fontWeight: 700, color: o.status === 'Cancelled' ? '#ef4444' : '#3A241A' }}>₹{o.total}</td>
                <td>
                  <span className="admin-badge" style={{ background: o.payment_method === 'razorpay' ? '#3b82f615' : '#f59e0b15', color: o.payment_method === 'razorpay' ? '#3b82f6' : '#f59e0b' }}>
                    {o.payment_method === 'razorpay' ? 'Online' : 'COD'}
                  </span>
                </td>
                <td>
                  <span className="admin-badge" style={{
                    background: o.status === 'Delivered' ? '#22c55e15' : o.status === 'Cancelled' ? '#ef444415' : '#f59e0b15',
                    color: o.status === 'Delivered' ? '#22c55e' : o.status === 'Cancelled' ? '#ef4444' : '#f59e0b',
                  }}>
                    {o.status}
                  </span>
                </td>
                <td>
                  {o.payment_method === 'razorpay' && o.razorpay_payment_id
                    ? <span className="admin-badge" style={{ background: '#22c55e15', color: '#22c55e' }}>Paid</span>
                    : <span className="admin-badge" style={{ background: '#f59e0b15', color: '#f59e0b' }}>{o.status === 'Cancelled' ? 'Void' : 'Pending'}</span>
                  }
                </td>
                <td className="admin-table-date">{new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
