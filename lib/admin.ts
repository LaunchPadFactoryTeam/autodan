import { timingSafeEqual } from 'node:crypto';

/**
 * No login: the backoffice lives at /gestion/<ADMIN_TOKEN>. API calls send the same token
 * in the x-admin-token header. Changing ADMIN_TOKEN on Vercel revokes the old link.
 */
export function isAdminToken(candidate: string | null | undefined): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || expected.length < 16 || !candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function requireAdmin(req: Request): Response | null {
  if (isAdminToken(req.headers.get('x-admin-token'))) return null;
  return Response.json({ error: 'Lien de gestion invalide.' }, { status: 401 });
}

export function errorResponse(e: unknown): Response {
  console.error(e);
  const message = e instanceof Error ? e.message : 'Erreur inconnue';
  return Response.json({ error: message }, { status: 500 });
}
