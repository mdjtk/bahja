export default function GiftSection() {
  return (
    <section className="gift" id="gift">
      <div className="container">
        <div className="gift-text">
          <h2>Sweet, Thoughtful Gift Sets</h2>
          <p>
            Send the purest, healthiest gift and show how much you care. Beautifully packaged honey
            sets for every occasion.
          </p>
          <a href="/shop" className="btn btn-primary">Shop Gift Sets →</a>
        </div>
        <div className="showcase">
          <div className="podium-img">
            <img src="/assets/images/gift-set.png" alt="Honey gift set" />
          </div>
          <div className="product-img">
            <img src="/assets/images/wild-honey-gift.png" alt="Premium Wild Honey" />
          </div>
        </div>
      </div>
    </section>
  );
}
