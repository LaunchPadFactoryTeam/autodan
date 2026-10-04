/**
 * Reads the three numbers the backoffice shows (visitors, most viewed cars, contacts) from Umami's API.
 * Works with Umami Cloud (UMAMI_API_KEY) or a self-hosted instance (UMAMI_API_URL + UMAMI_API_KEY as bearer).
 */

export interface UmamiSummary {
  configured: boolean;
  error?: string;
  rangeDays: number;
  visitors?: number;
  pageviews?: number;
  topCars: { path: string; views: number }[];
  events: { name: string; count: number }[];
}

const CLOUD = 'https://api.umami.is/v1';

function asNumber(v: unknown): number {
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object' && 'value' in v) return Number((v as { value: unknown }).value) || 0;
  return 0;
}

async function call(path: string, params: Record<string, string | number>) {
  const base = (process.env.UMAMI_API_URL || CLOUD).replace(/\/$/, '');
  const key = process.env.UMAMI_API_KEY!;
  const qs = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (base === CLOUD) headers['x-umami-api-key'] = key;
  else headers.Authorization = `Bearer ${key}`;
  const res = await fetch(`${base}${path}?${qs}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Umami ${res.status} sur ${path}`);
  return res.json();
}

type Metric = { x: string; y: number };

export async function getUmamiSummary(rangeDays = 30): Promise<UmamiSummary> {
  const id = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const empty: UmamiSummary = { configured: false, rangeDays, topCars: [], events: [] };
  if (!id || !process.env.UMAMI_API_KEY) return empty;

  const endAt = Date.now();
  const startAt = endAt - rangeDays * 86400_000;
  const range = { startAt, endAt };
  try {
    const [stats, urls, events] = await Promise.all([
      call(`/websites/${id}/stats`, range),
      // Umami ≥ 2.18 calls the dimension "path", older versions "url".
      call(`/websites/${id}/metrics`, { ...range, type: 'path', limit: 100 }).catch(() =>
        call(`/websites/${id}/metrics`, { ...range, type: 'url', limit: 100 }),
      ),
      call(`/websites/${id}/metrics`, { ...range, type: 'event', limit: 20 }),
    ]);
    const topCars = (urls as Metric[])
      .filter((m) => /^\/voitures\/[^/?#]+/.test(m.x))
      .map((m) => ({ path: m.x.replace(/[?#].*$/, ''), views: m.y }))
      .slice(0, 10);
    return {
      configured: true,
      rangeDays,
      visitors: asNumber(stats.visitors),
      pageviews: asNumber(stats.pageviews),
      topCars,
      events: (events as Metric[]).map((m) => ({ name: m.x, count: m.y })),
    };
  } catch (e) {
    return { ...empty, configured: true, error: e instanceof Error ? e.message : String(e) };
  }
}
