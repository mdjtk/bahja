import type { Metadata } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';
import ContactContent from './contact-content';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Bahja Pure Honey. WhatsApp +91 80868 72603, email contactbahjahoney@gmail.com, or visit us in Kondotty, Kerala.',
  alternates: {
    canonical: 'https://bahjahoney.com/contact',
  },
  openGraph: {
    title: 'Contact Us | Bahja Pure Honey',
    description: 'Get in touch with Bahja Pure Honey. WhatsApp, email, or visit us in Kondotty, Kerala.',
  },
};

export default function ContactPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact' }]} />
      <div className="page-header">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We&rsquo;d love to hear from you</p>
        </div>
      </div>
      <div className="section">
        <div className="container">
          <ContactContent />
        </div>
      </div>
    </>
  );
}
