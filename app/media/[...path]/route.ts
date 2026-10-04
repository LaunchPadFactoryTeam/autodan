import { readLocalMedia, usesBlob } from '@/lib/store';

/** Serves photos uploaded in local development (production photos live on Vercel Blob). */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (usesBlob()) return new Response('Not found', { status: 404 });
  const { path } = await params;
  const buf = await readLocalMedia(path.join('/'));
  if (!buf) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(buf), { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=31536000, immutable' } });
}
