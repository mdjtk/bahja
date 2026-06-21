'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadCart, saveCart, updateQty, removeFromCart, addToCart, getAllOrders, CartItem } from '@/lib/store';
import { PRODUCTS } from '@/lib/data';

const COUPONS: Record<string, { discount: number; label: string }> = {
  BAHJA10: { discount: 0.1, label: '10% Off' },
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; label: string } | null>(null);
  const [couponMsg, setCouponMsg] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(loadCart());
    setLoaded(true);
  }, []);

  const refresh = () => {
    const c = loadCart();
    setCart(c);
    window.dispatchEvent(new Event('cart-update'));
  };

  const handleQty = (id: string, variant: string, delta: number) => {
    const existing = cart.find((i) => i.id === id && i.variant === variant);
    if (!existing) return;
    const newQty = existing.qty + delta;
    if (newQty <= 0) {
      saveCart(removeFromCart(cart, id, variant));
    } else {
      saveCart(updateQty(cart, id, variant, delta));
    }
    refresh();
  };

  const handleRemove = (id: string, variant: string) => {
    saveCart(removeFromCart(cart, id, variant));
    refresh();
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon({ code, ...COUPONS[code] });
      setCouponMsg(`Coupon "${code}" applied — ${COUPONS[code].label}!`);
    } else {
      setAppliedCoupon(null);
      setCouponMsg('Invalid coupon code.');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponMsg('');
  };

  const subtotal = cart.reduce((sum, item) => {
    const product = Object.values(PRODUCTS).find((p) => p.id === item.id);
    const price = product?.variants[item.variant]?.price ?? 0;
    return sum + price * item.qty;
  }, 0);
  const discount = appliedCoupon ? subtotal * appliedCoupon.discount : 0;
  const shipping = subtotal >= 400 ? 0 : 49;
  const total = subtotal - discount + shipping;

  if (!loaded) return null;

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Shopping Cart</h1>
          <p>Review your items before checking out</p>
        </div>
      </div>

      <div className="cart-page">
        <div className="container">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6.5 17.5h11l2-13h-15l2 13z"/><circle cx="9" cy="21" r="1"/><circle cx="15" cy="21" r="1"/></svg>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven&rsquo;t added any honey yet.</p>
              <Link href="/shop" className="btn btn-primary">Shop Now →</Link>
            </div>
          ) : (
            <>
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => {
                    const product = Object.values(PRODUCTS).find((p) => p.id === item.id);
                    const price = product?.variants[item.variant]?.price ?? 0;
                    return (
                      <tr key={`${item.id}-${item.variant}`}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {product && <img src={product.image} alt={product.name} className="cart-item-img" />}
                            <div>
                              <div className="cart-item-name">{product?.name}</div>
                              <div className="cart-item-variant">{item.variant}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="cart-item-price">₹{price}</span></td>
                        <td>
                          <div className="qty-ctl">
                            <button onClick={() => handleQty(item.id, item.variant, -1)}>−</button>
                            <span className="qty-num">{item.qty}</span>
                            <button onClick={() => handleQty(item.id, item.variant, 1)}>+</button>
                          </div>
                        </td>
                        <td><span className="cart-item-price">₹{price * item.qty}</span></td>
                        <td><button className="cart-remove" onClick={() => handleRemove(item.id, item.variant)}>✕</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

             

              <div className="prev-orders">
                <h3>Previously Ordered</h3>
                {(() => {
                  const seen = new Set<string>();
                  const items: { id: string; variant: string; name: string; price: number }[] = [];
                  getAllOrders().slice().reverse().forEach((o) =>
                    o.items.forEach((i) => {
                      const key = `${i.id}-${i.variant}`;
                      if (!seen.has(key)) { seen.add(key); items.push(i); }
                    })
                  );
                  if (items.length === 0) return <p style={{ fontSize: 13, color: 'rgba(58,36,26,0.45)' }}>No previous orders yet.</p>;
                  return (
                    <div className="prev-grid">
                      {items.map((i) => {
                        const inCart = cart.some((c) => c.id === i.id && c.variant === i.variant);
                        return (
                          <div key={`${i.id}-${i.variant}`} className="prev-item">
                            <div>
                              <div className="prev-name">{i.name}</div>
                              <div className="prev-variant">{i.variant} — ₹{i.price}</div>
                            </div>
                            <button
                              className="btn btn-sm"
                              disabled={inCart}
                              onClick={() => {
                                saveCart(addToCart(cart, i.id, i.variant));
                                refresh();
                              }}
                            >{inCart ? 'Added ✓' : 'Re-order'}</button>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              <div className="cart-summary">
                <div className="coupon-row">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button onClick={applyCoupon}>Apply</button>
                </div>
                {couponMsg && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13 }}>
                    <span style={{ color: appliedCoupon ? '#22c55e' : '#ef4444' }}>{couponMsg}</span>
                    {appliedCoupon && (
                        <button onClick={removeCoupon} style={{ fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Remove</button>
                    )}
                  </div>
                )}
                <div className="sr"><span>Subtotal</span><span>₹{subtotal}</span></div>
                {discount > 0 && <div className="sr" style={{ color: '#22c55e' }}><span>Discount ({appliedCoupon?.code})</span><span>-₹{discount}</span></div>}
                <div className="sr"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                <div className="sr total"><span>Total</span><span>₹{total}</span></div>
                <Link href="/checkout" className="btn btn-primary">Proceed to Checkout →</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
