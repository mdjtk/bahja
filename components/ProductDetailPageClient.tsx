'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/data'
import ProductDetailClient from '@/components/ProductDetail'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import ProductSchema from '@/components/ProductSchema'
import DripSeparator from '@/components/DripSeparator'
import GiftSection from '@/components/GiftSection'
import ProductCard from '@/components/ProductCard'

export default function ProductDetailPageClient({ slugPromise }: { slugPromise: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null | undefined>(undefined)
  const [allProducts, setAllProducts] = useState<Product[]>([])

  useEffect(() => {
    slugPromise.then(({ slug }) => {
      fetch('/api/products')
        .then((r) => r.json())
        .then((data: Product[]) => {
          const found = data.find((p) => p.slug === slug)
          setProduct(found ?? null)
          setAllProducts(data)
        })
        .catch(() => setProduct(null))
    })
  }, [slugPromise])

  if (product === undefined) {
    return (
      <div style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: 13, color: 'rgba(58,36,26,0.3)', letterSpacing: 2 }}>LOADING</div>
        </div>
      </div>
    )
  }

  if (product === null) {
    return (
      <div style={{ padding: '120px 0', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: 80, color: '#eab704', marginBottom: 8, lineHeight: 1 }}>404</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#3A241A', marginBottom: 8 }}>
            Product Not Found
          </h1>
          <p style={{ color: 'rgba(58,36,26,0.45)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
            Could not find this product. It may have been removed or the link is incorrect.
          </p>
          <button className="btn btn-primary" onClick={() => router.push('/')}>
            Back to Home →
          </button>
        </div>
      </div>
    )
  }

  const related = allProducts.filter((p) => p.id !== product.id)

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', href: '/' },
        { name: 'Shop', href: '/shop' },
        { name: product.name, href: `/shop/${product.slug}` },
      ]} />
      <ProductSchema product={product} />
      <ProductDetailClient product={product} />
      {related.length > 0 && (
        <>
          <DripSeparator bgColor="#fff" />
          <section className="products section">
            <div className="container">
              <div className="section-top">
                <h2>You May Also Like</h2>
              </div>
              <div className="product-grid">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
      <GiftSection />
    </>
  )
}
