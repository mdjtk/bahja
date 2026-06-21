export interface ProductVariant {
  label: string;
  price: number;
  oldPrice: number | null;
}

export interface Product {
  id: string;
  name: string;
  type: string;
  slug: string;
  image: string;
  variants: Record<string, ProductVariant>;
  rating: number;
  description: string;
  variantOrder: string[];
}

export const PRODUCTS: Record<string, Product> = {
  'wild-honey': {
    id: 'wild-honey',
    name: 'Premium Wild Honey',
    type: 'Wild Honey',
    slug: 'Premium Wild Honey',
    image: '/assets/images/wild-honey.png',
    variants: {
      '250g': { label: '250g', price: 349, oldPrice: null },
      '500g': { label: '500g', price: 599, oldPrice: 699 },
    },
    variantOrder: ['250g', '500g'],
    rating: 5.0,
    description: 'Raw forest honey · rich in enzymes & living pollen',
  },
  'stingless-bee': {
    id: 'stingless-bee',
    name: 'Medicinal Stingless Bee Honey',
    type: 'Stingless Bee',
    slug: 'Medicinal Stingless Bee Honey',
    image: '/assets/images/stingless-bee.png',
    variants: {
      '250g': { label: '250g', price: 699, oldPrice: null },
      '500g': { label: '500g', price: 1199, oldPrice: 1399 },
    },
    variantOrder: ['250g', '500g'],
    rating: 5.0,
    description: 'Rare Cheruthen · 10x antioxidant yield',
  },
};

export function getProductPrice(product: Product, variant: string): number {
  return product.variants[variant]?.price ?? 0;
}

export function getCartItemTotal(
  product: Product | undefined,
  variant: string,
  qty: number
): number {
  if (!product) return 0;
  return (product.variants[variant]?.price ?? 0) * qty;
}

export function getCartSubtotal(
  cart: { id: string; variant: string; qty: number }[]
): number {
  return cart.reduce((sum, item) => {
    const p = PRODUCTS[item.id];
    return sum + getCartItemTotal(p, item.variant, item.qty);
  }, 0);
}
