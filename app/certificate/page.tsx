import type { Metadata } from 'next';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const metadata: Metadata = {
  title: 'FSSAI Certificate – Bahja',
  description: 'View Bahja FSSAI certificate for pure honey. FSSAI Reg No 21326218000285, inspected by Malappuram, Kerala.',
  alternates: {
    canonical: 'https://bahjahoney.com/certificate',
  },
  openGraph: {
    title: 'FSSAI Certificate | Bahja Pure Honey',
    description: 'View Bahja FSSAI certificate for pure honey. FSSAI Reg No 21326218000285.',
  },
};

export default function CertificatePage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Certificate', href: '/certificate' }]} />
      <div className="page-header">
        <div className="container">
          <h1>FSSAI Certificate</h1>
          <p>Food Safety and Standards Authority of India</p>
        </div>
      </div>

      <section className="cert-page">
        <div className="container">
          <div className="cert-card">
            <div className="cert-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48, color: '#eab704', flexShrink: 0 }}>
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#3A241A', margin: 0 }}>Registered with FSSAI</h2>
                <div style={{ fontSize: 12, color: 'rgba(58,36,26,0.4)' }}>Registration Certificate under FSS Act, 2006</div>
              </div>
            </div>

            <div className="cert-row"><span className="label">Registration No.</span><span className="value">21326218000285</span></div>
            <div className="cert-row"><span className="label">FBO Name</span><span className="value">Muhammed Rashid CM</span></div>
            <div className="cert-row"><span className="label">Kind of Business</span><span className="value">Food Vending Establishment</span></div>
            <div className="cert-row"><span className="label">Issue Date</span><span className="value">04-04-2026</span></div>
            <div className="cert-row"><span className="label">Valid Until</span><span className="value">03-04-2027</span></div>
            <div className="cert-row"><span className="label">Issuing Authority</span><span className="value">Malappuram, Kerala</span></div>

            <div style={{ marginTop: 32 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#3A241A', color: '#eab704', borderRadius: 99, fontSize: 12, fontWeight: 600, letterSpacing: '0.5px' }}>
                ✦ FSSAI Approved
              </span>
            </div>

            <a href="/assets/images/fssai.pdf" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 20, padding: '12px 28px', background: '#eab704', color: '#fff', borderRadius: 99, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={18} height={18}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
              View Certificate PDF
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
