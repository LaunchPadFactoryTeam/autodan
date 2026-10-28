import { requireAdmin, errorResponse } from '@/lib/admin';
import { revalidateSite } from '@/lib/revalidate';
import { deletePhotos, mutateCars, readCars } from '@/lib/store';
import type { CarStatus } from '@/lib/types';

type Ctx = { params: Promise<{ slug: string }> };

/** Quick edits from the stock list: status (en vente / vendu / masqué), price, « voiture du moment ». */
export async function PATCH(req: Request, { params }: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { slug } = await params;
    const body = (await req.json()) as { status?: CarStatus; price?: number | null; featured?: boolean };
    let found = false;
    const cars = await mutateCars((list) =>
      list.map((c) => {
        if (c.slug !== slug) return c;
        found = true;
        return {
          ...c,
          ...(body.status && ['available', 'sold', 'hidden'].includes(body.status) ? { status: body.status } : {}),
          ...(typeof body.featured === 'boolean' ? { featured: body.featured } : {}),
          ...(body.price === null || (typeof body.price === 'number' && body.price >= 0) ? { price: body.price } : {}),
          updatedAt: new Date().toISOString(),
        };
      }),
    );
    if (!found) return Response.json({ error: 'Véhicule introuvable.' }, { status: 404 });
    revalidateSite();
    return Response.json({ car: cars.find((c) => c.slug === slug) });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { slug } = await params;
    const car = (await readCars()).find((c) => c.slug === slug);
    if (!car) return Response.json({ error: 'Véhicule introuvable.' }, { status: 404 });
    await mutateCars((list) => list.filter((c) => c.slug !== slug));
    await deletePhotos(car.photos);
    revalidateSite();
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
