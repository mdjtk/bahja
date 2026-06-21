import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ padding: '120px 0', textAlign: 'center' }}>
      <div className="container">
        <div style={{ fontSize: 80, color: '#eab704', marginBottom: 8, lineHeight: 1 }}>404</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#3A241A', marginBottom: 8 }}>
          Page Not Found
        </h1>
        <p style={{ color: 'rgba(58,36,26,0.45)', marginBottom: 32, maxWidth: 480, margin: '0 auto 32px' }}>
          Looks like this page flew away with the bees. Let us guide you back to the hive.
        </p>
        <Link href="/" className="btn btn-primary">Back to Home →</Link>
      </div>
    </div>
  );
}
