'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

  const productUrl = `/shop/${encodeURIComponent(product.slug)}`

  return (
    <div className="product-card">
      <Link href={productUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="img-wrap">
          <div className="img-frame">
            <img src={product.image} alt={product.name} />
            <div className="rating-pill">★ {product.rating}</div>
          </div>
        </div>
      </Link>
      <div className="p-body">
        <Link href={productUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="p-type">{product.type}</div>
          <h3>{product.name}</h3>
          <p className="p-desc">{product.description}</p>
        </Link>
        <div className="v-row" onClick={(e) => e.stopPropagation()}>
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
        <button className="btn-buy-now" onClick={(e) => { e.stopPropagation(); handleBuyNow(); }}>
          Shop Now →
        </button>
        <div className="footer-row">
          <div className="price">
            <span className="cur">₹{price}</span>
            {oldPrice && <span className="old">₹{oldPrice}</span>}
          </div>
          <Link href={productUrl} style={{ textDecoration: 'none' }}>
            <button className="btn-view-details" onClick={(e) => e.stopPropagation()}>
              View Details
            </button>
          </Link>
          <button className="fab" onClick={(e) => { e.stopPropagation(); handleAdd(); }}>+</button>
        </div>
      </div>
    </div>
  )
}