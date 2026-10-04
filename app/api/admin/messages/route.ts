import { requireAdmin, errorResponse } from '@/lib/admin';
import { mutateMessages } from '@/lib/store';

export async function DELETE(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const id = new URL(req.url).searchParams.get('id');
    await mutateMessages((list) => list.filter((m) => m.id !== id));
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
