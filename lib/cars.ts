import { cache } from 'react';
import { readCars } from './store';
import type { Car, CarInput } from './types';
import { carTitle } from './format';
import { normalizeFuel, normalizeGearbox, slugify } from './vocab';

/** Cars shown on the public site: available first (newest first), sold after, hidden never. */
export const getPublicCars = cache(async (): Promise<Car[]> => {
  const cars = await readCars();
  const rank = (c: Car) => (c.status === 'available' ? 0 : 1);
  return cars
    .filter((c) => c.status !== 'hidden')
    .sort((a, b) => rank(a) - rank(b) || b.createdAt.localeCompare(a.createdAt));
});

/**
 * « Nos voitures du moment » on the home page: the cars ticked in the backoffice.
 * Until none is ticked, the newest cars stand in so the section is never empty.
 */
export async function getHomeCars(limit = 6): Promise<Car[]> {
  const cars = await getPublicCars();
  const featured = cars.filter((c) => c.featured);
  return (featured.length ? featured : cars).slice(0, limit);
}

export async function getPublicCar(slug: string): Promise<Car | undefined> {
  return (await getPublicCars()).find((c) => c.slug === slug);
}

export function uniqueSlug(input: Pick<CarInput, 'brandName' | 'model' | 'year'>, taken: string[]): string {
  const base = slugify([carTitle(input), input.year].filter(Boolean).join(' ')) || 'vehicule';
  let slug = base;
  for (let i = 2; taken.includes(slug); i++) slug = `${base}-${i}`;
  return slug;
}

const str = (v: unknown, max = 5000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.round(v) : null);
const strList = (v: unknown, max = 200) =>
  Array.isArray(v) ? v.map((x) => str(x, max)).filter(Boolean).slice(0, 200) : [];

/** Validates what the review screen sends. Never trusts the client's shape. */
export function sanitizeCarInput(raw: unknown): CarInput {
  const r = (raw ?? {}) as Record<string, unknown>;
  const status = r.status === 'sold' || r.status === 'hidden' ? r.status : 'available';
  return {
    slug: str(r.slug, 100) || undefined,
    status,
    featured: r.featured === true,
    brandName: str(r.brandName, 60),
    model: str(r.model, 80),
    subtitle: str(r.subtitle, 160),
    year: num(r.year),
    month: num(r.month) && num(r.month)! >= 1 && num(r.month)! <= 12 ? num(r.month) : null,
    price: num(r.price),
    km: num(r.km),
    fuel: normalizeFuel(str(r.fuel)) || str(r.fuel, 40),
    gearbox: normalizeGearbox(str(r.gearbox)) || str(r.gearbox, 40),
    power: num(r.power),
    color: str(r.color, 80),
    seats: num(r.seats),
    badges: strList(r.badges, 40).slice(0, 4),
    photos: strList(r.photos, 1000).slice(0, 30),
    intro: str(r.intro, 300),
    description: str(r.description, 8000),
    highlights: strList(r.highlights),
    equipment: Array.isArray(r.equipment)
      ? r.equipment
          .map((g) => ({ group: str((g as Record<string, unknown>)?.group, 80), items: strList((g as Record<string, unknown>)?.items) }))
          .filter((g) => g.group && g.items.length)
      : [],
  };
}
