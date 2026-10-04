'use client';

import { useEffect, useState } from 'react';
import { fieldsOf, sendLead } from './lead';

const TOPIC_PRESETS: Record<string, string> = {
  vendre: 'Vendre / faire estimer ma voiture',
  recherche: 'Recherche personnalisée',
  depot: 'Dépôt-vente',
};

export function ContactForm({ topics, tel }: { topics: string[]; tel: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');
  const [topic, setTopic] = useState(topics[0]);

  // "/contact?demande=vendre" preselects the topic; read client-side so the page stays static.
  useEffect(() => {
    const preset = TOPIC_PRESETS[new URLSearchParams(window.location.search).get('demande') ?? ''];
    if (preset) setTopic(preset);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = fieldsOf(e.currentTarget);
    setState('sending');
    setError('');
    try {
      await sendLead({ kind: 'contact', name: f.name, phone: f.phone, email: f.email, topic: f.topic, message: f.message, website: f.website });
      setState('sent');
    } catch (err) {
      setError((err as Error).message);
      setState('idle');
    }
  }

  if (state === 'sent') {
    return (
      <div className="contact-sent" role="status">
        <p className="t">Message envoyé.</p>
        <p className="d">Autodan vous répond sous 24 h ouvrées. Pour une réponse immédiate, appelez le {tel}.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={onSubmit}>
      <label>
        <span>Nom et prénom</span>
        <input name="name" type="text" autoComplete="name" required />
      </label>
      <label>
        <span>Téléphone</span>
        <input name="phone" type="tel" autoComplete="tel" inputMode="tel" />
      </label>
      <label>
        <span>E-mail</span>
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        <span>Votre demande</span>
        <select name="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
          {topics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="full">
        <span>Message</span>
        <textarea name="message" rows={5} />
      </label>
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error && (
        <p className="form-error full" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={state === 'sending'} style={{ padding: '16px 30px' }}>
        {state === 'sending' ? 'Envoi…' : 'Envoyer ma demande'}
      </button>
    </form>
  );
}
