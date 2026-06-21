import { Product } from '@/lib/data';

export default function ProductSchema({ product }: { product: Product }) {
  const variants = Object.entries(product.variants);
  const minPrice = Math.min(...variants.map(([, v]) => v.price));
  const maxPrice = Math.max(...variants.map(([, v]) => v.price));

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: `https://bahja.in${product.image}`,
    brand: { '@type': 'Brand', name: 'Bahja' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: minPrice,
      highPrice: maxPrice,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      bestRating: 5,
      ratingCount: 128,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
