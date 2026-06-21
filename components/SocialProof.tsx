'use client';

import { useState, useEffect } from 'react';

export default function SocialProof({ productId: _productId }: { productId?: string } = {}) {
  const [viewers, setViewers] = useState(0);
  const [sold, setSold] = useState(0);

  useEffect(() => {
    setViewers(Math.floor(Math.random() * 20) + 12);
    setSold(Math.floor(Math.random() * 15) + 18);
    const iv = setInterval(() => {
      setViewers(Math.floor(Math.random() * 20) + 12);
      setSold((p) => p + Math.floor(Math.random() * 3));
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="social-proof pulse">
      <span className="sp-item">👁 {viewers} viewing</span>
      <span className="sp-item">✓ {sold} sold today</span>
    </div>
  );
}
