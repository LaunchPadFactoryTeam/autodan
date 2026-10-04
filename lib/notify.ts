import type { Message } from './types';

/** Optional e-mail alert for each new message, through Resend's free tier. Silent when not configured. */
export async function notifyNewMessage(m: Message): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFY_EMAIL;
  if (!key || !to) return;
  const subject = m.kind === 'question' ? `Question sur ${m.carTitle ?? 'un véhicule'} — ${m.name}` : `${m.topic} — ${m.name}`;
  const text = [
    `Nom : ${m.name}`,
    m.phone && `Téléphone : ${m.phone}`,
    m.email && `E-mail : ${m.email}`,
    `Demande : ${m.topic}`,
    m.carSlug && `Véhicule : ${(process.env.NEXT_PUBLIC_SITE_URL || '')}/voitures/${m.carSlug}`,
    '',
    m.message || '(pas de message)',
  ]
    .filter((l): l is string => typeof l === 'string')
    .join('\n');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'Site Autodan <onboarding@resend.dev>',
      to: to.split(',').map((s) => s.trim()),
      subject,
      text,
      ...(m.email ? { reply_to: m.email } : {}),
    }),
  });
  if (!res.ok) console.error('Resend', res.status, await res.text().catch(() => ''));
}
