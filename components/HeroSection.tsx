import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="hero" id="main-content">
      <div className="container">
        <div className="hero-left">
          <h1>100% Pure<br />Raw &amp; Natural</h1>
          <p className="sub">
            Direct from Bahja apiaries. No processing, no additives — just pure, wild honey as nature intended.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/shop" className="btn btn-primary">Explore Range →</Link>
            <Link href="/#process" className="btn btn-outline">Our Process</Link>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-img">
            <div className="halo"></div>
            <div className="prod-overlay">
              <div className="p-item">
                <img src="/assets/images/wild-honey.png" alt="Premium Wild Honey" />
              </div>
              <div className="p-item">
                <img src="/assets/images/stingless-bee.png" alt="Stingless Bee Honey" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
