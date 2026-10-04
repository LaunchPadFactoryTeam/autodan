'use client';

import { useMemo, useState } from 'react';
import type { Car, CarInput, Draft, Message, UnknownLine } from '@/lib/types';
import type { UmamiSummary } from '@/lib/umami';
import { makeApi } from './api';
import { AddVehicle } from './AddVehicle';
import { ReviewScreen } from './ReviewScreen';
import { StockList } from './StockList';
import { Messages } from './Messages';
import { Stats } from './Stats';

export interface BackofficeConfig {
  siteUrl: string;
  storageReady: boolean;
  tallyFormId: string;
  umamiShareUrl: string;
  umamiConfigured: boolean;
}

export interface ReviewState {
  car: CarInput;
  source: 'paste' | 'tally' | 'manual' | 'edit';
  draftId?: string;
  originalSlug?: string;
  unknown: UnknownLine[];
  warnings: string[];
}

type Tab = 'add' | 'stock' | 'messages' | 'stats';

export function Backoffice(props: {
  token: string;
  initialCars: Car[];
  initialDrafts: Draft[];
  initialMessages: Message[];
  stats: UmamiSummary;
  config: BackofficeConfig;
}) {
  const api = useMemo(() => makeApi(props.token), [props.token]);
  const [tab, setTab] = useState<Tab>('add');
  const [cars, setCars] = useState(props.initialCars);
  const [drafts, setDrafts] = useState(props.initialDrafts);
  const [messages, setMessages] = useState(props.initialMessages);
  const [review, setReview] = useState<ReviewState | null>(null);
  const [flash, setFlash] = useState<{ kind: 'ok' | 'error'; text: string; href?: string } | null>(null);

  const open = (r: ReviewState) => {
    setFlash(null);
    setReview(r);
    window.scrollTo(0, 0);
  };

  const onPublished = (car: Car, wasEdit: boolean, draftId?: string) => {
    setCars((list) => (wasEdit ? list.map((c) => (c.slug === car.slug ? car : c)) : [car, ...list]));
    if (draftId) setDrafts((d) => d.filter((x) => x.id !== draftId));
    setReview(null);
    setTab('stock');
    setFlash({
      kind: 'ok',
      text: wasEdit ? 'Fiche mise à jour. Le site est régénéré.' : 'Fiche en ligne. Le site est régénéré.',
      href: car.status === 'hidden' ? undefined : `/voitures/${car.slug}`,
    });
    window.scrollTo(0, 0);
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'add', label: 'Ajouter un véhicule', count: drafts.length || undefined },
    { id: 'stock', label: 'Stock', count: cars.length },
    { id: 'messages', label: 'Messages', count: messages.length || undefined },
    { id: 'stats', label: 'Statistiques' },
  ];

  return (
    <>
      <header className="bo-top">
        <div className="bo-top-inner">
          <p className="bo-kicker">Autodan · Gestion</p>
          <h1 className="bo-title">
            Votre site, <b>sans toucher au site</b>.
          </h1>
          <nav className="bo-tabs" role="tablist" aria-label="Sections">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                type="button"
                className="bo-tab"
                aria-selected={!review && tab === t.id}
                onClick={() => {
                  setReview(null);
                  setFlash(null);
                  setTab(t.id);
                }}
              >
                {t.label}
                {t.count != null && <span className="count">{t.count}</span>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="bo-main">
        {!props.config.storageReady && (
          <div className="bo-alert error">
            Le stockage n’est pas encore branché : rien ne peut être enregistré. Dans Vercel, ouvrez le projet → <b>Storage</b> → créez un
            store <b>Blob</b> et connectez-le au projet, puis redéployez.
          </div>
        )}
        {flash && (
          <div className={`bo-alert ${flash.kind}`} role="status">
            {flash.text}{' '}
            {flash.href && (
              <a href={flash.href} target="_blank" rel="noopener">
                Voir la fiche →
              </a>
            )}
          </div>
        )}

        {review ? (
          <ReviewScreen
            key={review.originalSlug ?? review.draftId ?? 'new'}
            review={review}
            api={api}
            onCancel={() => setReview(null)}
            onPublished={onPublished}
            onError={(text) => setFlash({ kind: 'error', text })}
          />
        ) : tab === 'add' ? (
          <AddVehicle api={api} config={props.config} drafts={drafts} setDrafts={setDrafts} onReview={open} />
        ) : tab === 'stock' ? (
          <StockList
            api={api}
            cars={cars}
            setCars={setCars}
            onEdit={(car) => open({ car, source: 'edit', originalSlug: car.slug, unknown: [], warnings: [] })}
            onFlash={setFlash}
          />
        ) : tab === 'messages' ? (
          <Messages api={api} messages={messages} setMessages={setMessages} onFlash={setFlash} />
        ) : (
          <Stats stats={props.stats} cars={cars} config={props.config} />
        )}
      </main>
    </>
  );
}
