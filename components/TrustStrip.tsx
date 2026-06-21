export default function TrustStrip() {
  const items = [
    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A241A" strokeWidth="1.5" opacity=".5"><path d="M12 4c-2 0-4 2-4 5 0 3 2 5 4 5s4-2 4-5c0-3-2-5-4-5Z" /><path d="M8 9c-2 1-4 0-4-2" /><path d="M16 9c2 1 4 0 4-2" /><path d="M12 14v6" /><path d="M10 20h4" /></svg> No processing for taste!</>,
    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A241A" strokeWidth="1.5" opacity=".5"><ellipse cx="12" cy="14" rx="8" ry="5" /><path d="M12 9c-3 0-5.5 1-5.5 2.5S9 14 12 14s5.5-1 5.5-2.5S15 9 12 9Z" /><path d="M12 19v-5" /><path d="M10 3l1 4" /><path d="M14 3l-1 4" /><path d="M8 6l2 2" /><path d="M16 6l-2 2" /></svg> Focused Bee Conservation</>,
    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A241A" strokeWidth="2" opacity=".5"><path d="M5 13l4 4L19 7" /></svg> 100% pure, no additives</>,
    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A241A" strokeWidth="1.5" opacity=".5"><path d="M12 3v18" /><path d="M8 7l4-4 4 4" /><path d="M8 17l4 4 4-4" /></svg> No heating to cut corners</>,
    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A241A" strokeWidth="1.5" opacity=".5"><path d="M12 5a7 7 0 1 1 0 14 7 7 0 0 1 0-14Z" /><path d="M5 12h14" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" /></svg> Gentle bee colony handling</>,
    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3A241A" strokeWidth="1.5" opacity=".5"><circle cx="12" cy="12" r="9" /><path d="M12 3a14 14 0 0 0 0 18 14 14 0 0 0 0-18Z" /><path d="M4 12h16" /></svg> Sustainable Farming</>,
  ];

  return (
    <div className="trust">
      <div className="trust-track">
        {[...items, ...items].map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}
