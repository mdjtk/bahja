export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/account/', '/my-orders/', '/cart/', '/checkout/'],
      },
    ],
    sitemap: 'https://bahjahoney.com/sitemap.xml',
  }
}
