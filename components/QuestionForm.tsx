'use client';

import { useState } from 'react';
import { fieldsOf, sendLead } from './lead';

export function QuestionForm({ carSlug, carTitle, tel }: { carSlug: string; carTitle: string; tel: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = fieldsOf(e.currentTarget);
    setState('sending');
    setError('');
    try {
      await sendLead({ kind: 'question', name: f.name, phone: f.phone, email: '', topic: carTitle, message: f.message, carSlug, website: f.website });
      setState('sent');
    } catch (err) {
      setError((err as Error).message);
      setState('idle');
    }
  }

  return (
    <div className="ask-box" id="question">
      {state === 'sent' ? (
        <div role="status">
          <p className="sent-t">Message envoyé.</p>
          <p className="sent-d">Autodan vous rappelle au plus vite. Pour une réponse immédiate : {tel}.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <p className="t">Poser une question</p>
          <label className="sr-only" htmlFor="q-name">Votre nom</label>
          <input id="q-name" name="name" type="text" placeholder="Votre nom" autoComplete="name" required />
          <label className="sr-only" htmlFor="q-phone">Votre téléphone</label>
          <input id="q-phone" name="phone" type="tel" placeholder="Votre téléphone" autoComplete="tel" inputMode="tel" required />
          <label className="sr-only" htmlFor="q-msg">Votre message</label>
          <textarea id="q-msg" name="message" rows={3} placeholder="Votre message" />
          <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={state === 'sending'}>
            {state === 'sending' ? 'Envoi…' : 'Envoyer ma question'}
          </button>
        </form>
      )}
    </div>
  );
}
