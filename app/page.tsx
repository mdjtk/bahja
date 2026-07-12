import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts } from '@/lib/products';
import HeroSection from '@/components/HeroSection';
import TrustStrip from '@/components/TrustStrip';
import DripSeparator from '@/components/DripSeparator';
import DripSeparatorfromBottom from '@/components/DripSeparatorfot';
import PromiseCards from '@/components/PromiseCards';
import ProductCard from '@/components/ProductCard';
import GiftSection from '@/components/GiftSection';
import ProcessSection from '@/components/ProcessSection';
import ImpactSection from '@/components/ImpactSection';

export const metadata: Metadata = {
  title: 'Buy Pure Honey Online | Raw Natural Honey In India – Bahja',
  description: 'Bahja brings you pure, raw honey direct from Kerala beehives. Shop Premium Wild Honey & Medicinal Stingless Bee Honey. 100% pure, no additives. Free shipping above ₹400.',
  alternates: {
    canonical: 'https://bahjahoney.com',
  },
  openGraph: {
    title: 'Buy Pure Honey Online | Raw Natural Honey In India – Bahja',
    description: 'Shop pure, raw honey from Bahja. Premium Wild Honey & Medicinal Stingless Bee Honey. Direct from Kerala beehives. Free shipping above ₹400.',
    url: 'https://bahjahoney.com',
  },
};

export default async function HomePage() {
  const products = await getProducts();

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
            <Link href="/shop">Shop All →</Link>
          </div>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      <GiftSection />

      <ProcessSection />

      <DripSeparatorfromBottom bgColor="#eab704" />

      <ImpactSection />
    </>
  );
}
