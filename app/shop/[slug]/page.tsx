import type { Metadata } from 'next';
import { getProductBySlug } from '@/lib/products'
import ProductDetailPageClient from '@/components/ProductDetailPageClient'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params
    const product = await getProductBySlug(slug)
    if (product) {
      const variantList = Object.entries(product.variants).map(([key, v]: [string, any]) => `${key} — ₹${v.price}`).join(', ')
      return {
        title: `${product.name} | Bahja Pure Honey`,
        description: product.description || `Buy ${product.name} — ${variantList}. 100% pure, raw honey from Bahja.`,
        openGraph: {
          title: `${product.name} | Bahja Pure Honey`,
          description: product.description?.slice(0, 160),
          images: product.image ? [{ url: product.image }] : [],
        },
      }
    }
  } catch {}
  return { title: 'Product | Bahja Pure Honey' }
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ProductDetailPageClient slugPromise={params} />
}
