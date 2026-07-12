'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Product } from '@/lib/data'
import { saveCart, loadCart, addToCartWithQty } from '@/lib/store'
import { useAuth } from './AuthProvider'
import { toast } from './Toast'

const accordionSections = [
  { id: 'description', title: 'Description' },
  { id: 'nutrition', title: 'Nutrition' },
  { id: 'ingredients', title: 'Ingredients' },
  { id: 'benefits', title: 'Benefits' },
  { id: 'storage', title: 'Storage Instructions' },
  { id: 'shipping', title: 'Shipping Information' },
  { id: 'faq', title: 'FAQs' },
]

const floatingCards = [
  { text: 'Trending today', emoji: '✨' },
]

function getAccordionContent(product: Product, sectionId: string): string {
  switch (sectionId) {
    case 'description':
      return product.description || 'Premium quality honey sourced directly from traditional beekeepers.'
    case 'nutrition':
      return 'Serving Size: 1 tbsp (21g). Calories: 60, Total Fat: 0g, Sodium: 0mg, Total Carbohydrates: 17g, Sugars: 17g, Protein: 0g. Not a significant source of other nutrients.'
    case 'ingredients':
      return '100% Pure Raw Honey. No preservatives, no additives, no artificial flavours.'
    case 'benefits':
      return 'Rich in antioxidants and enzymes. Supports immune system. Natural energy source. Soothes sore throats. Contains antibacterial properties.'
    case 'storage':
      return 'Store in a cool, dry place away from direct sunlight. No refrigeration needed. Honey naturally crystallizes over time — place the jar in warm water and stir to restore liquid consistency.'
    case 'shipping':
      return 'Free shipping on orders above \u20B9400. Orders are dispatched within 24 hours. Delivery typically takes 3\u20137 business days across India.'
    case 'faq':
      return 'Q: Is this safe for children? A: Honey is not recommended for infants under 12 months. For children above 1 year, it is safe.\n\nQ: Why does honey crystallize? A: Crystallization is natural for raw honey. Place jar in warm water to restore liquid.\n\nQ: Is this different from supermarket honey? A: Yes \u2014 our honey is raw, cold-extracted, and never heated above natural hive temperatures.'
    default:
      return ''
  }
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter()
  const { user } = useAuth()
  const [activeVariant, setActiveVariant] = useState(product.variantOrder[0])
  const [qty, setQty] = useState(1)
  const [showSticky, setShowSticky] = useState(false)
  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set(['description']))
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const galleryImages = [product.image, product.image, product.image]
  const ctaRef = useRef<HTMLDivElement>(null)

  const variant = product.variants[activeVariant]
  const price = variant?.price ?? 0
  const oldPrice = variant?.oldPrice ?? null
  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0

  useEffect(() => { setQty(1) }, [activeVariant])

  useEffect(() => {
    const handleScroll = () => {
      if (!ctaRef.current) return
      const rect = ctaRef.current.getBoundingClientRect()
      setShowSticky(rect.bottom < 0)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleAccordion = (id: string) => {
    setOpenAccordions(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const handleAdd = () => {
    const cart = addToCartWithQty(loadCart(), product.id, activeVariant, qty)
    saveCart(cart)
    window.dispatchEvent(new Event('cart-update'))
    toast(`Added ${product.name} to cart!`)
  }

  const handleWishlist = () => {
    toast('Added to wishlist!')
  }

  return (
    <>
      <div className="pd-wrap">
        {/* ── Left: Product Info ── */}
        <div className="pd-info">
          <div className="pd-info-bread">Home / Shop / {product.name}</div>
          <span className="pd-info-type">{product.type}</span>
          <h1 className="pd-info-name">{product.name}</h1>

          <div className="pd-info-price">
            <span className="pd-info-current">₹{price}</span>
            {oldPrice && (
              <>
                <span className="pd-info-old">₹{oldPrice}</span>
                <span className="pd-info-save">Save {discount}%</span>
              </>
            )}
          </div>

          <p className="pd-info-desc">{product.description}</p>

          <div className="pd-info-variants">
            <div className="pd-info-variant-label">Size</div>
            <div className="pd-info-variant-list">
              {product.variantOrder.map((v) => {
                const vp = product.variants[v]?.price ?? 0
                const isActive = activeVariant === v
                return (
                  <button key={v} onClick={() => setActiveVariant(v)}
                    className={`pd-info-variant-btn${isActive ? ' active' : ''}`}
                  >
                    <span className="pd-info-variant-size">{v}</span>
                    <span className="pd-info-variant-price">₹{vp}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div ref={ctaRef} className="pd-info-cta-row">
            <div className="pd-info-qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="pd-info-qty-btn">−</button>
              <span className="pd-info-qty-val">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="pd-info-qty-btn">+</button>
            </div>
            <button onClick={handleAdd} className="pd-info-atc">Add to Cart — ₹{price * qty}</button>
            <button onClick={handleWishlist} className="pd-info-wish" aria-label="Add to wishlist">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>

          <div className="pd-info-badges">
            <span>Free shipping over ₹400</span>
            <span>Secure checkout</span>
            <span>Easy returns</span>
          </div>
        </div>

        {/* ── Center: Product Showcase ── */}
        <div className="pd-showcase">
          <div className="pd-showcase-bg" />
          <div className="pd-showcase-main">
            <img src={galleryImages[currentImageIndex]} alt={product.name} className="pd-showcase-img" />
          </div>
          <div className="pd-showcase-dots">
            {galleryImages.map((_, i) => (
              <button key={i} onClick={() => goToImage(i)}
                className={`pd-showcase-dot${i === currentImageIndex ? ' active' : ''}`}
                aria-label={`View image ${i + 1}`}
              />
            ))}
          </div>
          <button className="pd-showcase-prev" onClick={() => goToImage(currentImageIndex === 0 ? galleryImages.length - 1 : currentImageIndex - 1)} aria-label="Previous image">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="pd-showcase-next" onClick={() => goToImage((currentImageIndex + 1) % galleryImages.length)} aria-label="Next image">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          <div className="pd-floating-cards">
            {floatingCards.map((card, i) => (
              <div key={i} className="pd-floating-card" style={{ animationDelay: `${i * 3}s` }}>
                <span>{card.emoji}</span>
                <span>{card.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Accordion Panel ── */}
        <div className="pd-panel">
          {accordionSections.map((section) => {
            const isOpen = openAccordions.has(section.id)
            const content = getAccordionContent(product, section.id)
            return (
              <div key={section.id} className={`pd-panel-item${isOpen ? ' open' : ''}`}>
                <button className="pd-panel-title" onClick={() => toggleAccordion(section.id)}>
                  {section.title}
                  <svg className="pd-panel-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div className={`pd-panel-body${isOpen ? ' open' : ''}`}>
                  <div className="pd-panel-content">{content}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showSticky && (
        <div className="pd-sticky-bar">
          <img src={product.image} alt="" className="pd-sticky-img" />
          <div className="pd-sticky-info">
            <div className="pd-sticky-name">{product.name}</div>
            <div className="pd-sticky-price">₹{price * qty}</div>
          </div>
          <div className="pd-sticky-qty">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="pd-sticky-qty-btn">−</button>
            <span className="pd-sticky-qty-val">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="pd-sticky-qty-btn">+</button>
          </div>
          <button onClick={handleAdd} className="pd-sticky-atc">Add to Cart</button>
        </div>
      )}
    </>
  )
}
