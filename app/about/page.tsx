import ImpactSection from '@/components/ImpactSection';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const metadata = {
  title: 'About Us – Bahja',
  description: 'Learn about Bahja ethical beekeeping journey from the beehives of Kerala to your doorstep.',
};

export default function AboutPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'About', href: '/about' }]} />
      <div className="page-header">
        <div className="container">
          <h1>About Bahja</h1>
          <p>Pure honey, ethical roots, real impact</p>
        </div>
      </div>

      <div className="about-story">
        <div className="container">
          <div>
            <h2>From the Hive, With Love</h2>
            <p>
              Bahja started with a simple belief — that nature&apos;s sweetest gift shouldn&apos;t be tampered with.
              Our journey began in the forests of Gujarat, where we discovered traditional beekeeping
              communities practicing methods passed down for generations.
            </p>
            <p>
              We work directly with local beekeepers, ensuring ethical harvesting practices that put the
              health of the hive first. Every jar of Bahja honey is raw, unfiltered, and never heated
              beyond its natural temperature. What you taste is exactly what the bees intended.
            </p>
            <p>
              Our name, Bahja, means pure in heart — a promise we extend to our bees, our farmers, and
              everyone who enjoys our honey.
            </p>
          </div>
          <div style={{ background: '#fdf6ec', borderRadius: 16, padding: 40, textAlign: 'center' }}>
            <img src="/assets/images/logo.png" alt="Bahja" style={{ height: 80, marginBottom: 16 }} />
            <p style={{ fontSize: 15, color: 'rgba(58,36,26,0.55)', fontStyle: 'italic' }}>
              &ldquo;Nature doesn&apos;t need our help to make perfect honey. It just needs us to not get in the way.&rdquo;
            </p>
          </div>
        </div>
      </div>

      <ImpactSection />
    </>
  );
}
