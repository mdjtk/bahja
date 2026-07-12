import type { Metadata } from 'next';
import { getPostBySlug } from '@/lib/blog-posts';
import PostContent from './post-content';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = getPostBySlug(slug);
    if (post) {
      return {
        title: post.title,
        description: post.excerpt,
        alternates: {
          canonical: `https://bahjahoney.com/post/${slug}`,
        },
        openGraph: {
          title: `${post.title} | Bahja Pure Honey`,
          description: post.excerpt,
          type: 'article',
          publishedTime: new Date(post.date).toISOString(),
          images: ['https://bahjahoney.com/assets/images/og-image.jpg'],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${post.title} | Bahja Pure Honey`,
          description: post.excerpt,
        },
      };
    }
  } catch {}
  return {
    title: 'Blog Post | Bahja Pure Honey',
  };
}

export default function PostPage() {
  return <PostContent />;
}
