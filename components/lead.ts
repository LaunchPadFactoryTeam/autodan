'use client';

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string | number>) => void };
  }
}

export interface LeadPayload {
  kind: 'contact' | 'question';
  name: string;
  phone: string;
  email: string;
  topic: string;
  message: string;
  carSlug?: string;
  website?: string; // honeypot
}

/** Sends a contact request and records it as a named Umami event, so the dashboard counts contacts, not just visits. */
export async function sendLead(payload: LeadPayload): Promise<void> {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Envoi impossible pour le moment.');
  }
  window.umami?.track('Formulaire envoyé', {
    type: payload.kind === 'question' ? 'question fiche' : payload.topic || 'contact',
    ...(payload.carSlug ? { vehicule: payload.carSlug } : {}),
  });
}

export function fieldsOf(form: HTMLFormElement): Record<string, string> {
  return Object.fromEntries(Array.from(new FormData(form).entries()).map(([k, v]) => [k, String(v).trim()]));
}
