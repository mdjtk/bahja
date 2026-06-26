'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { loadCart, saveCart, placeOrderDb, CartItem } from '@/lib/store'
import { useAuth } from '@/components/AuthProvider'
import { toast } from '@/components/Toast'

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [payment, setPayment] = useState('cod')
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [products, setProducts] = useState<any[]>([])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login?redirect=/checkout')
      return
    }
    const c = loadCart()
    setCart(c)
    setLoaded(true)

    if (user.user_metadata?.full_name) setName(user.user_metadata.full_name)
    else if (user.user_metadata?.name) setName(user.user_metadata.name)
    if (user.phone) setPhone(user.phone)
    if (user.email && !email) setEmail(user.email)

    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {})
  }, [user, authLoading, router])

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((p: any) => p.id === item.id)
    const price = product?.variants[item.variant]?.price ?? 0
    return sum + price * item.qty
  }, 0)
  const shipping = subtotal >= 400 ? 0 : 49
  const total = subtotal + shipping

  const handleRazorpayPayment = async () => {
    setProcessing(true)
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total, receipt: 'bhj_' + Date.now() }),
      })
      if (!res.ok) throw new Error('Failed to create order')
      const order = await res.json()

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        toast('Failed to load payment gateway')
        setProcessing(false)
        return
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Bahja Pure Honey',
        description: 'Honey Purchase',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const orderData = await placeOrderDb({
              name, phone, email, address, city, state, pincode,
              payment: 'razorpay',
              cart, total,
              razorpayPaymentId: response.razorpay_payment_id,
            })
            saveCart([])
            window.dispatchEvent(new Event('cart-update'))
            router.push(`/order-confirmed?id=${orderData.id}`)
          } catch {
            toast('Failed to save order. Please contact us.')
            setProcessing(false)
          }
        },
        prefill: { name, email, contact: phone },
        theme: { color: '#eab704' },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function () {
        toast('Payment failed. Please try again.')
        setProcessing(false)
      })
      rzp.open()
    } catch {
      toast('Something went wrong. Please try again.')
      setProcessing(false)
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (cart.length === 0) { errs.cart = 'Your cart is empty!' }
    if (!phone || !/^\d{10}$/.test(phone)) errs.phone = 'Enter a valid 10-digit phone number'
    if (!pincode || !/^\d{6}$/.test(pincode)) errs.pincode = 'Enter a valid 6-digit pincode'
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    if (processing) return
    setProcessing(true)
    if (payment === 'razorpay') {
      await handleRazorpayPayment()
    } else {
      try {
        const order = await placeOrderDb({ name, phone, email, address, city, state, pincode, payment: 'cod', cart, total })
        saveCart([])
        window.dispatchEvent(new Event('cart-update'))
        router.push(`/order-confirmed?id=${order.id}`)
      } catch {
        toast('Failed to place order. Please try again.')
        setProcessing(false)
      }
    }
  }

  if (authLoading || !loaded) return null

  if (cart.length === 0) {
    return (
      <div className="page-header">
        <div className="container">
          <h1>Checkout</h1>
          <p style={{ color: 'rgba(58,36,26,0.45)' }}>Your cart is empty. <a href="/shop" style={{ color: '#eab704' }}>Shop now →</a></p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <div className="contact-grid">
            <div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="c-name">Full Name *</label>
                  <input id="c-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="c-email">Email</label>
                  <input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label htmlFor="c-address">Shipping Address *</label>
                  <textarea id="c-address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="c-city">City *</label>
                    <input id="c-city" type="text" value={city} onChange={(e) => setCity(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="c-state">State *</label>
                    <input id="c-state" type="text" value={state} onChange={(e) => setState(e.target.value)} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="c-pincode">Pincode *</label>
                    <input id="c-pincode" type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                    {errors.pincode && <span style={{ fontSize: 11, color: '#d32f2f', marginTop: 4, display: 'block' }}>{errors.pincode}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="c-phone">Phone *</label>
                    <input id="c-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    {errors.phone && <span style={{ fontSize: 11, color: '#d32f2f', marginTop: 4, display: 'block' }}>{errors.phone}</span>}
                  </div>
                </div>
                {errors.email && <span style={{ fontSize: 11, color: '#d32f2f', marginTop: 4, display: 'block' }}>{errors.email}</span>}

                <div className="form-group">
                  <label>Payment Method</label>
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: payment === 'cod' ? '2px solid #eab704' : '1px solid rgba(58,36,26,0.1)', borderRadius: 8, cursor: 'pointer', background: payment === 'cod' ? '#fdf6ec' : '#fff' }}>
                      <input type="radio" name="payment" value="cod" checked={payment === 'cod'} onChange={(e) => setPayment(e.target.value)} />
                      Cash on Delivery
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', border: payment === 'razorpay' ? '2px solid #eab704' : '1px solid rgba(58,36,26,0.1)', borderRadius: 8, cursor: 'pointer', background: payment === 'razorpay' ? '#fdf6ec' : '#fff' }}>
                      <input type="radio" name="payment" value="razorpay" checked={payment === 'razorpay'} onChange={(e) => setPayment(e.target.value)} />
                      Pay Online <span style={{ fontSize: 11, color: 'rgba(58,36,26,0.3)' }}>(UPI • Card • Netbanking)</span>
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" disabled={processing}>
                  {processing ? 'Processing…' : (payment === 'razorpay' ? 'Pay ₹' + total + ' →' : 'Place Order →')}
                </button>
              </form>
            </div>
            <div>
              <div style={{ position: 'sticky', top: 100 }}>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#3A241A', marginBottom: 20, letterSpacing: 0.3 }}>Order Summary</h3>
                <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(58,36,26,0.06)', overflow: 'hidden' }}>
                  <div style={{ padding: '18px 20px' }}>
                    {cart.map((item) => {
                      const product = products.find((p: any) => p.id === item.id)
                      const price = product?.variants[item.variant]?.price ?? 0
                      return (
                        <div key={`${item.id}-${item.variant}`} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(58,36,26,0.04)' }}>
                          <div style={{ width: 52, height: 52, borderRadius: 8, background: '#f9f6ef', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                            <img src={product?.image || ''} alt={product?.name || ''} style={{ width: 44, height: 44, objectFit: 'contain' }} />
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#3A241A', lineHeight: 1.3 }}>{product?.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 500, color: '#8B7355', background: '#f5f0e8', padding: '2px 8px', borderRadius: 4 }}>{item.variant}</span>
                              <span style={{ fontSize: 12, color: 'rgba(58,36,26,0.4)' }}>Qty: {item.qty}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#3A241A', display: 'flex', alignItems: 'center' }}>₹{price * item.qty}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(58,36,26,0.06)', background: '#faf8f5' }}>
                    <div className="cs-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'rgba(58,36,26,0.55)', marginBottom: 8 }}><span>Subtotal</span><span style={{ color: '#3A241A' }}>₹{subtotal}</span></div>
                    <div className="cs-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'rgba(58,36,26,0.55)', marginBottom: 8 }}><span>Shipping</span><span style={{ color: shipping === 0 ? '#2e7d32' : '#3A241A', fontWeight: shipping === 0 ? 600 : 400 }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                    {subtotal < 400 && (
                      <div style={{ fontSize: 11, color: '#8B7355', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#eab704" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                        Add ₹{400 - subtotal} more for free shipping
                      </div>
                    )}
                    <div className="cs-row cs-total" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, color: '#3A241A', paddingTop: 10, borderTop: '1px solid rgba(58,36,26,0.08)' }}><span>Total</span><span>₹{total}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
