'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { CartItem, removeFromCart, updateQty, SHIPPING_THRESHOLD, SHIPPING_FEE } from '@/lib/store';
import { PRODUCTS, getCartItemTotal } from '@/lib/data';

export default function CartDrawer({
  open,
  cart,
  onClose,
  onUpdate,
}: {
  open: boolean;
  cart: CartItem[];
  onClose: () => void;
  onUpdate: (cart: CartItem[]) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onClose]);

  const subtotal = cart.reduce((sum, item) => sum + getCartItemTotal(PRODUCTS[item.id], item.variant, item.qty), 0);
  const free = subtotal >= SHIPPING_THRESHOLD;

  return (
    <>
      <div className={`drawer-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <div className={`cart-drawer${open ? ' open' : ''}`} ref={ref}>
        <div className="drawer-header">
          <h3>Cart ({cart.length})</h3>
          <button className="drawer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="drawer-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <p>Your cart is empty</p>
            </div>
          ) : (
            <ul className="drawer-items">
              {cart.map((item) => {
                const product = PRODUCTS[item.id];
                const variant = product?.variants[item.variant];
                if (!product || !variant) return null;
                return (
                  <li key={item.id + item.variant} className="drawer-item">
                    <img src={product.image} alt="" className="drawer-item-img" />
                    <div className="drawer-item-info">
                      <div className="drawer-item-name">{product.name}</div>
                      <div className="drawer-item-meta">{variant.label}</div>
                      <div className="drawer-item-qty">
                        <button onClick={() => onUpdate(updateQty(cart, item.id, item.variant, -1))}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => onUpdate(updateQty(cart, item.id, item.variant, 1))}>+</button>
                      </div>
                    </div>
                    <div className="drawer-item-total">
                      <span>₹{variant.price * item.qty}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="drawer-footer">
          <div className="drawer-sr"><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div className="drawer-sr"><span>Shipping</span><span>{free ? 'FREE' : `₹${SHIPPING_FEE}`}</span></div>
          {!free && <div className="drawer-sr" style={{ fontSize: 11, color: '#eab704' }}>Add ₹{SHIPPING_THRESHOLD - subtotal} more for free shipping</div>}
          <div className="drawer-sr drawer-total"><span>Total</span><span>₹{subtotal + (free ? 0 : SHIPPING_FEE)}</span></div>
          <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={onClose}>Checkout →</Link>
          <Link href="/cart" className="drawer-view-cart" onClick={onClose}>View Full Cart</Link>
        </div>
      </div>
    </>
  );
}
