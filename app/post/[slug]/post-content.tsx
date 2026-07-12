'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import DOMPurify from 'dompurify'
import { getPostBySlug } from '@/lib/blog-posts'

function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/post/${slug}` : '';
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="post-share">
      <span>Share</span>
      <a href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
      </a>
      <a href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
      </a>
      <a href={`https://facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
      </a>
    </div>
  );
}

export default function PostContent() {
  const params = useParams()
  const post = getPostBySlug(params.slug as string)

  if (!post) {
    return (
      <div className="container" style={{ paddingTop: 160, paddingBottom: 80, textAlign: 'center' }}>
        <h1>Post Not Found</h1>
        <p style={{ marginTop: 16, marginBottom: 24, color: '#666' }}>The post you are looking for does not exist.</p>
        <Link href="/blog" className="btn btn-primary">← Back to Blog</Link>
      </div>
    )
  }

  const sanitizedBody = DOMPurify.sanitize(post.body)

  return (
    <section style={{ paddingTop: 140, paddingBottom: 60, background: '#f9f6ef' }}>
      <div className="container">
        <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#3A241A', marginBottom: 24, fontSize: 14 }}>
          ← Back to Blog
        </Link>
        <div className="post-meta" style={{ display: 'flex', gap: 16, color: '#8B7355', fontSize: 13, marginBottom: 8 }}>
          <span>{post.date}</span>
          <span>{post.readingTime}</span>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#3A241A', lineHeight: 1.2, marginBottom: 24 }}>{post.title}</h1>
        <div
          className="post-body"
          style={{ color: '#555', lineHeight: 1.8, fontSize: 16, maxWidth: 720 }}
          dangerouslySetInnerHTML={{ __html: sanitizedBody }}
        />
        <ShareButtons title={post.title} slug={post.slug} />
        <div style={{ marginTop: 40, padding: 32, background: '#f9eec0', borderRadius: 12 }}>
          <h3 style={{ fontSize: 18, marginBottom: 12 }}>Ready to Try Pure Honey?</h3>
          <p style={{ color: '#555', marginBottom: 16, fontSize: 14, lineHeight: 1.6 }}>
            Experience the natural goodness of Bahja&apos;s raw, unprocessed honey. Sourced from the wild forests of India.
          </p>
          <Link href="/shop" className="btn btn-primary">Shop Now</Link>
        </div>
      </div>
    </section>
  )
}
