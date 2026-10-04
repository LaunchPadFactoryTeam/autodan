import type { MetadataRoute } from 'next';
import { getPublicCars } from '@/lib/cars';
import { SITE_URL } from '@/lib/site';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cars = await getPublicCars();
  const latest = cars.reduce((d, c) => (c.updatedAt > d ? c.updatedAt : d), '2026-10-04T00:00:00.000Z');
  return [
    { url: SITE_URL + '/', lastModified: latest, changeFrequency: 'weekly', priority: 1 },
    { url: SITE_URL + '/voitures', lastModified: latest, changeFrequency: 'daily', priority: 0.9 },
    ...cars.map((c) => ({
      url: `${SITE_URL}/voitures/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: c.status === 'sold' ? 0.3 : 0.8,
      images: c.photos.slice(0, 5).map((p) => (p.startsWith('http') ? p : SITE_URL + p)),
    })),
    { url: SITE_URL + '/a-propos', changeFrequency: 'monthly', priority: 0.6 },
    { url: SITE_URL + '/contact', changeFrequency: 'monthly', priority: 0.6 },
  ];
}
