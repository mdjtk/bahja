'use client';

import { Suspense, useState, useEffect, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { getOrderById, getAllOrders } from '@/lib/store';

const timeline = ['Order Placed', 'Confirmed', 'Preparing', 'Dispatched', 'Out for Delivery', 'Delivered'];

function OrderDetail({ order }: { order: ReturnType<typeof getOrderById> }) {
  if (!order) return null;
  const currentStep = timeline.indexOf(order.status);
  return (
    <div className="order-card">
      <div className="order-header">
        <div>
          <strong>Order #{order.id}</strong>
          <span style={{ fontSize: 13, color: 'rgba(58,36,26,0.4)' }}>{order.date}</span>
        </div>
        <span className={`order-status ${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
          {order.status}
        </span>
      </div>
      <div className="timeline">
        {timeline.map((step, i) => (
          <div key={step} className={`tl-item${i <= currentStep ? ' done' : ''}`}>
            <div className={`tl-dot${i <= currentStep ? ' done' : ''}`}></div>
            <div className="tl-content">
              <h4>{step}</h4>
              <p>{i === currentStep ? 'Current' : i < currentStep ? 'Completed' : ''}</p>
            </div>
          </div>
        ))}
      </div>
      {order.items.map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'rgba(58,36,26,0.55)', marginBottom: 6 }}>
          <span>{item.name} ({item.variant}) × {item.qty}</span>
          <span>₹{item.price * item.qty}</span>
        </div>
      ))}
      <div className="order-total">
        <span>Total</span>
        <span>₹{order.total}</span>
      </div>
      <div style={{ fontSize: 13, color: 'rgba(58,36,26,0.4)', marginTop: 12, lineHeight: 1.8 }}>
        <div><strong>Shipping to:</strong> {order.address}, {order.city} – {order.pincode}</div>
        <div><strong>Phone:</strong> {order.phone}</div>
        <div><strong>Payment:</strong> {order.payment === 'cod' ? 'Cash on Delivery' : order.payment}</div>
      </div>
    </div>
  );
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const [inputId, setInputId] = useState(initialId);
  const [order, setOrder] = useState(initialId ? getOrderById(initialId) : undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialId) {
      setInputId(initialId);
      setOrder(getOrderById(initialId));
    }
  }, [initialId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = getOrderById(inputId);
    setOrder(found);
  };

  const allOrders = getAllOrders();

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Track Order</h1>
          <p>Enter your order ID to check status</p>
        </div>
      </div>

      <div className="track-page">
        <div className="container">
          <form className="track-form" onSubmit={handleSubmit}>
            <input type="text" id="track-input" placeholder="Order ID (e.g. BHJ2A3F8K)" value={inputId} onChange={(e) => setInputId(e.target.value)} required />
            <button type="submit">Track</button>
          </form>

          {allOrders.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#3A241A', marginBottom: 16 }}>Your Orders</h3>
              {allOrders.slice().reverse().map((o) => (
                <div key={o.id} style={{ marginBottom: 8 }}>
                  <div
                    onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                    style={{ background: expandedId === o.id ? '#fef9e7' : '#f9f6ef', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: expandedId === o.id ? '1px solid #eab704' : '1px solid transparent', cursor: 'pointer', transition: 'background .2s' }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#3A241A', fontSize: 14 }}>#{o.id}</div>
                      <div style={{ fontSize: 12, color: 'rgba(58,36,26,0.45)', marginTop: 2 }}>{new Date(o.date).toLocaleDateString()} · {o.items.length} item{o.items.length !== 1 ? 's' : ''} · ₹{o.total}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#eab704' }}>{o.status}</span>
                  </div>
                  {expandedId === o.id && <div style={{ marginTop: 8 }}><OrderDetail order={o} /></div>}
                </div>
              ))}
            </div>
          )}

          <div id="track-result">
            {order === undefined && inputId ? (
              <p style={{ textAlign: 'center', color: 'rgba(58,36,26,0.45)', marginTop: 32 }}>
                No order found with that ID. Please check and try again.
              </p>
            ) : order ? (
              <OrderDetail order={order} />
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}>Loading...</div>}>
      <TrackContent />
    </Suspense>
  );
}