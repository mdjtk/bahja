import Link from 'next/link';
import BreadcrumbSchema from '@/components/BreadcrumbSchema';

export const metadata = {
  title: 'Blog – Bahja',
  description: 'Explore Bahja honey blog — beekeeping stories, recipes, health tips, and more.',
};

const posts = [
  {
    slug: 'golden-elixir',
    date: 'June 15, 2025',
    readingTime: '5 min read',
    title: 'The Golden Elixir: Why Raw Honey is Nature\'s Perfect Food',
    excerpt: 'Packed with enzymes, antioxidants, and living pollen — raw honey is one of the most complex natural foods on the planet. Here\'s why it deserves a place in your daily diet.',
  },
  {
    slug: 'stingless-bee-superfood',
    date: 'May 28, 2025',
    readingTime: '4 min read',
    title: 'Stingless Bee Honey: The Ancient Superfood You\'ve Never Heard Of',
    excerpt: 'Cheruthen, known as stingless bee honey, has been used in traditional medicine for centuries. Discover what makes this rare honey 10x more potent than regular honey.',
  },
  {
    slug: 'hive-to-bottle',
    date: 'April 10, 2025',
    readingTime: '4 min read',
    title: 'From Hive to Bottle: How We Harvest Our Honey',
    excerpt: 'Our beekeepers follow traditional methods passed down through generations. Take a behind-the-scenes look at how Bahja honey travels from forest to your doorstep.',
  },
  {
    slug: 'wellness-routine',
    date: 'March 22, 2025',
    readingTime: '3 min read',
    title: '5 Ways to Incorporate Honey into Your Daily Wellness Routine',
    excerpt: 'From morning immunity boosters to post-workout recovery — here are five simple ways to make honey a part of your everyday health regimen.',
  },
  {
    slug: 'manuka-vs-indian',
    date: 'February 14, 2025',
    readingTime: '5 min read',
    title: 'The Truth About Manuka vs Indian Raw Honey',
    excerpt: 'Is Manuka really superior to Indian raw honey? We take a deep dive into the science, the marketing, and why local raw honey often comes out on top.',
  },
  {
    slug: 'beekeeping-gujarat',
    date: 'January 8, 2025',
    readingTime: '4 min read',
    title: 'Beekeeping in Gujarat: A Tradition of Harmony',
    excerpt: 'Gujarat\'s beekeeping communities have lived in harmony with Apis cerana for centuries. Learn how this ancient practice sustains both people and pollinators.',
  },
];

export default function BlogPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: 'Home', href: '/' }, { name: 'Blog', href: '/blog' }]} />
      <div className="page-header">
        <div className="container">
          <h1>The Hive Journal</h1>
          <p>Stories from the hive, recipes, wellness tips & more</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="blog-grid">
            {posts.map((post) => (
              <article className="blog-card" key={post.slug}>
                <div className="bc-body">
                  <div className="bc-date">{post.date} · {post.readingTime}</div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <Link href={`/post/${post.slug}`}>Read More →</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
