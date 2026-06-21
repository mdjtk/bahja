'use client';

import { useState } from 'react';
import { loadWishlist, toggleWishlist } from '@/lib/store';
import { toast } from './Toast';

export default function WishlistHeart({ productId }: { productId: string }) {
  const [wishlisted, setWishlisted] = useState(() => loadWishlist().includes(productId));

  const handleToggle = () => {
    const updated = toggleWishlist(productId);
    setWishlisted(updated.includes(productId));
    toast(updated.includes(productId) ? 'Added to wishlist!' : 'Removed from wishlist');
  };

  return (
    <button
      className={`wishlist-heart${wishlisted ? ' active' : ''}`}
      onClick={handleToggle}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
