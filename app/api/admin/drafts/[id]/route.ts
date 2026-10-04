import { requireAdmin, errorResponse } from '@/lib/admin';
import { mutateDrafts } from '@/lib/store';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { id } = await params;
    await mutateDrafts((d) => d.filter((x) => x.id !== id));
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
