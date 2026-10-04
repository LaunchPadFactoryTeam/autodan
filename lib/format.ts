import type { Car, CarInput } from './types';
import { MONTH_LABELS } from './vocab';

const nf = new Intl.NumberFormat('fr-FR');

/** fr-FR formats with a narrow no-break space; plain spaces read the same and copy better. */
const fmt = (n: number) => nf.format(n).replace(/[  ]/g, ' ');

export const euro = (n: number | null | undefined) => (n == null ? 'Prix sur demande' : fmt(n) + ' €');
export const kmLabel = (n: number | null | undefined) => (n == null ? '' : fmt(n) + ' km');
export const powerLabel = (n: number | null | undefined) => (n == null ? '' : n + ' ch');

export function carTitle(c: Pick<CarInput, 'brandName' | 'model'>): string {
  const brand = (c.brandName || '').trim();
  const model = (c.model || '').trim();
  if (!brand) return model;
  if (model.toLowerCase().startsWith(brand.toLowerCase())) return model;
  return `${brand} ${model}`.trim();
}

export function dateLabel(c: Pick<Car, 'year' | 'month'>): string {
  if (!c.year) return '';
  return c.month ? `${MONTH_LABELS[c.month - 1]} ${c.year}` : String(c.year);
}

/** The pills under a card: year, km, fuel, gearbox, power. */
export function carChips(c: Car): string[] {
  return [c.year ? String(c.year) : '', kmLabel(c.km), c.fuel, c.gearbox, powerLabel(c.power)].filter(Boolean);
}

export function carSpecs(c: Car): { label: string; value: string }[] {
  return [
    { label: 'Année', value: dateLabel(c) },
    { label: 'Marque', value: c.brandName },
    { label: 'Modèle', value: c.model },
    { label: 'Carburant', value: c.fuel },
    { label: 'Puissance', value: powerLabel(c.power) },
    { label: 'Kilométrage', value: kmLabel(c.km) },
    { label: 'Boîte', value: c.gearbox },
    { label: 'Couleur', value: c.color },
    { label: 'Places', value: c.seats ? String(c.seats) : '' },
  ].filter((s) => s.value);
}

/** Badges as displayed: a sold car shows "Vendu" first. */
export function displayBadges(c: Car): string[] {
  return c.status === 'sold' ? ['Vendu'] : c.badges;
}

export function metaDescription(c: Car): string {
  const bits = [carTitle(c), c.subtitle, dateLabel(c), kmLabel(c.km), c.fuel, c.gearbox].filter(Boolean).join(' · ');
  const tail = c.price != null ? ` — ${euro(c.price)} chez Autodan à Nice.` : ' — chez Autodan à Nice.';
  const text = (c.intro ? c.intro + ' ' : '') + bits + tail;
  return text.length > 300 ? text.slice(0, 297) + '…' : text;
}
