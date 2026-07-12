'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadCart, saveCart, updateQty, removeFromCart, addToCart, getAllOrders, CartItem } from '@/lib/store';
import { useAuth } from '@/components/AuthProvider';

const COUPONS_CACHE_KEY = 'bahja_coupons_cache';
const COUPONS_CACHE_TTL = 5 * 60 * 1000;

interface CouponData {
  code: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  min_order: number;
  max_uses: number;
  current_uses: number;
  active: boolean;
  expires_at: string | null;
}

export default function CartPage() {
  const { user, loading } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [couponMsg, setCouponMsg] = useState('');
  const [couponList, setCouponList] = useState<CouponData[]>([]);
  const [productMap, setProductMap] = useState<Record<string, any>>({});

  useEffect(() => {
    setCart(loadCart());
    setLoaded(true);
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, any> = {};
        (Array.isArray(data) ? data : []).forEach((p: any) => { map[p.id] = p; });
        setProductMap(map);
      })
      .catch(() => {});
    const cached = localStorage.getItem(COUPONS_CACHE_KEY);
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < COUPONS_CACHE_TTL) {
          setCouponList(data);
          return;
        }
      } catch {}
    }
    fetch('/api/coupons')
      .then((r) => r.json())
      .then((data) => {
        const active = (Array.isArray(data) ? data : []).filter((c: CouponData) => c.active);
        setCouponList(active);
        localStorage.setItem(COUPONS_CACHE_KEY, JSON.stringify({ data: active, ts: Date.now() }));
      })
      .catch(() => {});
  }, []);

  const refresh = () => {
    const c = loadCart();
    setCart(c);
    window.dispatchEvent(new Event('cart-update'));
  };

  const handleQty = (id: string, variant: string, delta: number) => {
    const existing = cart.find((i) => i.id === id && i.variant === variant);
    if (!existing) return;
    if (existing.qty + delta <= 0) {
      handleRemove(id, variant);
      return;
    }
    const updated = updateQty(cart, id, variant, delta);
    saveCart(updated);
    setCart(updated);
    window.dispatchEvent(new Event('cart-update'));
  };

  const handleRemove = (id: string, variant: string) => {
    const updated = removeFromCart(cart, id, variant);
    saveCart(updated);
    setCart(updated);
    window.dispatchEvent(new Event('cart-update'));
  };

  const subtotal = cart.reduce((sum, item) => {
    const product = productMap[item.id];
    const price = product?.variants[item.variant]?.price ?? 0;
    return sum + price * item.qty;
  }, 0);

  let discount = 0;
  let discountLabel = '';
  if (appliedCoupon) {
    discount = appliedCoupon.discount;
    discountLabel = appliedCoupon.label;
  }

  const total = subtotal - discount;

  const applyCoupon = () => {
    const code = couponCode.trim();
    if (!code) { setCouponMsg('Enter a coupon code'); return; }
    const coupon = couponList.find((c) => c.code === code.toUpperCase());
    if (!coupon) { setCouponMsg('Invalid coupon code'); return; }
    const now = new Date();
    if (coupon.expires_at && new Date(coupon.expires_at) < now) { setCouponMsg('Coupon has expired'); return; }
    if (coupon.max_uses > 0 && coupon.current_uses >= coupon.max_uses) { setCouponMsg('Coupon usage limit reached'); return; }
    if (subtotal < coupon.min_order) { setCouponMsg(`Minimum order of ₹${coupon.min_order} required`); return; }

    let disc = 0;
    let label = '';
    if (coupon.discount_type === 'percentage') {
      disc = Math.round(subtotal * coupon.discount_value / 100);
      label = `${coupon.discount_value}% off`;
    } else {
      disc = Math.min(coupon.discount_value, subtotal);
      label = `₹${coupon.discount_value} off`;
    }
    setAppliedCoupon({ code: coupon.code, discount: disc, label });
    setCouponMsg(`Coupon applied! ${label}`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMsg('');
  };

  if (loading || !loaded) {
    return (
      <>
        <div className="page-header">
          <div className="container">
            <h1>Shopping Cart</h1>
            <div className="skeleton-shimmer" style={{ height: 16, width: 160, borderRadius: 4, marginTop: 4 }} />
          </div>
        </div>
        <div className="section">
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
              <div>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid rgba(58,36,26,0.06)' }}>
                    <div className="skeleton-shimmer" style={{ width: 56, height: 70, borderRadius: 8, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="skeleton-shimmer" style={{ height: 14, width: '50%', borderRadius: 4, marginBottom: 8 }} />
                      <div className="skeleton-shimmer" style={{ height: 12, width: '30%', borderRadius: 4, marginBottom: 12 }} />
                      <div className="skeleton-shimmer" style={{ height: 12, width: '20%', borderRadius: 4 }} />
                    </div>
                    <div className="skeleton-shimmer" style={{ width: 60, height: 14, borderRadius: 4, marginTop: 4 }} />
                  </div>
                ))}
              </div>
              <div>
                <div className="cart-summary">
                  <div className="skeleton-shimmer" style={{ height: 18, width: 120, borderRadius: 4, marginBottom: 16 }} />
                  <div className="skeleton-shimmer" style={{ height: 14, width: '100%', borderRadius: 4, marginBottom: 8 }} />
                  <div className="skeleton-shimmer" style={{ height: 14, width: '70%', borderRadius: 4, marginBottom: 16 }} />
                  <div className="skeleton-shimmer" style={{ height: 40, width: '100%', borderRadius: 8 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <div className="page-header">
          <div className="container">
            <h1>Shopping Cart</h1>
          </div>
        </div>
        <div className="section">
          <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'rgba(58,36,26,0.55)', marginBottom: 20 }}>Please sign in to view your cart.</p>
            <Link href="/auth/login?redirect=/cart" className="btn btn-primary">Sign In</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Shopping Cart</h1>
          <p>{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <h2>Your cart is empty</h2>
              <p>Looks like you havent added anything yet.</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/shop" className="btn btn-primary">Shop Now →</Link>
                <Link href="/my-orders" className="btn btn-outline">Previous Orders →</Link>
              </div>
            </div>
          ) : (
            <div className="cart-grid">
              <div>
                <div className="cart-table">
                  {cart.map((item) => {
                    const product = productMap[item.id];
                    const price = product?.variants[item.variant]?.price ?? 0;
                    const totalPrice = price * item.qty;
                    return (
                      <div key={`${item.id}-${item.variant}`} className="cart-row">
                        <Link href={`/shop/${product?.slug || item.id}`} className="cart-item-img">
                          {product?.image ? (
                            <img src={product.image} alt={product?.name} />
                          ) : (
                            <div style={{ width: 56, height: 70, background: '#f5f0e8', borderRadius: 8 }} />
                          )}
                        </Link>
                        <div className="cart-item-info">
                          <Link href={`/shop/${product?.slug || item.id}`} className="cart-item-name">
                            {product?.name || item.id}
                          </Link>
                          <span className="cart-item-variant">{item.variant}</span>
                        </div>
                        <div className="cart-item-price">₹{price}</div>
                        <div className="qty-ctl">
                          <button onClick={() => handleQty(item.id, item.variant, -1)} disabled={item.qty <= 1}>–</button>
                          <span>{item.qty}</span>
                          <button onClick={() => handleQty(item.id, item.variant, 1)}>+</button>
                        </div>
                        <div className="cart-item-total">₹{totalPrice}</div>
                        <button className="cart-item-remove" onClick={() => handleRemove(item.id, item.variant)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
                  <button className="btn btn-outline" onClick={() => { saveCart([]); refresh(); }}>
                    Clear Cart
                  </button>
                  <Link href="/my-orders" className="btn btn-outline" style={{ fontSize: 13 }}>
                    Previous Orders →
                  </Link>
                </div>
              </div>

              <div>
                <div className="cart-summary">
                  <h3>Order Summary</h3>
                  <div className="cs-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                  <div className="cs-row cs-total"><span>Total</span><span>₹{total}</span></div>
                </div>

                <div className="coupon-section" style={{ marginTop: 20 }}>
                  <h4>Have a coupon?</h4>
                  <div className="coupon-row">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <button className="btn btn-outline" onClick={removeCoupon} style={{ padding: '8px 14px', fontSize: 12 }}>Remove</button>
                    ) : (
                      <button className="btn btn-primary" onClick={applyCoupon} style={{ padding: '8px 14px', fontSize: 12 }}>Apply</button>
                    )}
                  </div>
                  {couponMsg && <p className="coupon-msg">{couponMsg}</p>}
                </div>

                <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', marginTop: 20, textAlign: 'center' }}>
                  Proceed to Checkout →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}