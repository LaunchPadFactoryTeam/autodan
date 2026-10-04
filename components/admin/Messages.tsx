'use client';

import type { Message } from '@/lib/types';
import type { Api } from './api';

export function Messages({
  api,
  messages,
  setMessages,
  onFlash,
}: {
  api: Api;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onFlash: (f: { kind: 'ok' | 'error'; text: string } | null) => void;
}) {
  async function remove(m: Message) {
    if (!confirm(`Supprimer le message de ${m.name} ?`)) return;
    try {
      await api.del(`/api/admin/messages?id=${encodeURIComponent(m.id)}`);
      setMessages((list) => list.filter((x) => x.id !== m.id));
    } catch (e) {
      onFlash({ kind: 'error', text: (e as Error).message });
    }
  }

  return (
    <section>
      <h2 className="bo-h2">
        Messages · <b>{messages.length}</b>
      </h2>
      <p className="bo-lead">Les demandes envoyées depuis le formulaire de contact et les questions posées sur les fiches.</p>
      {messages.length === 0 ? (
        <p className="bo-empty">Aucun message pour l’instant.</p>
      ) : (
        <div className="bo-list">
          {messages.map((m) => (
            <article key={m.id} className="bo-msg">
              <div className="head">
                <span className="who">{m.name}</span>
                <span className="when">{new Date(m.createdAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
              <p className="topic">
                {m.kind === 'question' ? (
                  <>
                    Question sur{' '}
                    {m.carSlug ? (
                      <a href={`/voitures/${m.carSlug}`} target="_blank" rel="noopener">
                        {m.carTitle ?? m.carSlug}
                      </a>
                    ) : (
                      m.topic
                    )}
                  </>
                ) : (
                  m.topic
                )}
              </p>
              {m.message && <p className="body">{m.message}</p>}
              <div className="bo-actions">
                {m.phone && (
                  <>
                    <a className="bo-btn sm" href={`tel:${m.phone.replace(/[^\d+]/g, '')}`}>
                      Appeler {m.phone}
                    </a>
                    <a className="bo-btn sm line" href={`sms:${m.phone.replace(/[^\d+]/g, '')}`}>
                      SMS
                    </a>
                  </>
                )}
                {m.email && (
                  <a className="bo-btn sm line" href={`mailto:${m.email}?subject=${encodeURIComponent('Autodan — ' + (m.carTitle ?? m.topic))}`}>
                    Répondre par e-mail
                  </a>
                )}
                <button type="button" className="bo-btn sm danger" onClick={() => remove(m)}>
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
