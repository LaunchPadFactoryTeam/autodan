'use client';

import { useState } from 'react';
import type { Car, CarStatus } from '@/lib/types';
import { carTitle, euro, kmLabel } from '@/lib/format';
import { parseNumber } from '@/lib/vocab';
import type { Api } from './api';

const STATUS_LABEL: Record<CarStatus, string> = { available: 'En vente', sold: 'Vendu', hidden: 'Masqué' };

export function StockList({
  api,
  cars,
  setCars,
  onEdit,
  onFlash,
}: {
  api: Api;
  cars: Car[];
  setCars: React.Dispatch<React.SetStateAction<Car[]>>;
  onEdit: (car: Car) => void;
  onFlash: (f: { kind: 'ok' | 'error'; text: string } | null) => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, string>>({});

  async function patch(slug: string, body: { status?: CarStatus; price?: number | null }, ok: string) {
    setBusy(slug);
    try {
      const { car } = await api.patch<{ car: Car }>(`/api/admin/cars/${slug}`, body);
      setCars((list) => list.map((c) => (c.slug === slug ? car : c)));
      onFlash({ kind: 'ok', text: ok });
    } catch (e) {
      onFlash({ kind: 'error', text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function remove(car: Car) {
    if (!confirm(`Supprimer définitivement « ${carTitle(car)} » et ses photos ?\n\nPour garder la fiche visible avec l’étiquette « Vendu », choisissez plutôt le statut Vendu.`)) return;
    setBusy(car.slug);
    try {
      await api.del(`/api/admin/cars/${car.slug}`);
      setCars((list) => list.filter((c) => c.slug !== car.slug));
      onFlash({ kind: 'ok', text: `${carTitle(car)} supprimé.` });
    } catch (e) {
      onFlash({ kind: 'error', text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  if (!cars.length) return <p className="bo-empty">Aucun véhicule pour le moment. Ajoutez-en un depuis l’onglet « Ajouter un véhicule ».</p>;

  return (
    <section>
      <h2 className="bo-h2">
        Le stock · <b>{cars.filter((c) => c.status === 'available').length} en vente</b>
      </h2>
      <p className="bo-lead">Changez un prix ou passez un véhicule en « Vendu » en un geste. Pour tout le reste : « Modifier ».</p>
      <div className="bo-list">
        {cars.map((car) => {
          const priceDraft = prices[car.slug] ?? (car.price != null ? String(car.price) : '');
          const priceChanged = parseNumber(priceDraft) !== car.price;
          return (
            <article key={car.slug} className="bo-row" aria-busy={busy === car.slug}>
              {car.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="thumb" src={car.photos[0]} alt="" loading="lazy" />
              ) : (
                <div className="thumb" />
              )}
              <div>
                <p className="name">
                  {carTitle(car)} {car.year}
                  <span className={`bo-status ${car.status}`}>{STATUS_LABEL[car.status]}</span>
                </p>
                <p className="meta">{[car.subtitle, euro(car.price), kmLabel(car.km)].filter(Boolean).join(' · ')}</p>
                <div className="controls">
                  <select
                    className="bo-input"
                    aria-label="Statut"
                    value={car.status}
                    disabled={busy === car.slug}
                    onChange={(e) => patch(car.slug, { status: e.target.value as CarStatus }, `${carTitle(car)} : ${STATUS_LABEL[e.target.value as CarStatus]}.`)}
                  >
                    {Object.entries(STATUS_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <input
                    className="bo-input"
                    style={{ width: 110 }}
                    type="number"
                    inputMode="numeric"
                    aria-label="Prix"
                    value={priceDraft}
                    onChange={(e) => setPrices((p) => ({ ...p, [car.slug]: e.target.value }))}
                  />
                  {priceChanged && (
                    <button
                      type="button"
                      className="bo-btn sm gold"
                      disabled={busy === car.slug}
                      onClick={() => patch(car.slug, { price: parseNumber(priceDraft) }, `Nouveau prix : ${euro(parseNumber(priceDraft))}.`)}
                    >
                      Valider le prix
                    </button>
                  )}
                  <button type="button" className="bo-btn sm" onClick={() => onEdit(car)}>
                    Modifier
                  </button>
                  {car.status !== 'hidden' && (
                    <a className="bo-btn sm line" href={`/voitures/${car.slug}`} target="_blank" rel="noopener">
                      Voir
                    </a>
                  )}
                  <button type="button" className="bo-btn sm danger" disabled={busy === car.slug} onClick={() => remove(car)}>
                    Supprimer
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
