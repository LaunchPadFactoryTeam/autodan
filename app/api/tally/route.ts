import { createHmac, timingSafeEqual } from 'node:crypto';
import { isAdminToken } from '@/lib/admin';
import { draftFromTally } from '@/lib/drafts';

/**
 * Tally webhook (Intégrations → Webhooks). Each submission becomes a draft in the backoffice,
 * where it is reviewed before going live — even if the form was filled outside the backoffice.
 * Authenticated by Tally's signing secret (TALLY_SIGNING_SECRET).
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.TALLY_SIGNING_SECRET;
  const signature = req.headers.get('tally-signature') ?? '';
  const authorised = secret
    ? safeEqual(signature, createHmac('sha256', secret).update(raw).digest('base64'))
    : isAdminToken(new URL(req.url).searchParams.get('token'));
  if (!authorised) return Response.json({ error: 'Signature invalide.' }, { status: 401 });

  try {
    const body = JSON.parse(raw);
    if (body.eventType && body.eventType !== 'FORM_RESPONSE') return Response.json({ ignored: true });
    const draft = await draftFromTally(body);
    return Response.json({ draftId: draft.id });
  } catch (e) {
    console.error('tally webhook', e);
    return Response.json({ error: 'Traitement impossible.' }, { status: 500 });
  }
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
