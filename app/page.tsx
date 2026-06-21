import { PRODUCTS } from '@/lib/data';
import HeroSection from '@/components/HeroSection';
import TrustStrip from '@/components/TrustStrip';
import DripSeparator from '@/components/DripSeparator';
import PromiseCards from '@/components/PromiseCards';
import ProductCard from '@/components/ProductCard';
import GiftSection from '@/components/GiftSection';
import ProcessSection from '@/components/ProcessSection';
import ImpactSection from '@/components/ImpactSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <TrustStrip />

      <DripSeparator bgColor="#fff" />

      <PromiseCards />

      <section className="products" id="products">
        <div className="container">
          <div className="section-top">
            <h2>Our Range</h2>
            <a href="/shop">Shop All →</a>
          </div>
          <div className="product-grid">
            {Object.values(PRODUCTS).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <GiftSection />

      <ProcessSection />

      <DripSeparator bgColor="#eab704" />

      <ImpactSection />
    </>
  );
}
