import { randomUUID } from 'node:crypto';
import { getPublicCar } from '@/lib/cars';
import { carTitle } from '@/lib/format';
import { notifyNewMessage } from '@/lib/notify';
import { mutateMessages } from '@/lib/store';
import type { Message } from '@/lib/types';

const s = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Requête invalide.' }, { status: 400 });
  }
  // Honeypot: bots fill every field. Pretend it worked.
  if (s(body.website, 200)) return Response.json({ ok: true });

  const name = s(body.name, 120);
  const phone = s(body.phone, 40);
  const email = s(body.email, 160);
  if (!name) return Response.json({ error: 'Merci d’indiquer votre nom.' }, { status: 400 });
  if (!phone && !email) return Response.json({ error: 'Merci d’indiquer un téléphone ou un e-mail.' }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });

  const carSlug = s(body.carSlug, 100) || undefined;
  const car = carSlug ? await getPublicCar(carSlug) : undefined;
  const message: Message = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    kind: body.kind === 'question' ? 'question' : 'contact',
    name,
    phone,
    email,
    topic: s(body.topic, 120) || 'Contact',
    message: s(body.message, 4000),
    carSlug: car?.slug,
    carTitle: car ? `${carTitle(car)} ${car.year ?? ''}`.trim() : undefined,
  };

  try {
    await mutateMessages((list) => [message, ...list].slice(0, 500));
  } catch (e) {
    console.error('save message', e);
    return Response.json({ error: 'Envoi impossible pour le moment. Appelez-nous directement.' }, { status: 503 });
  }
  await notifyNewMessage(message).catch((e) => console.error('notify', e));
  return Response.json({ ok: true });
}
