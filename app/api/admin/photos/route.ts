import { requireAdmin, errorResponse } from '@/lib/admin';
import { processAndSave } from '@/lib/photos';
import { slugify } from '@/lib/vocab';

export const maxDuration = 30;

/** One photo per request (already downscaled in the browser, so well under Vercel's 4.5 MB body limit). */
export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return Response.json({ error: 'Aucune photo reçue.' }, { status: 400 });
    if (!file.type.startsWith('image/')) return Response.json({ error: 'Ce fichier n’est pas une image.' }, { status: 400 });
    const url = await processAndSave(Buffer.from(await file.arrayBuffer()), slugify(String(form.get('slug') || '')) || 'brouillon');
    return Response.json({ url });
  } catch (e) {
    return errorResponse(e);
  }
}
