import type { Metadata } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import FaqSchema from '@/components/FaqSchema';
import { faqs } from '@/lib/faq-data';
import FaqContent from './faq-content';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description: 'Find answers about Bahja pure honey — purity, raw vs processed, delivery charges, return policy, storage tips, bulk orders, and more.',
  alternates: {
    canonical: 'https://bahjahoney.com/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions | Bahja Pure Honey',
    description: 'Find answers about Bahja pure honey — purity, raw vs processed, delivery charges, return policy, storage tips, bulk orders, and more.',
  },
};

export default function FAQPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'FAQ', href: '/faq' }]} />
      <FaqSchema faqs={faqs} />
      <div className="page-header">
        <div className="container">
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about Bahja honey</p>
        </div>
      </div>
      <FaqContent />
    </>
  );
}
