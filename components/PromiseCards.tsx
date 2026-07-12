export default function PromiseCards() {
  const cards = [
    {
      icon: <><path d="M3 20h18L12 4 3 20z" /><path d="M12 4l3 8-3 2-3-2 3-8z" /><path d="M6 16l2-2" /><path d="M18 16l-2-2" /></>,
      title: 'Wild Sourced',
      desc: 'Harvested from untreated forest hives in pristine ecosystems',
    },
    {
      icon: <><path d="M7 3h10" /><path d="M9 3v9l-4 9h14l-4-9V3" /><path d="M6 18h12" /></>,
      title: 'Lab Tested',
      desc: 'Third-party verified for purity, enzyme activity & antioxidant levels',
    },
    {
      icon: <><path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" /><circle cx="12" cy="7" r="3" /><path d="M14 4l1-1h4l-1 1v2" /><path d="M16 7v-1" /></>,
      title: 'Farmer First',
      desc: 'Ethical sourcing that supports local beekeeping communities',
    },
  ];

  return (
    <section className="promise">
      <div className="container">
        <div className="dash"></div>
        <h2>Our Purest Promise</h2>
        <p className="promise-sub">Pure delicious honey, straight from the hive that helps the farmers thrive.</p>
        <div className="promise-grid">
          {cards.map((c, i) => (
            <div className="promise-card" key={i}>
              <div className="hex-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {c.icon}
                </svg>
              </div>
              <h4>{c.title}</h4>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
