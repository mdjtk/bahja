'use client';

import { useState, useEffect, FormEvent } from 'react';

interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
}

function loadReviews(productId: string): Review[] {
  try {
    return JSON.parse(localStorage.getItem(`bhj_reviews_${productId}`) || '[]');
  } catch { return []; }
}

function saveReviews(productId: string, reviews: Review[]): void {
  localStorage.setItem(`bhj_reviews_${productId}`, JSON.stringify(reviews));
}

export default function Reviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [hover, setHover] = useState(0);

  useEffect(() => { setReviews(loadReviews(productId)); }, [productId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    const review: Review = { name: name.trim(), rating, text: text.trim(), date: new Date().toISOString() };
    const updated = [review, ...reviews];
    saveReviews(productId, updated);
    setReviews(updated);
    setName('');
    setRating(5);
    setText('');
  };

  return (
    <div className="reviews-section">
      <h3>Customer Reviews</h3>
      <form className="review-form" onSubmit={handleSubmit}>
        <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="star-picker">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" className={(hover || rating) >= star ? 'on' : ''} onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}>★</button>
          ))}
        </div>
        <textarea rows={3} placeholder="Write your review..." value={text} onChange={(e) => setText(e.target.value)} required />
        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Submit Review</button>
      </form>
      {reviews.length === 0 ? (
        <div className="review-empty">No reviews yet. Be the first!</div>
      ) : (
        <div className="review-list">
          {reviews.map((r, i) => (
            <div key={i} className="review-item">
              <div className="review-item-header">
                <strong>{r.name}</strong>
                <span className="review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <span className="review-date">{new Date(r.date).toLocaleDateString()}</span>
              </div>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
