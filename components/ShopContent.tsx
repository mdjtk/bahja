'use client'

import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import ProductSchema from './ProductSchema'

export default function ShopContent() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        setProducts(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = products.filter((p) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.type?.toLowerCase().includes(q)
  })

  if (loading) {
    return (
      <section className="products section">
        <div className="container" style={{ textAlign: 'center', padding: 60, color: 'rgba(58,36,26,0.4)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div className="skeleton-shimmer" style={{ width: 200, height: 16, borderRadius: 4 }} />
            <div className="skeleton-shimmer" style={{ width: 140, height: 12, borderRadius: 4 }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24, width: '100%', marginTop: 24 }}>
              {[1,2,3].map((i) => (
                <div key={i} className="skeleton-shimmer" style={{ height: 280, borderRadius: 12 }} />
              ))}
            </div>
          </div>
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
          <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(58,36,26,0.2)" strokeWidth="2" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search honey…"
                style={{
                  width: '100%', padding: '10px 14px 10px 40px', borderRadius: 10, border: '1px solid rgba(58,36,26,0.08)',
                  fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#3A241A', background: '#fff',
                }}
                onFocus={(e) => e.target.style.borderColor = '#C5700A'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(58,36,26,0.08)'}
              />
            </div>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(58,36,26,0.3)', fontSize: 13 }}>
              No products match &quot;{search}&quot;
            </div>
          ) : (
            <div className="product-grid">
              {filtered.filter((p) => p.active).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
