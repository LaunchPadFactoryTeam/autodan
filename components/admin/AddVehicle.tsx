'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { parsePaste } from '@/lib/parse-paste';
import { LLM_PROMPT, PASTE_EXAMPLE } from '@/lib/prompt';
import { emptyCar } from '@/lib/seed';
import { carTitle } from '@/lib/format';
import type { Draft } from '@/lib/types';
import type { Api } from './api';
import type { BackofficeConfig, ReviewState } from './Backoffice';
import { PhotoManager } from './PhotoManager';

declare global {
  interface Window {
    Tally?: { loadEmbeds: () => void };
  }
}

type Door = null | 'tally' | 'paste';

export function AddVehicle({
  api,
  config,
  drafts,
  setDrafts,
  onReview,
}: {
  api: Api;
  config: BackofficeConfig;
  drafts: Draft[];
  setDrafts: React.Dispatch<React.SetStateAction<Draft[]>>;
  onReview: (r: ReviewState) => void;
}) {
  const [door, setDoor] = useState<Door>(null);

  const openDraft = (d: Draft) =>
    onReview({ car: d.car, source: d.source, draftId: d.id, unknown: d.unknown, warnings: [] });

  return (
    <>
      {drafts.length > 0 && !door && (
        <section style={{ marginBottom: 32 }}>
          <p className="bo-rule-title">À relire avant mise en ligne</p>
          <div className="bo-list">
            {drafts.map((d) => (
              <div key={d.id} className="bo-row" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
                <div>
                  <p className="name">{carTitle(d.car) || 'Véhicule sans nom'}</p>
                  <p className="meta">
                    Reçu via {d.source === 'tally' ? 'le formulaire' : 'collage'} le {new Date(d.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })} ·{' '}
                    {d.car.photos.length} photo{d.car.photos.length > 1 ? 's' : ''}
                  </p>
                  <div className="controls">
                    <button type="button" className="bo-btn sm gold" onClick={() => openDraft(d)}>
                      Relire et publier
                    </button>
                    <button
                      type="button"
                      className="bo-btn sm danger"
                      onClick={async () => {
                        if (!confirm('Supprimer ce brouillon ?')) return;
                        await api.del(`/api/admin/drafts/${d.id}`);
                        setDrafts((list) => list.filter((x) => x.id !== d.id));
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!door && (
        <>
          <h2 className="bo-h2">
            Ajouter un véhicule : <b>choisissez votre porte</b>
          </h2>
          <p className="bo-lead">Les deux mènent au même écran de relecture. Rien n’est publié tant que vous n’appuyez pas sur « Mettre en ligne ».</p>
          <div className="bo-doors">
            <button type="button" className="bo-door" onClick={() => setDoor('tally')}>
              <span className="k">Porte 1</span>
              <span className="t">Remplir les informations champ par champ</span>
              <span className="d">Le formulaire : listes déroulantes, cases à cocher, dépôt des photos. Le chemin de référence, toujours disponible.</span>
            </button>
            <button type="button" className="bo-door dark" onClick={() => setDoor('paste')}>
              <span className="k">Porte 2</span>
              <span className="t">Coller le contenu</span>
              <span className="d">Déposez les photos, collez le bloc « clé : valeur » préparé par votre assistant à partir de votre annonce.</span>
            </button>
          </div>
        </>
      )}

      {door === 'tally' && <TallyDoor api={api} formId={config.tallyFormId} setDrafts={setDrafts} onBack={() => setDoor(null)} onReview={onReview} />}
      {door === 'paste' && <PasteDoor api={api} onBack={() => setDoor(null)} onReview={onReview} />}
    </>
  );
}

function TallyDoor({
  api,
  formId,
  setDrafts,
  onBack,
  onReview,
}: {
  api: Api;
  formId: string;
  setDrafts: React.Dispatch<React.SetStateAction<Draft[]>>;
  onBack: () => void;
  onReview: (r: ReviewState) => void;
}) {
  const [status, setStatus] = useState<'idle' | 'importing' | 'error'>('idle');
  const [error, setError] = useState('');
  const handled = useRef(false);

  useEffect(() => {
    if (!formId) return;
    window.Tally?.loadEmbeds();
    async function onMessage(e: MessageEvent) {
      if (typeof e.origin !== 'string' || !e.origin.endsWith('tally.so')) return;
      let data: { event?: string; payload?: unknown } | null = null;
      try {
        data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (data?.event !== 'Tally.FormSubmitted' || handled.current) return;
      handled.current = true;
      setStatus('importing');
      try {
        const { draft } = await api.post<{ draft: Draft }>('/api/admin/drafts', { payload: data.payload });
        setDrafts((list) => [draft, ...list.filter((d) => d.id !== draft.id)]);
        onReview({ car: draft.car, source: 'tally', draftId: draft.id, unknown: draft.unknown, warnings: [] });
      } catch (err) {
        handled.current = false;
        setError((err as Error).message);
        setStatus('error');
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [api, formId, onReview, setDrafts]);

  return (
    <section>
      <button type="button" className="bo-back" onClick={onBack}>
        ← Changer de porte
      </button>
      <h2 className="bo-h2">
        Porte 1 · <b>champ par champ</b>
      </h2>
      {!formId ? (
        <>
          <div className="bo-alert">
            Le formulaire Tally n’est pas encore relié (variable <span className="bo-mono">NEXT_PUBLIC_TALLY_FORM_ID</span>, voir docs/TALLY.md). En attendant, le
            même formulaire est disponible directement ici.
          </div>
          <button
            type="button"
            className="bo-btn gold"
            onClick={() => onReview({ car: emptyCar(), source: 'manual', unknown: [], warnings: [] })}
          >
            Ouvrir le formulaire intégré
          </button>
        </>
      ) : (
        <>
          <p className="bo-lead">Répondez aux questions puis validez : la fiche s’ouvre aussitôt en relecture.</p>
          {status === 'importing' && <div className="bo-alert">Réception des réponses…</div>}
          {status === 'error' && <div className="bo-alert error">{error} — la fiche apparaîtra aussi dans « À relire » dès que Tally l’aura transmise.</div>}
          <Script src="https://tally.so/widgets/embed.js" strategy="afterInteractive" onLoad={() => window.Tally?.loadEmbeds()} />
          <iframe
            data-tally-src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
            src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
            loading="lazy"
            width="100%"
            height={900}
            title="Ajouter un véhicule"
            style={{ border: 0, background: 'transparent' }}
          />
          <p className="bo-hint" style={{ marginTop: 16 }}>
            Pas de connexion à Tally ?{' '}
            <button type="button" className="bo-link" onClick={() => onReview({ car: emptyCar(), source: 'manual', unknown: [], warnings: [] })}>
              Utiliser le formulaire intégré
            </button>
          </p>
        </>
      )}
    </section>
  );
}

function PasteDoor({ api, onBack, onReview }: { api: Api; onBack: () => void; onReview: (r: ReviewState) => void }) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const analyse = () => {
    const { car, unknown, warnings } = parsePaste(text);
    car.photos = photos;
    onReview({ car, source: 'paste', unknown, warnings });
  };

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(LLM_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert('Copie impossible : sélectionnez le texte de la consigne à la main.');
    }
  };

  return (
    <section>
      <button type="button" className="bo-back" onClick={onBack}>
        ← Changer de porte
      </button>
      <h2 className="bo-h2">
        Porte 2 · <b>coller le contenu</b>
      </h2>
      <p className="bo-lead">Deux gestes : déposez les photos, collez le bloc de texte. La première photo devient le visuel principal.</p>

      <p className="bo-rule-title">1 · Les photos</p>
      <PhotoManager api={api} photos={photos} onChange={setPhotos} slugHint="brouillon" onBusy={setUploading} />

      <p className="bo-rule-title" style={{ marginTop: 32 }}>
        2 · Le texte
      </p>
      <details style={{ marginBottom: 14 }}>
        <summary style={{ cursor: 'pointer', fontSize: 14.5, fontWeight: 500 }}>Pas encore de bloc ? La consigne à donner à votre assistant</summary>
        <p className="bo-hint" style={{ margin: '10px 0' }}>
          Collez cette consigne dans ChatGPT, Claude, Gemini… suivie de votre annonce Leboncoin. Copiez sa réponse ici.
        </p>
        <pre className="bo-pre">{LLM_PROMPT}</pre>
        <div className="bo-actions" style={{ marginTop: 10 }}>
          <button type="button" className="bo-btn sm" onClick={copyPrompt}>
            {copied ? 'Consigne copiée ✓' : 'Copier la consigne'}
          </button>
        </div>
      </details>
      <label className="bo-field">
        <span>Bloc « clé : valeur »</span>
        <textarea
          className="bo-input mono"
          rows={14}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PASTE_EXAMPLE}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
      </label>
      <div className="bo-sticky">
        <button type="button" className="bo-btn gold" disabled={!text.trim() || uploading} onClick={analyse}>
          {uploading ? 'Photos en cours d’envoi…' : 'Lire le texte et relire la fiche'}
        </button>
      </div>
    </section>
  );
}
