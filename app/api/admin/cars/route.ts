import { requireAdmin, errorResponse } from '@/lib/admin';
import { sanitizeCarInput, uniqueSlug } from '@/lib/cars';
import { importRemotePhoto } from '@/lib/photos';
import { revalidateSite } from '@/lib/revalidate';
import { deletePhotos, isOwnPhoto, mutateCars, mutateDrafts, readCars } from '@/lib/store';
import type { Car } from '@/lib/types';

export const maxDuration = 60;

/** Publishes a car from the review screen: creates it, or updates it when originalSlug is given. */
export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as { car?: unknown; draftId?: string; originalSlug?: string };
    const input = sanitizeCarInput(body.car);
    if (!input.brandName || !input.model) {
      return Response.json({ error: 'La marque et le modèle sont obligatoires.' }, { status: 400 });
    }

    const existing = await readCars();
    const previous = body.originalSlug ? existing.find((c) => c.slug === body.originalSlug) : undefined;
    if (body.originalSlug && !previous) return Response.json({ error: 'Véhicule introuvable.' }, { status: 404 });
    const slug = previous?.slug ?? uniqueSlug(input, existing.map((c) => c.slug));

    // Photos still hosted elsewhere (Tally) are copied into our storage before publishing.
    const photos: string[] = [];
    for (const url of input.photos) photos.push(isOwnPhoto(url) || url.startsWith('https://cdn.prod.website-files.com/') ? url : await importRemotePhoto(url, slug));

    const now = new Date().toISOString();
    const { slug: _ignored, ...rest } = input;
    const car: Car = { ...rest, photos, slug, createdAt: previous?.createdAt ?? now, updatedAt: now };

    await mutateCars((cars) => (previous ? cars.map((c) => (c.slug === slug ? car : c)) : [car, ...cars]));
    if (body.draftId) await mutateDrafts((d) => d.filter((x) => x.id !== body.draftId));
    if (previous) await deletePhotos(previous.photos.filter((p) => !photos.includes(p)));

    revalidateSite();
    return Response.json({ car });
  } catch (e) {
    return errorResponse(e);
  }
}
