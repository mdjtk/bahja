'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getOrderById, getOrderByIdDb, OrderInfo } from '@/lib/store';

function OrderContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [order, setOrder] = useState<OrderInfo | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const local = getOrderById(id);
    if (local) {
      setOrder(local);
    } else {
      getOrderByIdDb(id).then((o) => {
        if (o) setOrder(o);
      });
    }
  }, [id]);

  const copyId = () => {
    if (order) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ padding: '60px 0' }}>
      <div className="container" style={{ maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#3A241A', marginBottom: 8 }}>
            Thank you for your order!
          </h2>
          <p style={{ color: 'rgba(58,36,26,0.55)' }}>
            {order
              ? `Your order ID is ${order.id}. We&rsquo;ll send updates to ${order.phone}.`
              : 'Your order has been placed successfully.'}
          </p>
        </div>

        {order && (
          <div style={{ background: '#f9f6ef', borderRadius: 12, padding: 24, marginBottom: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#3A241A', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Order Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, color: 'rgba(58,36,26,0.6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Order ID</span>
                <span style={{ color: '#3A241A', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  {order.id}
                  <button onClick={copyId} style={{ background: 'none', border: '1px solid rgba(58,36,26,0.15)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: '#8B7355', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment Method</span>
                <span style={{ color: '#3A241A', fontWeight: 500 }}>{order.payment === 'razorpay' ? 'Paid Online (Razorpay)' : 'Cash on Delivery'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Estimate</span>
                <span style={{ color: '#3A241A', fontWeight: 500 }}>3-5 business days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Phone</span>
                <span style={{ color: '#3A241A', fontWeight: 500 }}>{order.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Address</span>
                <span style={{ color: '#3A241A', fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}>{order.address}, {order.city}, {order.state} — {order.pincode}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(58,36,26,0.08)', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: '#3A241A' }}>Total</span>
                <span style={{ fontWeight: 600, color: '#3A241A' }}>₹{order.total}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: '#fef9e7', borderRadius: 12, padding: 20, marginBottom: 24, fontSize: 13, color: 'rgba(58,36,26,0.55)', lineHeight: 1.6 }}>
          <strong style={{ color: '#3A241A' }}>💡 What happens next?</strong>
          <br />
          We&rsquo;ll dispatch your order within 24 hours. You&rsquo;ll receive a tracking ID via WhatsApp once shipped. For any queries, reach out to us on <a href="https://wa.me/918086872603" target="_blank" rel="noopener" style={{ color: '#eab704', textDecoration: 'underline' }}>WhatsApp</a>.
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {order && (
            <Link href={`/track?id=${order.id}`} className="btn btn-outline">Track Order</Link>
          )}
          <Link href="/shop" className="btn btn-primary">Continue Shopping →</Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmedPage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Order Confirmed!</h1>
        </div>
      </div>
      <Suspense fallback={<div style={{ padding: 60, textAlign: 'center' }}>Loading...</div>}>
        <OrderContent />
      </Suspense>
    </>
  );
}