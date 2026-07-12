'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getOrderById, getOrderByIdDb, OrderInfo } from '@/lib/store';

const WHATSAPP_NUMBER = '918086872603';

function buildWhatsAppMessage(order: OrderInfo): string {
  const lines: string[] = [
    'Hello Bahja Team,',
    '',
    'I have successfully placed an order.',
    '',
    `Order ID: ${order.id}`,
    '',
    'Customer:',
    `Name: ${order.name}`,
    `Phone: ${order.phone}`,
    '',
    'Order Details:',
  ];

  if (order.items && order.items.length > 0) {
    for (const item of order.items) {
      const name = item.name || item.id;
      const variant = item.variant ? ` (${item.variant})` : '';
      lines.push(`\u2022 ${name}${variant} \u00D7 ${item.qty}`);
    }
  }

  lines.push('');
  lines.push(`Total: \u20B9${order.total ?? 0}`);

  if (order.payment) {
    const method = order.payment === 'razorpay' ? 'Paid Online (Razorpay)' : 'Cash on Delivery';
    lines.push(`Payment Method: ${method}`);
  }

  if (order.address) {
    lines.push('');
    lines.push('Delivery Address:');
    lines.push(order.address);
    if (order.city) lines.push(order.city);
    if (order.state) lines.push(order.state);
    if (order.pincode) lines.push(order.pincode);
  }

  if (order.date) {
    lines.push('');
    lines.push(`Order Time: ${new Date(order.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  }

  lines.push('');
  lines.push('Thank you.');

  return lines.join('\n');
}

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
          <>
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

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(order))}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                width: '100%',
                padding: '14px 24px',
                borderRadius: 12,
                background: '#25D366',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                marginBottom: 20,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Send Order via WhatsApp
            </a>
          </>
        )}

        <div style={{ background: '#fef9e7', borderRadius: 12, padding: 20, marginBottom: 24, fontSize: 13, color: 'rgba(58,36,26,0.55)', lineHeight: 1.6 }}>
          <strong style={{ color: '#3A241A' }}>💡 What happens next?</strong>
          <br />
          We&rsquo;ll dispatch your order within 24 hours. You&rsquo;ll receive a tracking ID via WhatsApp once shipped. For any queries, reach out to us on <a href="https://wa.me/918086872603" target="_blank" rel="noopener noreferrer" style={{ color: '#eab704', textDecoration: 'underline' }}>WhatsApp</a>.
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