'use client'

import { useMemo } from 'react'

interface AdminOverviewProps {
  orders: any[]
  users: any[]
  subscribers: any[]
  contacts: any[]
  onTabChange: (tab: string) => void
}

export default function AdminOverview({ orders, users, subscribers, contacts, onTabChange }: AdminOverviewProps) {
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
  const todayOrders = orders.filter((o: any) => {
    const d = new Date(o.created_at)
    const t = new Date()
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
  }).length
  const pendingOrders = orders.filter((o: any) => !['Delivered', 'Cancelled'].includes(o.status)).length

  const chartData = useMemo(() => {
    const days: { label: string; orders: number; revenue: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString()
      const dayOrders = orders.filter((o: any) => o.created_at >= dayStart && o.created_at < dayEnd)
      days.push({
        label: dateStr,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((s: number, o: any) => s + (o.total || 0), 0),
      })
    }
    return days
  }, [orders])

  const maxOrders = Math.max(...chartData.map((d) => d.orders), 1)
  const buyerUids = new Set(orders.filter((o: any) => o.user_id).map((o: any) => o.user_id))
  const totalVisitors = users.length
  const totalBuyers = buyerUids.size
  const visitorsOnly = totalVisitors - totalBuyers
  const buyerAngle = totalVisitors > 0 ? (totalBuyers / totalVisitors) * 360 : 0

  return (
    <div>
      <div className="admin-stats">
        <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg,#fefce8,#fff)', cursor: 'pointer' }} onClick={() => onTabChange('orders')}>
          <div className="admin-stat-top">
            <div className="admin-stat-icon" style={{ background: '#eab70415', color: '#eab704' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <span className="admin-stat-trend up">{todayOrders} today</span>
          </div>
          <div className="admin-stat-num">{orders.length}</div>
          <div className="admin-stat-label">Total Orders</div>
        </div>
        <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg,#f0fdf4,#fff)', cursor: 'pointer' }} onClick={() => onTabChange('revenue')}>
          <div className="admin-stat-top">
            <div className="admin-stat-icon" style={{ background: '#22c55e15', color: '#22c55e' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <span className="admin-stat-trend up">Lifetime</span>
          </div>
          <div className="admin-stat-num">₹{totalRevenue.toLocaleString()}</div>
          <div className="admin-stat-label">Total Revenue</div>
        </div>
        <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg,#eff6ff,#fff)', cursor: 'pointer' }} onClick={() => onTabChange('subscribers')}>
          <div className="admin-stat-top">
            <div className="admin-stat-icon" style={{ background: '#3b82f615', color: '#3b82f6' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <span className="admin-stat-trend up">{subscribers.length} total</span>
          </div>
          <div className="admin-stat-num">{subscribers.length}</div>
          <div className="admin-stat-label">Subscribers</div>
        </div>
        <div className="admin-stat-card" style={{ background: 'linear-gradient(135deg,#fef2f2,#fff)', cursor: 'pointer' }} onClick={() => onTabChange('contacts')}>
          <div className="admin-stat-top">
            <div className="admin-stat-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <span className="admin-stat-trend" style={{ color: 'rgba(58,36,26,0.35)' }}>{pendingOrders} pending</span>
          </div>
          <div className="admin-stat-num">{contacts.length}</div>
          <div className="admin-stat-label">Messages</div>
        </div>
      </div>

      <div className="admin-insights">
        <div className="admin-chart">
          <div className="admin-chart-header">
            <h3>Orders (Last 7 Days)</h3>
            <span className="admin-chart-toggle" onClick={() => onTabChange('orders')}>View all →</span>
          </div>
          <div className="admin-chart-bars">
            {chartData.map((d) => (
              <div key={d.label} className="admin-chart-col">
                <div className="admin-chart-bar-wrap">
                  <div className="admin-chart-bar" style={{ height: `${(d.orders / maxOrders) * 100}%` }}>
                    <span className="admin-chart-bar-val">{d.orders}</span>
                  </div>
                </div>
                <span className="admin-chart-label">{d.label}</span>
                <span className="admin-chart-rev">₹{d.revenue}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="admin-chart">
          <div className="admin-chart-header">
            <h3>Visitors vs Buyers</h3>
          </div>
          <div className="admin-pie-wrap">
            <div className="admin-pie" style={{ background: `conic-gradient(#22c55e 0deg ${buyerAngle}deg, #eab704 ${buyerAngle}deg 360deg)` }}>
              <div className="admin-pie-inner">
                <span className="admin-pie-total">{totalVisitors}</span>
                <span className="admin-pie-label">Users</span>
              </div>
            </div>
            <div className="admin-pie-legend">
              <div className="admin-pie-legend-item">
                <span className="admin-pie-dot" style={{ background: '#22c55e' }} />
                <span>Buyers</span>
                <span className="admin-pie-num">{totalBuyers} ({totalVisitors > 0 ? Math.round(totalBuyers / totalVisitors * 100) : 0}%)</span>
              </div>
              <div className="admin-pie-legend-item">
                <span className="admin-pie-dot" style={{ background: '#eab704' }} />
                <span>Visitors</span>
                <span className="admin-pie-num">{visitorsOnly} ({totalVisitors > 0 ? Math.round(visitorsOnly / totalVisitors * 100) : 0}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
