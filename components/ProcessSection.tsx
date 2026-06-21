export default function ProcessSection() {
  const steps = [
    {
      icon: (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 4L4 12v8l12 8 12-8v-8L16 4z" />
          <path d="M4 16l24 0" />
          <path d="M10 12l6-4 6 4" />
        </svg>
      ),
      num: '01',
      title: 'Set-up Apiaries',
      desc: 'We handpick farms free from pesticides and insecticides for beehive-colonies nationwide.',
    },
    {
      icon: (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4h8l2 6-1 18a2 2 0 01-2 2h-6a2 2 0 01-2-2L10 10l2-6z" />
          <path d="M9 14h14" />
          <path d="M11 20h10" />
          <path d="M13 26h6" />
        </svg>
      ),
      num: '02',
      title: 'Honey Collection & Rotation',
      desc: 'Naturally ripe honey is extracted using simple separation methods. Hives are moved to new locations.',
    },
    {
      icon: (
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12l13-9 13 9" />
          <path d="M6 10v13a2 2 0 002 2h16a2 2 0 002-2V10" />
          <path d="M12 27V18h8v9" />
        </svg>
      ),
      num: '03',
      title: 'Bahja Apiary to Home',
      desc: 'We deliver raw honey directly when you order. Shipping PAN India to your doorstep.',
    },
  ];

  return (
    <section className="process" id="process">
      <div className="container">
        <h2>
          Bahja <em>Hive to Bottle</em>
        </h2>
        <p>A lot of love, care, and bee-charming goes into filling every jar with raw, energizing honey.</p>
        <div className="process-flow">
          {steps.map((s, i) => (
            <div className="step" key={i}>
              <div className="step-icon">{s.icon}</div>
              <span className="step-num">{s.num}</span>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
