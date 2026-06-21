import { PRODUCTS } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import GiftSection from '@/components/GiftSection';
import ProductSchema from '@/components/ProductSchema';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';


export const metadata = {
  title: 'Shop Pure Honey – Bahja',
  description:
    'Browse Bahja range of pure, raw honey. Premium Wild Honey and Medicinal Stingless Bee Honey available in 250g & 500g.',
};

export default function ShopPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Shop', href: '/shop' }]} />
      {Object.values(PRODUCTS).map((p) => (
        <ProductSchema key={p.id} product={p} />
      ))}

      <div className="page-header">
        <div className="container">
          <h1>All Honey</h1>
          <p>Pure, raw, and direct from our apiaries</p>
        </div>
      </div>

      <section className="products section">
        <div className="container">
          <div className="section-top">
            <div className="dash"></div>
            <h2>Our Range</h2>
            <p>Choose your honey, pick a size &amp; quantity, add to cart</p>
          </div>
          <div className="product-grid">
            {Object.values(PRODUCTS).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <GiftSection />
    </>
  );
}
