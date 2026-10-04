import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // AI crawlers are welcome on the public pages: being cited by answer engines is the point (GEO).
    rules: [{ userAgent: '*', allow: '/', disallow: ['/gestion', '/api/'] }],
    sitemap: SITE_URL + '/sitemap.xml',
    host: SITE_URL,
  };
}
