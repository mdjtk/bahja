// Types only — product data is fetched from Supabase (`bahja_products` table).
// Do not import hardcoded product data from this file.

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
  active?: boolean;
}
