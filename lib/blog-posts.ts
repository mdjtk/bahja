export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readingTime: string;
  excerpt: string;
  body: string;
}

export const posts: BlogPost[] = [
  {
    slug: 'golden-elixir',
    title: 'The Golden Elixir: Why Raw Honey is Nature\'s Perfect Food',
    date: 'June 15, 2025',
    readingTime: '5 min read',
    excerpt: 'Packed with enzymes, antioxidants, and living pollen — raw honey is one of the most complex natural foods on the planet. Here\'s why it deserves a place in your daily diet.',
    body: `<p>For thousands of years, honey has been revered not just as a sweetener but as medicine, currency, and even a sacred offering. But not all honey is created equal. The difference between the crystallised, raw honey straight from a comb and the processed, filtered syrup on supermarket shelves is night and day.</p>
<h2>What Makes Honey "Raw"?</h2>
<p>Raw honey is honey that has never been heated above the natural temperature of the hive (around 35°C / 95°F). It hasn't been fine-filtered, pasteurised, or processed in any way. This means it retains all the goodness that bees put into it — enzymes, pollen, propolis, and antioxidants.</p>
<p>Most commercial honey is heated to 70°C or higher to delay crystallisation and make it easier to filter. This destroys the very enzymes that make honey beneficial. At Bahja, we never heat our honey. What you get is exactly what the bees made.</p>
<h2>The Enzyme Advantage</h2>
<p>Raw honey contains glucose oxidase, an enzyme that produces hydrogen peroxide — giving honey its natural antimicrobial properties. When honey is heated, this enzyme is destroyed. Studies show that raw honey can have up to 400% higher antioxidant activity compared to processed honey.</p>
<h2>Living Pollen and Digestive Health</h2>
<p>Raw honey contains trace amounts of bee pollen, which is rich in B vitamins, amino acids, and enzymes that aid digestion. Many people find that a spoonful of raw honey before meals helps with seasonal discomfort and supports gut health.</p>
<ul>
  <li><strong>Morning boost:</strong> A teaspoon in warm water (not boiling!) with lemon</li>
  <li><strong>Pre-workout:</strong> Raw honey provides sustained energy without spiking blood sugar</li>
  <li><strong>Soothe a sore throat:</strong> Raw honey coats and calms irritated tissues</li>
  <li><strong>Wound healing:</strong> Medical-grade honey is used in hospitals for its antibacterial properties</li>
</ul>
<h2>Why Local Raw Honey Matters</h2>
<p>Raw honey from your region contains local pollen that may help your body adapt to local allergens. While we can't make medical claims, the anecdotal evidence is strong. Our honey comes from the forests of Gujarat, where indigenous bee species thrive on wild, chemical-free flora.</p>
<h2>How to Spot Real Raw Honey</h2>
<p>Real raw honey crystallises over time. If your honey stays perfectly liquid forever, it's been processed. Other signs: a complex aroma that changes with the season, visible pollen particles, and a label that says "raw" and "unfiltered". At Bahja, we guarantee every jar.</p>`,
  },
  {
    slug: 'stingless-bee-superfood',
    title: 'Stingless Bee Honey: The Ancient Superfood You\'ve Never Heard Of',
    date: 'May 28, 2025',
    readingTime: '4 min read',
    excerpt: 'Cheruthen, known as stingless bee honey, has been used in traditional medicine for centuries. Discover what makes this rare honey 10x more potent than regular honey.',
    body: `<p>Cheruthen, known as stingless bee honey, has been used in traditional medicine for centuries. Deep in the forests of India, a tiny bee produces one of the most prized substances in traditional medicine — Stingless Bee Honey. Known as "forest gold," this rare honey has been used in Ayurveda for centuries.</p>
<h2>What Makes Stingless Bee Honey Special?</h2>
<p>Stingless bees (Meliponini) are smaller than regular honeybees and produce significantly less honey — a single colony yields only about 1-2 kilograms per year. This scarcity, combined with its potent medicinal properties, makes it highly valuable.</p>
<h2>Health Benefits</h2>
<p>Stingless bee honey has higher antibacterial activity compared to regular honey. It's rich in flavonoids and antioxidants, making it effective for boosting immunity, treating respiratory issues, and improving digestive health.</p>
<h2>Traditional Uses</h2>
<p>In Indian tribal communities, stingless bee honey is used to treat everything from colds and fevers to skin infections. It's also used in traditional rituals and as a natural sweetener in herbal preparations.</p>`,
  },
  {
    slug: 'hive-to-bottle',
    title: 'From Hive to Bottle: How We Harvest Our Honey',
    date: 'April 10, 2025',
    readingTime: '4 min read',
    excerpt: 'Our beekeepers follow traditional methods passed down through generations. Take a behind-the-scenes look at how Bahja honey travels from forest to your doorstep.',
    body: `<p>Our beekeepers follow traditional methods passed down through generations. The journey from hive to bottle is a fascinating process that requires skill, patience, and respect for the bees.</p>
<h2>Step 1: Beehive Inspection</h2>
<p>Beekeepers regularly inspect hives to ensure the colony is healthy and productive. They check for disease, pests, and the amount of capped honey stores.</p>
<h2>Step 2: Removing Honey Frames</h2>
<p>When the honey is ready, frames are carefully removed from the hive. The bees are gently brushed off or a bee escape is used to clear the frames.</p>
<h2>Step 3: Extraction</h2>
<p>The frames are uncapped using a hot knife, and the honey is extracted using a centrifuge that spins the honey out of the comb without damaging it.</p>
<h2>Step 4: Filtering and Bottling</h2>
<p>The honey is filtered to remove wax particles and other impurities. At Bahja, we avoid fine filtering to preserve pollen and beneficial enzymes.</p>`,
  },
  {
    slug: 'wellness-routine',
    title: '5 Ways to Incorporate Honey into Your Daily Wellness Routine',
    date: 'March 22, 2025',
    readingTime: '3 min read',
    excerpt: 'From morning immunity boosters to post-workout recovery — honey is one of the most versatile natural foods you can add to your daily routine.',
    body: `<p>From morning immunity boosters to post-workout recovery — honey is one of the most versatile natural foods you can add to your daily routine.</p>
<h2>Immune-Boosting Properties</h2>
<p>Raw honey contains polyphenols — powerful antioxidants that help protect your body from oxidative stress and inflammation. Regular consumption can strengthen your immune system and help fight off infections.</p>
<h2>Natural Energy Source</h2>
<p>The natural sugars in honey provide a sustained energy boost without the crash associated with processed sugar. It's an excellent pre-workout fuel or afternoon pick-me-up.</p>
<h2>Digestive Health</h2>
<p>Honey acts as a prebiotic, promoting the growth of beneficial gut bacteria. It can also soothe digestive issues and help with conditions like acid reflux.</p>`,
  },
  {
    slug: 'manuka-vs-indian',
    title: 'The Truth About Manuka vs Indian Raw Honey',
    date: 'February 14, 2025',
    readingTime: '5 min read',
    excerpt: 'Is Manuka really superior to Indian raw honey? We take a deep dive into the science behind these two remarkable honeys.',
    body: `<p>Is Manuka really superior to Indian raw honey? We take a deep dive into the science behind these two remarkable honeys.</p>
<h2>What is Manuka Honey?</h2>
<p>Manuka honey is produced by bees that pollinate the Manuka bush (Leptospermum scoparium), native to New Zealand. It contains methylglyoxal (MGO), a compound responsible for its powerful antibacterial activity.</p>
<h2>UMF Rating System</h2>
<p>The Unique Manuka Factor (UMF) rating measures the concentration of key compounds. A higher UMF rating indicates stronger antibacterial properties. UMF 10+ is considered therapeutic-grade.</p>
<h2>Indian Alternatives</h2>
<p>While Manuka honey is imported and expensive, India has its own medicinal honeys — particularly Stingless Bee Honey and Wild Forest Honey — that offer comparable benefits at a fraction of the cost.</p>`,
  },
  {
    slug: 'beekeeping-gujarat',
    title: 'Beekeeping in Gujarat: A Tradition of Harmony',
    date: 'January 8, 2025',
    readingTime: '4 min read',
    excerpt: 'Gujarat beekeeping communities have lived in harmony with Apis cerana for centuries. Bees are the unsung heroes of our ecosystem.',
    body: `<p>Gujarat beekeeping communities have lived in harmony with Apis cerana for centuries. Bees are the unsung heroes of our ecosystem.</p>
<h2>The Importance of Bees</h2>
<p>Bees pollinate approximately 75% of the world's flowering plants and about 35% of global food crops. Without bees, many of our favorite foods would become scarce and expensive.</p>
<h2>Threats to Bee Populations</h2>
<p>Pesticide use, habitat loss, climate change, and diseases are all contributing to bee decline. Industrial agriculture practices are particularly harmful to bee populations.</p>
<h2>How You Can Help</h2>
<p>Support local beekeepers, choose organic produce, plant bee-friendly flowers, avoid pesticides in your garden, and spread awareness about the importance of bees. Every small action helps protect these essential creatures.</p>`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}
