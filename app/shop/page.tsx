import GiftSection from '@/components/GiftSection';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import ShopContent from '@/components/ShopContent';

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
