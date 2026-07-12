import Link from 'next/link';

export default function ImpactSection() {
  return (
    <section className="impact" id="about">
      <div className="container">
        <div>
          <h2>
            Our <em>Impact</em>
          </h2>
          <div className="stat">
            <strong>50+</strong>
            <span>Farmers Trained by Bahja as Master Beekeepers</span>
          </div>
          <div className="stat">
            <strong>500+</strong>
            <span>Acres of Land Pollinated, Yielding Greater Crop</span>
          </div>
          <div className="stat">
            <strong>100%</strong>
            <span>Chemical-Free — Certified Pure Since Day One</span>
          </div>
        </div>
        <div className="badges">
          <Link href="/certificate" style={{ color: 'inherit', textDecoration: 'none' }}><span>✦ FSSAI Approved</span></Link>
          <span>✦ Lab Tested</span>
          <span>✦ Direct from Hive</span>
          <span>✦ Zero Adulteration</span>
          <span>✦ No Preservatives</span>
          <span>✦ No Added Sugar</span>
        </div>
      </div>
    </section>
  );
}
