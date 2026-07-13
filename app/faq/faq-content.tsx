'use client';

import { useState } from 'react';
import { faqs } from '@/lib/faq-data';

export default function FaqContent() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (i: number) => setOpenIdx(openIdx === i ? null : i);

  return (
    <div className="faq-section">
      {faqs.map((faq, i) => (
        <div className="faq-item" key={i}>
          <div className="faq-q" onClick={() => toggle(i)}>
            {faq.q}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openIdx === i ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div className={`faq-a${openIdx === i ? ' open' : ''}`}>
            <p>{faq.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
