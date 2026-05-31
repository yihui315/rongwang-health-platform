import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/workspace/', '/product-map/'],
    },
    sitemap: 'https://rongwang.hk/sitemap.xml',
  };
}
