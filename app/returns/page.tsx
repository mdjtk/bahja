import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const metadata = {
  title: 'Returns & Cancellations – Bahja',
  description: 'Bahja return, cancellation, and refund policy for honey orders.',
};

export default function ReturnsPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Returns', href: '/returns' }]} />
      <div className="page-header">
        <div className="container">
          <h1>Returns &amp; Cancellations</h1>
          <p>Our policies for orders placed on Bahja</p>
        </div>
      </div>

      <section className="legal">
        <div className="container">
          <h2>Returns Policy</h2>
          <p>We take great care in packaging every jar of Bahja honey to ensure it reaches you in perfect condition. However, if you receive a damaged, defective, or incorrect product, we will gladly assist you with a replacement.</p>

          <h2>Eligibility</h2>
          <p>To be eligible for a return or replacement, the following conditions must be met:</p>
          <ul>
            <li>The product must be reported within <strong>3 days</strong> of delivery</li>
            <li>The product must be in its original packaging and condition</li>
            <li>Damage or defect must be documented with a photo shared via WhatsApp</li>
            <li>Incorrect items must be unused and sealed</li>
          </ul>

          <h2>Non-Returnable Items</h2>
          <p>Due to the nature of food products, we cannot accept returns for:</p>
          <ul>
            <li>Products that have been opened or partially used</li>
            <li>Products reported after the 3-day window</li>
            <li>Natural crystallisation of honey (this is a sign of purity and quality, not a defect)</li>
            <li>Change of mind or preference</li>
          </ul>

          <h2>Cancellation Policy</h2>
          <p>Orders can be cancelled free of charge before they are shipped. Once an order has been dispatched, cancellation may not be possible. To cancel or modify an order, please contact us immediately via WhatsApp at <strong>+91 80868 72603</strong> with your order ID.</p>

          <h2>Replacement Process</h2>
          <p>If your order qualifies for a replacement:</p>
          <ol style={{ paddingLeft: 20, marginBottom: 12 }}>
            <li style={{ fontSize: 14, color: 'rgba(58,36,26,0.55)', marginBottom: 6 }}>Contact us on WhatsApp with your order ID and photos of the issue</li>
            <li style={{ fontSize: 14, color: 'rgba(58,36,26,0.55)', marginBottom: 6 }}>Our team will verify and approve the replacement within 24 hours</li>
            <li style={{ fontSize: 14, color: 'rgba(58,36,26,0.55)', marginBottom: 6 }}>A replacement will be shipped at no additional cost</li>
            <li style={{ fontSize: 14, color: 'rgba(58,36,26,0.55)', marginBottom: 6 }}>No pickup of the original item is required for food products</li>
          </ol>

          <h2>Refunds</h2>
          <p>Since we operate on a Cash on Delivery model, refunds are processed as store credit or as a bank transfer in rare cases. Refunds for cancelled orders (before dispatch) will be processed within 5-7 business days.</p>

          <h2>Contact for Returns</h2>
          <p>For any return, cancellation, or replacement requests, reach out to us at:</p>
          <p><strong>WhatsApp:</strong> +91 80868 72603<br /><strong>Email:</strong> contactbahjahoney@gmail.com</p>
        </div>
      </section>
    </>
  );
}
