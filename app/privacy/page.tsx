import Link from 'next/link';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const metadata = {
  title: 'Privacy Policy – Bahja',
  description: 'Bahja privacy policy for handling your personal data.',
};

export default function PrivacyPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Privacy Policy', href: '/privacy' }]} />
      <div className="page-header">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p>How we handle your data</p>
        </div>
      </div>

      <section className="legal">
        <div className="container">
          <h2>Information We Collect</h2>
          <p>When you place an order on Bahja, we collect the following information to process and fulfil your order:</p>
          <ul>
            <li>Full name</li>
            <li>Phone number</li>
            <li>Email address</li>
            <li>Shipping address (including city and pincode)</li>
            <li>Order details and purchase history</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information collected solely for the following purposes:</p>
          <ul>
            <li>Processing and delivering your orders</li>
            <li>Communicating order updates via WhatsApp or email</li>
            <li>Improving our products and customer experience</li>
            <li>Sending promotional offers (only with your explicit consent via newsletter signup)</li>
          </ul>

          <h2>Data Protection</h2>
          <p>We implement reasonable security measures to protect your personal information. All data is stored securely and is never shared with third parties for their marketing purposes. We may share necessary information with trusted partners (such as delivery services) solely to fulfil your order.</p>

          <h2>Cookies</h2>
          <p>Our website uses local storage (localStorage) to maintain your shopping cart and order information. This data stays in your browser and is not transmitted to us unless you place an order. We do not use tracking cookies or third-party analytics scripts.</p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Request access to the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Withdraw consent for marketing communications at any time</li>
            <li>Contact us regarding any privacy concerns</li>
          </ul>

          <h2>Contact Us</h2>
          <p>For any privacy-related questions or requests, please reach out to us at <strong>contactbahjahoney@gmail.com</strong> or via WhatsApp at <strong>+91 80868 72603</strong>.</p>
        </div>
      </section>
    </>
  );
}
