'use client';

import { useState } from 'react';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

const faqs = [
  {
    q: 'Is Bahja honey 100% pure?',
    a: 'Yes. Every batch of Bahja honey is third-party lab tested for purity, enzyme activity, and adulteration. We never add sugar, syrup, or any other additives. Our honey is raw, unfiltered, and as natural as it gets.',
  },
  {
    q: "What's the difference between Wild Honey and Stingless Bee Honey?",
    a: 'Wild Honey is sourced from traditional honeybee colonies in forest areas — rich in enzymes, pollen, and has a robust sweet taste. Stingless Bee Honey (Cheruthen) is a rare variety from tiny stingless bees, known for its medicinal properties, higher antioxidant levels, and slightly tangy, sour-sweet flavour. Both are 100% pure.',
  },
  {
    q: 'Is my honey raw or processed?',
    a: '100% raw. We never heat our honey above 35°C, which preserves all the natural enzymes, vitamins, and antioxidants. Most commercial honey is heated to 70°C+ for easier filtering — we don\'t do that.',
  },
  {
    q: 'How should I store my honey?',
    a: 'Store in a cool, dry place away from direct sunlight. Honey naturally crystallizes over time — this is a sign of purity, not spoilage. To liquefy, place the jar in warm water (not boiling). Do not microwave.',
  },
  {
    q: 'What are your delivery charges?',
    a: 'We offer free delivery on all orders above ₹400. For orders below ₹400, a flat ₹49 shipping fee applies. We ship PAN India via trusted courier partners.',
  },
  {
    q: 'What is your return policy?',
    a: 'If your order arrives damaged or defective, we offer a full refund or replacement within 7 days of delivery. Since honey is a food product, we cannot accept returns for change of mind. Contact us on WhatsApp with your order ID and we\'ll resolve it immediately.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Orders are dispatched within 24 hours. Delivery typically takes 3-5 business days across India. You\'ll receive a tracking ID once your order is shipped.',
  },
  {
    q: 'Do you offer bulk orders for businesses?',
    a: 'Yes! We supply honey for corporate gifting, hotels, cafes, and resellers. Contact us through our contact page or WhatsApp for bulk pricing.',
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIdx(openIdx === i ? null : i);

  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'FAQ', href: '/faq' }]} />
      <div className="page-header">
        <div className="container">
          <h1>Frequently Asked Questions</h1>
          <p>Everything you need to know about Bahja honey</p>
        </div>
      </div>

      <div className="faq-section">
        {faqs.map((faq, i) => (
          <div className="faq-item" key={i}>
            <div className="faq-q" onClick={() => toggle(i)}>
              {faq.q}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openIdx === i ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <div className={`faq-a${openIdx === i ? ' open' : ''}`}>
              <p>{faq.a}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
