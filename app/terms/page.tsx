import Link from 'next/link';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const metadata = {
  title: 'Terms & Conditions – Bahja',
  description: 'Terms and conditions for using Bahja website and services.',
};

export default function TermsPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Terms & Conditions', href: '/terms' }]} />
      <div className="page-header">
        <div className="container">
          <h1>Terms &amp; Conditions</h1>
          <p>Please read before placing an order</p>
        </div>
      </div>

      <section className="legal">
        <div className="container">
          <h2>General</h2>
          <p>By placing an order on Bahja, you agree to the following terms and conditions. These terms govern your use of our website and the purchase of our products.</p>

          <h2>Product Information</h2>
          <p>All product descriptions, images, and pricing are accurate to the best of our knowledge. However, actual product colour and appearance may vary slightly due to the natural nature of honey. We reserve the right to modify product details without prior notice.</p>

          <h2>Pricing &amp; Payments</h2>
          <p>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes. We currently offer Cash on Delivery (COD) as our primary payment method. Additional payment options may be added in the future.</p>

          <h2>Order Acceptance</h2>
          <p>We reserve the right to refuse or cancel any order at our discretion. In the unlikely event that we are unable to fulfil your order, we will notify you promptly and issue a full refund for any amount collected.</p>

          <h2>Shipping &amp; Delivery</h2>
          <p>We ship to all locations within India. Orders are typically processed within 1-2 business days and delivered within 3-7 business days depending on the destination. Free shipping is available on orders above ₹400. Shipping charges for orders below ₹400 are ₹49.</p>

          <h2>Intellectual Property</h2>
          <p>All content on this website — including text, images, logos, and product photography — is the intellectual property of Bahja and may not be reproduced without written permission.</p>

          <h2>Limitation of Liability</h2>
          <p>Bahja shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our total liability shall not exceed the amount paid by you for the product in question.</p>

          <h2>Governing Law</h2>
          <p>These terms are governed by the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Malappuram, Kerala.</p>

          <h2>Updates</h2>
          <p>We may update these terms from time to time. Changes will be posted on this page with an updated effective date. Continued use of our website after changes constitutes acceptance of the new terms.</p>
        </div>
      </section>
    </>
  );
}
