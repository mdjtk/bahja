import type { Metadata } from 'next';
import GiftSection from '@/components/GiftSection';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import ShopContent from '@/components/ShopContent';
import { getProducts } from '@/lib/products';

export async function generateMetadata(): Promise<Metadata> {
  const products = await getProducts()
  return {
    title: 'Shop Pure Raw Honey Online',
    description: `Browse ${products.length} varieties of pure, raw honey from Bahja. Wild Honey, Stingless Bee Honey & more. Free shipping on orders above ₹400.`,
    openGraph: {
      title: 'Shop Pure Raw Honey Online | Bahja',
      description: 'Browse pure, raw honey varieties. Wild Honey, Stingless Bee Honey and more.',
    },
  }
}

export default function ShopPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Shop', href: '/shop' }]} />

      <div className="page-header">
        <div className="container">
          <h1>All Honey</h1>
          <p>Pure, raw, and direct from our apiaries</p>
        </div>
      </div>

      <ShopContent />

      <GiftSection />
    </>
  );
}
