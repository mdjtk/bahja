'use client';

import { useState, useEffect } from 'react';
import { loadWishlist } from '@/lib/store';
import ProductCard from '@/components/ProductCard';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export default function WishlistPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [productMap, setProductMap] = useState<Record<string, any>>({});

  useEffect(() => {
    document.title = 'Wishlist – Bahja';
    setIds(loadWishlist());
    const handle = () => setIds(loadWishlist());
    window.addEventListener('wishlist-update', handle);

    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, any> = {};
        (Array.isArray(data) ? data : []).forEach((p: any) => { map[p.id] = p; });
        setProductMap(map);
      })
      .catch(() => {});

    return () => window.removeEventListener('wishlist-update', handle);
  }, []);

  const products = ids.map((id) => productMap[id]).filter(Boolean);

  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Wishlist', href: '/wishlist' }]} />
      <div className="page-header">
        <div className="container">
          <h1>Wishlist</h1>
          <p>Products you love</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', opacity: 0.6 }}>Your wishlist is empty.</div>
          ) : (
            <div className="product-grid">
              {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
