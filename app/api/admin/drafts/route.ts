import { requireAdmin, errorResponse } from '@/lib/admin';
import { draftFromTally } from '@/lib/drafts';
import { readDrafts } from '@/lib/store';

export async function GET(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    return Response.json({ drafts: await readDrafts() });
  } catch (e) {
    return errorResponse(e);
  }
}

/** Called by the backoffice when the embedded Tally form fires "Tally.FormSubmitted". */
export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  try {
    const { payload } = (await req.json()) as { payload?: unknown };
    return Response.json({ draft: await draftFromTally(payload) });
  } catch (e) {
    return errorResponse(e);
  }
}
