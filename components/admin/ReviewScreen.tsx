'use client';

import { useState } from 'react';
import type { Car, CarInput, EquipmentGroup } from '@/lib/types';
import { BADGE_PRESETS, EQUIPMENT_GROUPS, FUELS, GEARBOXES, MONTH_LABELS, parseNumber } from '@/lib/vocab';
import { carTitle, euro } from '@/lib/format';
import type { Api } from './api';
import type { ReviewState } from './Backoffice';
import { PhotoManager } from './PhotoManager';

const BRANDS = [
  'Abarth', 'Alfa Romeo', 'Audi', 'BMW', 'Citroën', 'Cupra', 'Dacia', 'DS', 'Fiat', 'Ford', 'Honda', 'Hyundai', 'Jaguar', 'Jeep',
  'Kia', 'Land Rover', 'Lexus', 'Mazda', 'Mercedes-Benz', 'MG', 'Mini', 'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Porsche',
  'Renault', 'Seat', 'Skoda', 'Smart', 'Suzuki', 'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
];

const lines = (s: string) => s.split('\n').map((l) => l.replace(/^\s*[-•·*]\s*/, '').trim()).filter(Boolean);

export function ReviewScreen({
  review,
  api,
  onCancel,
  onPublished,
  onError,
}: {
  review: ReviewState;
  api: Api;
  onCancel: () => void;
  onPublished: (car: Car, wasEdit: boolean, draftId?: string) => void;
  onError: (text: string) => void;
}) {
  const [car, setCar] = useState<CarInput>(review.car);
  const [highlightsText, setHighlightsText] = useState(review.car.highlights.join('\n'));
  const [equipment, setEquipment] = useState<{ group: string; text: string }[]>(
    review.car.equipment.map((g) => ({ group: g.group, text: g.items.join('\n') })),
  );
  const [customBadge, setCustomBadge] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEdit = review.source === 'edit';

  const set = <K extends keyof CarInput>(k: K, v: CarInput[K]) => setCar((c) => ({ ...c, [k]: v }));
  const numField = (k: 'year' | 'price' | 'km' | 'power' | 'seats') => ({
    value: car[k] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, parseNumber(e.target.value)),
  });
  const flag = (empty: boolean) => `bo-field${empty ? ' flag' : ''}`;

  const missing = [
    !car.brandName && 'la marque',
    !car.model && 'le modèle',
    car.price == null && 'le prix',
    !car.year && 'l’année',
    car.km == null && 'le kilométrage',
    !car.fuel && 'le carburant',
    !car.gearbox && 'la boîte',
    car.photos.length === 0 && 'des photos',
  ].filter(Boolean) as string[];

  async function publish() {
    if (!car.brandName || !car.model) {
      onError('La marque et le modèle sont obligatoires.');
      window.scrollTo(0, 0);
      return;
    }
    setSaving(true);
    const payload: CarInput = {
      ...car,
      highlights: lines(highlightsText),
      equipment: equipment
        .map((g): EquipmentGroup => ({ group: g.group.trim(), items: lines(g.text) }))
        .filter((g) => g.group && g.items.length),
    };
    try {
      const { car: saved } = await api.post<{ car: Car }>('/api/admin/cars', {
        car: payload,
        draftId: review.draftId,
        originalSlug: review.originalSlug,
      });
      onPublished(saved, isEdit, review.draftId);
    } catch (e) {
      onError((e as Error).message);
      window.scrollTo(0, 0);
    } finally {
      setSaving(false);
    }
  }

  const fuelOptions = car.fuel && !(FUELS as readonly string[]).includes(car.fuel) ? [car.fuel, ...FUELS] : FUELS;
  const gearOptions = car.gearbox && !(GEARBOXES as readonly string[]).includes(car.gearbox) ? [car.gearbox, ...GEARBOXES] : GEARBOXES;

  return (
    <section>
      <button type="button" className="bo-back" onClick={onCancel}>
        ← Annuler
      </button>
      <h2 className="bo-h2">
        {isEdit ? 'Modifier' : 'Relire'} · <b>{carTitle(car) || 'nouveau véhicule'}</b>
      </h2>
      <p className="bo-lead">
        {isEdit
          ? 'Chaque champ est modifiable. Les changements sont en ligne dès l’enregistrement.'
          : 'Vérifiez chaque valeur lue, corrigez si besoin. Rien n’est publié avant « Mettre en ligne ».'}
      </p>

      {review.warnings.length > 0 && (
        <div className="bo-alert">
          À vérifier :
          <ul>
            {review.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}
      {missing.length > 0 && <div className="bo-alert">Champs vides (surlignés) : {missing.join(', ')}.</div>}

      <p className="bo-rule-title">Photos</p>
      <PhotoManager api={api} photos={car.photos} onChange={(p) => set('photos', p)} slugHint={`${car.brandName} ${car.model}`} onBusy={setUploading} />

      <p className="bo-rule-title bo-section">Le véhicule</p>
      <div className="bo-form">
        <label className={flag(!car.brandName)}>
          <span>Marque <em>*</em></span>
          <input className="bo-input" list="brands" value={car.brandName} onChange={(e) => set('brandName', e.target.value)} autoCapitalize="words" />
          <datalist id="brands">
            {BRANDS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </label>
        <label className={flag(!car.model)}>
          <span>Modèle <em>*</em></span>
          <input className="bo-input" value={car.model} onChange={(e) => set('model', e.target.value)} placeholder="Fiesta" />
        </label>
        <label className="bo-field full">
          <span>Version / motorisation</span>
          <input className="bo-input" value={car.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="1.0 EcoBoost Hybrid 125 ch" />
        </label>
        <label className={flag(!car.year)}>
          <span>Année de mise en circulation</span>
          <input className="bo-input" type="number" inputMode="numeric" min={1950} max={2100} {...numField('year')} />
        </label>
        <label className="bo-field">
          <span>Mois</span>
          <select className="bo-input" value={car.month ?? ''} onChange={(e) => set('month', e.target.value ? Number(e.target.value) : null)}>
            <option value="">—</option>
            {MONTH_LABELS.map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className={flag(car.price == null)}>
          <span>Prix affiché (€) {car.price != null && <em>· {euro(car.price)}</em>}</span>
          <input className="bo-input" type="number" inputMode="numeric" min={0} step={100} {...numField('price')} />
        </label>
        <label className={flag(car.km == null)}>
          <span>Kilométrage (km)</span>
          <input className="bo-input" type="number" inputMode="numeric" min={0} step={100} {...numField('km')} />
        </label>
        <label className={flag(!car.fuel)}>
          <span>Carburant</span>
          <select className="bo-input" value={car.fuel} onChange={(e) => set('fuel', e.target.value)}>
            <option value="">—</option>
            {fuelOptions.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className={flag(!car.gearbox)}>
          <span>Boîte de vitesses</span>
          <select className="bo-input" value={car.gearbox} onChange={(e) => set('gearbox', e.target.value)}>
            <option value="">—</option>
            {gearOptions.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="bo-field">
          <span>Puissance (ch)</span>
          <input className="bo-input" type="number" inputMode="numeric" min={0} {...numField('power')} />
        </label>
        <label className="bo-field">
          <span>Nombre de places</span>
          <input className="bo-input" type="number" inputMode="numeric" min={1} max={9} {...numField('seats')} />
        </label>
        <label className="bo-field full">
          <span>Couleur</span>
          <input className="bo-input" value={car.color} onChange={(e) => set('color', e.target.value)} placeholder="Gris magnétique métallisé" />
        </label>
      </div>

      <p className="bo-rule-title bo-section">Présentation</p>
      <div className="bo-form">
        <div className="bo-field full">
          <span>Étiquettes sur la photo (4 au maximum)</span>
          <div className="bo-chips">
            {Array.from(new Set([...BADGE_PRESETS, ...car.badges])).map((b) => {
              const on = car.badges.includes(b);
              return (
                <button
                  key={b}
                  type="button"
                  className="bo-chip"
                  aria-pressed={on}
                  onClick={() => set('badges', on ? car.badges.filter((x) => x !== b) : [...car.badges, b].slice(0, 4))}
                >
                  {b}
                </button>
              );
            })}
          </div>
          <div className="bo-actions" style={{ marginTop: 8 }}>
            <input className="bo-input" style={{ flex: '1 1 200px', width: 'auto' }} value={customBadge} onChange={(e) => setCustomBadge(e.target.value)} placeholder="Autre étiquette" />
            <button
              type="button"
              className="bo-btn sm line"
              disabled={!customBadge.trim()}
              onClick={() => {
                set('badges', [...car.badges, customBadge.trim()].slice(0, 4));
                setCustomBadge('');
              }}
            >
              Ajouter
            </button>
          </div>
        </div>
        <label className="bo-field full">
          <span>
            Phrase de résumé <em>· {car.intro.length}/120</em>
          </span>
          <input className="bo-input" value={car.intro} onChange={(e) => set('intro', e.target.value)} maxLength={300} />
        </label>
        <label className="bo-field full">
          <span>Points forts (un par ligne)</span>
          <textarea className="bo-input" rows={4} value={highlightsText} onChange={(e) => setHighlightsText(e.target.value)} placeholder={'Première main\nRévision complète 04/2026'} />
        </label>
        <label className="bo-field full">
          <span>Description</span>
          <textarea className="bo-input" rows={7} value={car.description} onChange={(e) => set('description', e.target.value)} />
        </label>
        <label className="bo-field" style={{ justifyContent: 'flex-end' }}>
          <span>Page d’accueil</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 46, fontSize: 15, color: 'inherit' }}>
            <input type="checkbox" checked={!!car.featured} onChange={(e) => set('featured', e.target.checked)} style={{ width: 20, height: 20 }} />
            Mettre dans « Nos voitures du moment »
          </span>
        </label>
        <label className="bo-field">
          <span>Visibilité</span>
          <select className="bo-input" value={car.status} onChange={(e) => set('status', e.target.value as CarInput['status'])}>
            <option value="available">En vente</option>
            <option value="sold">Vendu (reste visible avec l’étiquette « Vendu »)</option>
            <option value="hidden">Masqué (invisible sur le site)</option>
          </select>
        </label>
      </div>

      <p className="bo-rule-title bo-section">Options & équipements</p>
      {equipment.map((g, i) => (
        <div key={i} className="bo-eq">
          <div className="bo-eq-head">
            <input
              className="bo-input"
              value={g.group}
              aria-label="Nom du groupe"
              onChange={(e) => setEquipment((list) => list.map((x, k) => (k === i ? { ...x, group: e.target.value } : x)))}
            />
            <button type="button" className="bo-btn sm danger" onClick={() => setEquipment((list) => list.filter((_, k) => k !== i))}>
              Retirer
            </button>
          </div>
          <textarea
            className="bo-input"
            rows={Math.min(10, Math.max(3, g.text.split('\n').length + 1))}
            value={g.text}
            aria-label={`Équipements · ${g.group}`}
            placeholder="Un équipement par ligne"
            onChange={(e) => setEquipment((list) => list.map((x, k) => (k === i ? { ...x, text: e.target.value } : x)))}
          />
        </div>
      ))}
      <div className="bo-actions" style={{ marginTop: 12 }}>
        {EQUIPMENT_GROUPS.filter((g) => !equipment.some((e) => e.group === g.label)).map((g) => (
          <button key={g.key} type="button" className="bo-btn sm line" onClick={() => setEquipment((list) => [...list, { group: g.label, text: '' }])}>
            + {g.label}
          </button>
        ))}
        <button type="button" className="bo-btn sm line" onClick={() => setEquipment((list) => [...list, { group: 'Autres équipements', text: '' }])}>
          + Autre groupe
        </button>
      </div>

      {review.unknown.length > 0 && (
        <>
          <p className="bo-rule-title bo-section">Lignes non reconnues</p>
          <div className="bo-unknown">
            <p className="bo-hint" style={{ margin: '0 0 10px' }}>
              Ces informations ne correspondent à aucun champ de la fiche. Recopiez-les dans la description si elles sont utiles.
            </p>
            <dl style={{ margin: 0 }}>
              {review.unknown.map((u) => (
                <div key={u.key}>
                  <dt>{u.key}</dt>
                  <dd>{u.value || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </>
      )}

      <div className="bo-sticky">
        <button type="button" className="bo-btn line" onClick={onCancel} disabled={saving}>
          Annuler
        </button>
        <button type="button" className="bo-btn gold" onClick={publish} disabled={saving || uploading}>
          {saving ? 'Publication…' : uploading ? 'Photos en cours d’envoi…' : isEdit ? 'Enregistrer' : 'Mettre en ligne'}
        </button>
      </div>
    </section>
  );
}
