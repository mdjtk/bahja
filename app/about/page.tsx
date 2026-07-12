import type { Metadata } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import DripSeparator from '@/components/DripSeparator';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Bahja brings you pure, raw honey from the forests of Gujarat. Learn about our journey, our bees, and our commitment to quality.',
  alternates: {
    canonical: 'https://bahjahoney.com/about',
  },
  openGraph: {
    title: 'About Us | Bahja Pure Honey',
    description: 'Bahja brings you pure, raw honey from the forests of Gujarat. Learn about our journey, our bees, and our commitment to quality.',
  },
}

export default function AboutPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'About', href: '/about' }]} />
      <div className="page-header">
        <div className="container">
          <h1>Our Story</h1>
          <p>From the heart of Gujarat&apos;s forests to your table</p>
        </div>
      </div>

      <DripSeparator />

      <section className="section">
        <div className="container">
          <div className="content-area">
            <h2>The Bahja Promise</h2>
            <p>At Bahja, we believe that honey should be exactly as nature intended — raw, unprocessed, and pure. Our journey began in the forests of Gujarat, where indigenous bee species have thrived for centuries.</p>
            <p>We work directly with local beekeepers who follow traditional methods passed down through generations. No heat treatment, no fine filtering, no additives. Just pure honey, straight from the hive.</p>
            <h2>Our Mission</h2>
            <p>To bring the purest, most nutritious honey to every Indian household while supporting sustainable beekeeping practices and local communities.</p>
          </div>
        </div>
      </section>
    </>
  );
}
