'use client'

import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loadCart, saveCart, placeOrderDb, CartItem, getPhoneLocal } from '@/lib/store'
import { useAuth } from '@/components/AuthProvider'
import { toast } from '@/components/Toast'
import { fetchWithAuth } from '@/lib/fetch-with-auth'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

const savePhoneToBackend = async (phone: string) => {
  try {
    const supabase = getSupabaseBrowser()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return
    await fetch('/api/auth/update-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ phone }),
    })
  } catch {}
}

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
  const [savedAddresses, setSavedAddresses] = useState<{ id: string; line: string; city: string; state: string; pincode: string }[]>([])
  const [selectedSaved, setSelectedSaved] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login?redirect=/checkout')
      return
    }
    const c = loadCart()
    setCart(c)
    setLoaded(true)

    const meta = user.user_metadata || {}
    if (meta.full_name || meta.name) setName(meta.full_name || meta.name)
    if (user.phone) setPhone(user.phone.replace(/^\+91/, ''))
    else { const local = getPhoneLocal(); if (local) setPhone(local.replace(/^\+91/, '')) }
    if (user.email && !email) setEmail(user.email)

    const stored = localStorage.getItem('bahja_addresses')
    if (stored) try { setSavedAddresses(JSON.parse(stored)) } catch {}

    fetch('/api/products')
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {})
  }, [user, authLoading, router, email])

  const subtotal = cart.reduce((sum, item) => {
    const product = products.find((p: any) => p.id === item.id)
    const price = product?.variants[item.variant]?.price ?? 0
    return sum + price * item.qty
  }, 0)
  const shipping = subtotal >= 400 ? 0 : 49
  const total = subtotal + shipping

  const handleSelectAddress = (id: string) => {
    setSelectedSaved(id)
    const addr = savedAddresses.find((a) => a.id === id)
    if (addr) {
      setAddress(addr.line)
      setCity(addr.city)
      setState(addr.state)
      setPincode(addr.pincode)
    }
  }

  const handleRazorpayPayment = async () => {
    setProcessing(true)
    try {
      const res = await fetchWithAuth('/api/create-order', {
        method: 'POST',
        body: JSON.stringify({
          items: cart,
          amount: total,
          receipt: 'bhj_' + Date.now(),
        }),
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
            const verifyRes = await fetchWithAuth('/api/verify-payment', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            if (!verifyRes.ok) {
              toast('Payment verification failed. Please contact support.')
              setProcessing(false)
              return
            }
            const productMap = Object.fromEntries(products.map((p: any) => [p.id, p]));
            const orderData = await placeOrderDb({
              name, phone, email, address, city, state, pincode,
              payment: 'razorpay',
              cart, total,
              razorpayPaymentId: response.razorpay_payment_id,
              productsMap: productMap,
            })
            savePhoneToBackend(phone)
            saveCart([])
            window.dispatchEvent(new Event('cart-update'))
            router.push(`/order-confirmed?id=${orderData.id}`)
          } catch (err) {
            console.error('[Checkout] Razorpay placeOrderDb error:', err)
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
    if (!name.trim() || name.trim().length < 2) errs.name = 'Enter your full name'
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
        const productMap = Object.fromEntries(products.map((p: any) => [p.id, p]));
        const order = await placeOrderDb({ name, phone, email, address, city, state, pincode, payment: 'cod', cart, total, productsMap: productMap })
        savePhoneToBackend(phone)
        saveCart([])
        window.dispatchEvent(new Event('cart-update'))
        router.push(`/order-confirmed?id=${order.id}`)
      } catch (err) {
        console.error('[Checkout] placeOrderDb error:', err)
        toast('Failed to place order. Please try again.')
        setProcessing(false)
      }
    }
  }

  if (authLoading || !loaded) {
    return (
      <div className="page-header" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', padding: '40px 0' }}>
            <div className="skeleton-shimmer" style={{ width: '60%', height: 400, borderRadius: 14 }} />
            <div className="skeleton-shimmer" style={{ width: '40%', height: 400, borderRadius: 14 }} />
          </div>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="page-header">
        <div className="container">
          <h1>Checkout</h1>
          <p style={{ color: 'rgba(58,36,26,0.45)' }}>Your cart is empty. <Link href="/shop" style={{ color: '#eab704' }}>Shop now →</Link></p>
        </div>
      </div>
    )
  }

  const S = {
    sectionLabel: { fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' as const, color: 'rgba(58,36,26,0.25)', marginBottom: 10 },
    input: { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(58,36,26,0.08)', fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#3A241A', background: '#fff', transition: 'border-color .2s' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
    error: { fontSize: 11, color: '#d32f2f', marginTop: 4 },
    card: { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(58,36,26,0.04)' },
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>
      </div>

      <div className="section" style={{ paddingTop: 10, paddingBottom: 40 }}>
        <div className="container">
          <form onSubmit={handleSubmit}>
            <div className="chk-grid">

              {/* LEFT — Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Contact */}
                <div>
                  <div style={S.sectionLabel}>Contact</div>
                  <div style={S.card}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="Full name *"
                        style={{ ...S.input, borderColor: errors.name ? '#d32f2f' : 'rgba(58,36,26,0.08)' }}
                        onFocus={(e) => e.target.style.borderColor = '#C5700A'}
                        onBlur={(e) => !errors.name && (e.target.style.borderColor = 'rgba(58,36,26,0.08)')}
                      />
                      {errors.name && <div style={S.error}>{errors.name}</div>}
                      <div style={{ display: 'flex', alignItems: 'center', background: '#f9f9f9', borderRadius: 10, border: '1px solid rgba(58,36,26,0.06)', padding: '0 12px' }}>
                        <span style={{ fontSize: 13, color: '#8B7355', fontWeight: 500, marginRight: 6, whiteSpace: 'nowrap' }}>+91</span>
                        <span style={{ color: 'rgba(58,36,26,0.08)' }}>|</span>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Phone number *"
                          style={{ ...S.input, border: 'none', background: 'transparent', padding: '10px 12px' }}
                          onFocus={(e) => e.target.style.borderColor = 'transparent'}
                        />
                      </div>
                      {errors.phone && <div style={S.error}>{errors.phone}</div>}
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email (optional)"
                        style={S.input}
                        onFocus={(e) => e.target.style.borderColor = '#C5700A'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(58,36,26,0.08)'}
                      />
                      {errors.email && <div style={S.error}>{errors.email}</div>}
                    </div>
                  </div>
                </div>

                {/* Delivery */}
                <div>
                  <div style={S.sectionLabel}>Delivery</div>
                  <div style={S.card}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {savedAddresses.length > 0 && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          {savedAddresses.map((a) => (
                            <button key={a.id} type="button" onClick={() => handleSelectAddress(a.id)}
                              style={{
                                padding: '5px 12px', borderRadius: 8, border: selectedSaved === a.id ? '1.5px solid #C5700A' : '1px solid rgba(58,36,26,0.06)',
                                background: selectedSaved === a.id ? '#fef9e7' : '#fff', fontSize: 11, fontWeight: 500,
                                color: '#3A241A', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
                              }}
                            >{a.line.split(',')[0]}, {a.city}</button>
                          ))}
                        </div>
                      )}
                      <textarea rows={2} value={address} onChange={(e) => { setAddress(e.target.value); setSelectedSaved('') }}
                        placeholder="Address line (house, street, area) *"
                        style={{ ...S.input, resize: 'none', fontFamily: 'inherit' }}
                        onFocus={(e) => e.target.style.borderColor = '#C5700A'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(58,36,26,0.08)'}
                      />
                      <div style={S.row}>
                        <input type="text" value={city} onChange={(e) => { setCity(e.target.value); setSelectedSaved('') }}
                          placeholder="City *"
                          style={S.input}
                          onFocus={(e) => e.target.style.borderColor = '#C5700A'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(58,36,26,0.08)'}
                        />
                        <input type="text" value={state} onChange={(e) => { setState(e.target.value); setSelectedSaved('') }}
                          placeholder="State *"
                          style={S.input}
                          onFocus={(e) => e.target.style.borderColor = '#C5700A'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(58,36,26,0.08)'}
                        />
                      </div>
                      <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Pincode *"
                        style={S.input}
                        onFocus={(e) => e.target.style.borderColor = '#C5700A'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(58,36,26,0.08)'}
                      />
                      {errors.pincode && <div style={S.error}>{errors.pincode}</div>}
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <div style={S.sectionLabel}>Payment</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                      borderRadius: 12, cursor: 'pointer',
                      border: payment === 'cod' ? '1.5px solid #C5700A' : '1px solid rgba(58,36,26,0.06)',
                      background: payment === 'cod' ? '#fef9e7' : '#fff',
                      transition: 'all .15s', fontFamily: 'inherit',
                    }}>
                      <input type="radio" name="payment" value="cod" checked={payment === 'cod'}
                        onChange={(e) => setPayment(e.target.value)}
                        style={{ accentColor: '#C5700A', margin: 0, width: 16, height: 16 }}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#3A241A' }}>Cash on Delivery</div>
                        <div style={{ fontSize: 11, color: 'rgba(58,36,26,0.3)' }}>Pay when delivered</div>
                      </div>
                    </label>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                      borderRadius: 12, cursor: 'pointer',
                      border: payment === 'razorpay' ? '1.5px solid #C5700A' : '1px solid rgba(58,36,26,0.06)',
                      background: payment === 'razorpay' ? '#fef9e7' : '#fff',
                      transition: 'all .15s', fontFamily: 'inherit',
                    }}>
                      <input type="radio" name="payment" value="razorpay" checked={payment === 'razorpay'}
                        onChange={(e) => setPayment(e.target.value)}
                        style={{ accentColor: '#C5700A', margin: 0, width: 16, height: 16 }}
                      />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#3A241A' }}>Pay Online</div>
                        <div style={{ fontSize: 11, color: 'rgba(58,36,26,0.3)' }}>UPI • Card • Netbanking</div>
                      </div>
                    </label>
                  </div>
                </div>

              </div>

              {/* RIGHT — Summary */}
              <div style={{ position: 'sticky', top: 88 }}>
                <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(58,36,26,0.04)', overflow: 'hidden' }}>
                  <div style={{ padding: '18px 20px', borderBottom: '1px solid rgba(58,36,26,0.04)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#3A241A', marginBottom: 14 }}>Order Summary</div>
                    {cart.map((item) => {
                      const product = products.find((p: any) => p.id === item.id)
                      const price = product?.variants[item.variant]?.price ?? 0
                      return (
                        <div key={`${item.id}-${item.variant}`} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(58,36,26,0.03)' }}>
                          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f9f6ef', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                            {product?.image ? <img src={product.image} alt={product.name} style={{ width: 36, height: 36, objectFit: 'contain' }} /> : <div style={{ width: 36, height: 36 }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#3A241A', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product?.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                              <span style={{ fontSize: 10, fontWeight: 500, color: '#8B7355', background: '#f5f0e8', padding: '1px 6px', borderRadius: 3 }}>{item.variant}</span>
                              <span style={{ fontSize: 11, color: 'rgba(58,36,26,0.3)' }}>x{item.qty}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#3A241A', display: 'flex', alignItems: 'center', flexShrink: 0 }}>₹{price * item.qty}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(58,36,26,0.45)', marginBottom: 6 }}>
                      <span>Subtotal</span><span style={{ color: '#3A241A' }}>₹{subtotal}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(58,36,26,0.45)', marginBottom: 6 }}>
                      <span>Shipping</span>
                      <span style={{ color: shipping === 0 ? '#2e7d32' : '#3A241A', fontWeight: shipping === 0 ? 600 : 400 }}>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                    </div>
                    {subtotal < 400 && (
                      <div style={{ fontSize: 10, color: 'rgba(58,36,26,0.3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#C5700A" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                        Add ₹{400 - subtotal} more for free shipping
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, color: '#3A241A', paddingTop: 10, borderTop: '1px solid rgba(58,36,26,0.06)' }}>
                      <span>Total</span><span>₹{total}</span>
                    </div>
                    <button type="submit" disabled={processing}
                      style={{
                        width: '100%', marginTop: 16, padding: '13px 0', border: 'none', borderRadius: 10,
                        background: processing ? 'rgba(197,112,10,0.5)' : '#C5700A', color: '#fff',
                        fontSize: 13, fontWeight: 700, cursor: processing ? 'default' : 'pointer',
                        fontFamily: 'inherit', transition: 'background .2s',
                      }}
                    >{processing ? 'Processing…' : (payment === 'razorpay' ? `Pay ₹${total}` : 'Place Order')}</button>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>
      </div>
    </>
  )
}
