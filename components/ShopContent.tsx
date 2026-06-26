'use client'

import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import ProductSchema from './ProductSchema'

export default function ShopContent() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        setProducts(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="products section">
        <div className="container" style={{ textAlign: 'center', padding: 60, color: 'rgba(58,36,26,0.4)' }}>
          Loading products…
        </div>
      </section>
    )
  }

  return (
    <>
      {products.filter((p) => p.active).map((p) => (
        <ProductSchema key={p.id} product={p} />
      ))}
      <section className="products section">
        <div className="container">
          <div className="section-top">
            <div className="dash"></div>
            <h2>Our Range</h2>
            <p>Choose your honey, pick a size &amp; quantity, add to cart</p>
          </div>
          <div className="product-grid">
            {products.filter((p) => p.active).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
