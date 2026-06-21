export function SkeletonBox({ width, height, style }: { width?: string | number; height?: string | number; style?: React.CSSProperties }) {
  return <div className="skeleton-box" style={{ width: width ?? '100%', height: height ?? 16, ...style }} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card" style={{ pointerEvents: 'none' }}>
      <div className="img-wrap">
        <div className="skeleton-box" style={{ width: 110, height: 130, borderRadius: 16 }} />
      </div>
      <div className="p-body" style={{ padding: '0 8px' }}>
        <div className="skeleton-box" style={{ width: 60, height: 12, margin: '0 auto 8px' }} />
        <div className="skeleton-box" style={{ width: '80%', height: 18, margin: '0 auto 8px' }} />
        <div className="skeleton-box" style={{ width: '60%', height: 12, margin: '0 auto 14px' }} />
        <div className="v-row" style={{ justifyContent: 'center', gap: 8 }}>
          <div className="skeleton-box" style={{ width: 50, height: 26, borderRadius: 6 }} />
          <div className="skeleton-box" style={{ width: 50, height: 26, borderRadius: 6 }} />
        </div>
        <div className="footer-row">
          <div className="skeleton-box" style={{ width: 60, height: 20 }} />
          <div className="skeleton-box" style={{ width: 38, height: 38, borderRadius: '50%' }} />
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div style={{ padding: 60, maxWidth: 1200, margin: '0 auto' }}>
      <div className="skeleton-box" style={{ width: 240, height: 32, margin: '0 auto 40px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 30 }}>
        {[1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
