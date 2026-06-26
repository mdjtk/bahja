'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Product } from '@/lib/data'
import { saveCart, CartItem, loadCart, addToCartWithQty } from '@/lib/store'
import { useAuth } from './AuthProvider'
import { toast } from './Toast'

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter()
  const { user } = useAuth()
  const [activeVariant, setActiveVariant] = useState(product.variantOrder[0])

  const variant = product.variants[activeVariant]
  const price = variant?.price ?? 0
  const oldPrice = variant?.oldPrice ?? null

  const handleAdd = () => {
    const cart = addToCartWithQty(loadCart(), product.id, activeVariant, 1)
    saveCart(cart)
    window.dispatchEvent(new Event('cart-update'))
    toast(`Added ${product.name}!`)
  }

  const handleBuyNow = () => {
    if (!user) {
      const cart = addToCartWithQty(loadCart(), product.id, activeVariant, 1)
      saveCart(cart)
      window.dispatchEvent(new Event('cart-update'))
      router.push('/auth/login?redirect=/checkout')
      return
    }
    const cart = addToCartWithQty(loadCart(), product.id, activeVariant, 1)
    saveCart(cart)
    window.dispatchEvent(new Event('cart-update'))
    router.push('/checkout')
  }

  return (
    <div className="product-card">
      <div className="img-wrap">
        <div className="img-frame">
          <img src={product.image} alt={product.name} />
          <div className="rating-pill">★ {product.rating}</div>
        </div>
      </div>
      <div className="p-body">
        <div className="p-type">{product.type}</div>
        <h3>{product.name}</h3>
        <p className="p-desc">{product.description}</p>
        <div className="v-row">
          {product.variantOrder.map((v) => (
            <button
              key={v}
              className={`v-btn${activeVariant === v ? ' active' : ''}`}
              onClick={() => setActiveVariant(v)}
            >
              {v}
            </button>
          ))}
        </div>
        <button className="btn-buy-now" onClick={handleBuyNow}>
          Shop Now →
        </button>
        <div className="footer-row">
          <div className="price">
            <span className="cur">₹{price}</span>
            {oldPrice && <span className="old">₹{oldPrice}</span>}
          </div>
          <button className="fab" onClick={handleAdd}>+</button>
        </div>
      </div>
    </div>
  )
}
