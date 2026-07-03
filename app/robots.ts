import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/cart',
          '/checkout',
        ],
        // Parameter URLs (utm_, sort, q) are intentionally left crawlable so
        // Google can see each page's rel=canonical and consolidate variants.
        // Blocking them in robots.txt hides the canonical and risks duplicates.
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
