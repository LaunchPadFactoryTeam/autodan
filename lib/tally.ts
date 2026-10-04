/**
 * Door 1 of the backoffice: maps a Tally submission onto a car.
 *
 * Accepts both shapes Tally produces:
 *  - the webhook body:  { data: { submissionId, fields: [{ label, type, value, options? }] } }
 *  - the embed message: { id, fields: [{ title, type, answer: { value } }] } (event "Tally.FormSubmitted")
 *
 * Questions are matched on their title, so the form in docs/TALLY.md can be reworded
 * as long as the keyword stays (« marque », « prix », « kilométrage »…).
 */
import type { CarInput, UnknownLine } from './types';
import { emptyCar } from './seed';
import { EQUIPMENT_GROUPS, fold, normalizeFuel, normalizeGearbox, parseMonth, parseNumber } from './vocab';

interface RawField {
  label?: string;
  title?: string;
  type?: string;
  value?: unknown;
  answer?: { value?: unknown; raw?: unknown };
  options?: { id: string; text: string }[];
}

interface NormalField {
  label: string;
  texts: string[];
  files: string[];
}

function normalizeField(f: RawField): NormalField | null {
  const label = (f.label ?? f.title ?? '').trim();
  let v: unknown = f.value !== undefined ? f.value : f.answer?.value ?? f.answer?.raw;
  // Per-option sub-fields of a checkbox question carry a boolean: the parent already has the list.
  if (typeof v === 'boolean' || v == null || label === '') return null;
  const arr = Array.isArray(v) ? v : [v];
  const texts: string[] = [];
  const files: string[] = [];
  for (const item of arr) {
    if (item && typeof item === 'object' && 'url' in item && typeof (item as { url: unknown }).url === 'string') {
      files.push((item as { url: string }).url);
    } else if (typeof item === 'string' || typeof item === 'number') {
      const s = String(item);
      const opt = f.options?.find((o) => o.id === s);
      texts.push(opt ? opt.text : s);
    }
  }
  return { label, texts, files };
}

function lines(texts: string[]): string[] {
  return texts
    .flatMap((t) => t.split('\n'))
    .map((t) => t.replace(/^\s*[-•·*]\s*/, '').trim())
    .filter(Boolean);
}

function equipmentLabel(l: string): string {
  if (l.includes('interieur') || l.includes('confort')) return EQUIPMENT_GROUPS[0].label;
  if (l.includes('exterieur')) return EQUIPMENT_GROUPS[1].label;
  if (l.includes('conduite')) return EQUIPMENT_GROUPS[2].label;
  if (l.includes('securite')) return EQUIPMENT_GROUPS[3].label;
  return 'Équipements';
}

export interface TallyMapping {
  externalId: string;
  car: CarInput;
  unknown: UnknownLine[];
}

export function mapTallySubmission(body: unknown): TallyMapping {
  const b = (body ?? {}) as { data?: { submissionId?: string; responseId?: string; fields?: RawField[] }; id?: string; fields?: RawField[] };
  const fields = b.data?.fields ?? b.fields ?? [];
  const externalId = b.data?.submissionId ?? b.data?.responseId ?? b.id ?? '';
  const car = emptyCar();
  const unknown: UnknownLine[] = [];

  for (const raw of fields) {
    const f = normalizeField(raw);
    if (!f) continue;
    const l = fold(f.label);
    const text = f.texts.join(' ').trim();
    if (!text && !f.files.length) continue;

    if (f.files.length || l.includes('photo')) car.photos.push(...f.files);
    else if (l.includes('mois')) car.month = parseMonth(text);
    else if (l.includes('autres equipements')) {
      const items = lines(f.texts).flatMap((t) => t.split(/\s*[;,]\s*/)).filter(Boolean);
      if (items.length) car.equipment.push({ group: 'Autres équipements', items });
    } else if (l.includes('equipement')) {
      const group = equipmentLabel(l);
      const existing = car.equipment.find((g) => g.group === group);
      if (existing) existing.items.push(...lines(f.texts));
      else car.equipment.push({ group, items: lines(f.texts) });
    } else if (l.includes('marque')) car.brandName = text;
    else if ((l.includes('version') || l.includes('motorisation')) && !l.includes('modele')) car.subtitle = text;
    else if (l.includes('modele')) car.model = text;
    else if (l.includes('annee') || l.includes('circulation')) {
      const y = text.match(/(?:19|20)\d{2}/);
      car.year = y ? Number(y[0]) : null;
    } else if (l.includes('prix')) car.price = parseNumber(text);
    else if (l.includes('kilometr')) car.km = parseNumber(text);
    else if (l.includes('carburant') || l.includes('energie')) car.fuel = normalizeFuel(text) || text;
    else if (l.includes('boite')) car.gearbox = normalizeGearbox(text) || text;
    else if (l.includes('puissance')) car.power = parseNumber(text);
    else if (l.includes('couleur')) car.color = text;
    else if (l.includes('places')) car.seats = parseNumber(text);
    else if (l.includes('resume') || l.includes('phrase') || l.includes('accroche')) car.intro = text;
    else if (l.includes('points forts')) car.highlights = lines(f.texts);
    else if (l.includes('etiquette') || l.includes('badge')) car.badges = f.texts;
    else if (l.includes('description')) car.description = f.texts.join('\n').trim();
    else unknown.push({ key: f.label, value: f.texts.join(', ') });
  }
  car.equipment = car.equipment.filter((g) => g.items.length);
  return { externalId, car, unknown };
}
