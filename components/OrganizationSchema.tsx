export default function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://bahjahoney.com/#organization',
        name: 'Bahja Pure Honey',
        url: 'https://bahjahoney.com',
        logo: 'https://bahjahoney.com/assets/images/logo.png',
        description: 'Bahja brings you pure, raw honey direct from Kerala beehives. Premium Wild Honey & Medicinal Stingless Bee Honey.',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+91-80868-72603',
          contactType: 'customer service',
          availableLanguage: ['English', 'Malayalam', 'Hindi'],
          areaServed: 'IN',
        },
        sameAs: [
          'https://wa.me/918086872603',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://bahjahoney.com/#website',
        url: 'https://bahjahoney.com',
        name: 'Bahja Pure Honey',
        description: 'Buy pure, raw honey online in India. Premium Wild Honey, Stingless Bee Honey & more. Direct from Kerala beehives.',
        publisher: { '@id': 'https://bahjahoney.com/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://bahjahoney.com/shop?search={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
