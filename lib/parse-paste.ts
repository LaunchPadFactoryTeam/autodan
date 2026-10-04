/**
 * Door 2 of the backoffice: turns a pasted "clé : valeur" block into a car.
 *
 * Tolerates accents, case, spaces around ":", numbers written as read ("13 900 €"),
 * keys in any order, blank lines, "-" / "•" / "·" bullets and emoji separators.
 * Unknown keys are kept and reported, never dropped.
 */
import type { CarInput, EquipmentGroup, UnknownLine } from './types';
import { emptyCar } from './seed';
import { EQUIPMENT_GROUPS, fold, normalizeFuel, normalizeGearbox, parseMonth, parseNumber } from './vocab';

type Target =
  | { kind: 'scalar'; field: ScalarField }
  | { kind: 'text'; field: 'description' | 'intro' }
  | { kind: 'list'; field: 'highlights' | 'badges' }
  | { kind: 'equipment'; group: string }
  | { kind: 'unknown'; key: string };

type ScalarField =
  | 'brandName' | 'model' | 'subtitle' | 'year' | 'month' | 'price' | 'km'
  | 'fuel' | 'gearbox' | 'power' | 'color' | 'seats';

const ALIASES: Record<string, ScalarField | 'description' | 'intro' | 'highlights' | 'badges'> = {
  brandname: 'brandName', brand: 'brandName', marque: 'brandName',
  model: 'model', modele: 'model',
  subtitle: 'subtitle', version: 'subtitle', motorisation: 'subtitle', finition: 'subtitle',
  year: 'year', annee: 'year', millesime: 'year',
  month: 'month', mois: 'month',
  price: 'price', prix: 'price',
  km: 'km', kilometrage: 'km', mileage: 'km',
  fuel: 'fuel', carburant: 'fuel', energie: 'fuel',
  gearbox: 'gearbox', boite: 'gearbox', boitedevitesses: 'gearbox', transmission: 'gearbox',
  power: 'power', puissance: 'power',
  color: 'color', colour: 'color', couleur: 'color',
  seats: 'seats', places: 'seats', nombredeplaces: 'seats',
  intro: 'intro', resume: 'intro', accroche: 'intro',
  description: 'description',
  highlights: 'highlights', pointsforts: 'highlights',
  badges: 'badges', etiquettes: 'badges',
};

const TEXT_FIELDS = new Set(['description', 'intro']);
const LIST_FIELDS = new Set(['highlights', 'badges']);

const BULLET = /^\s*(?:[-•·*–—▪◦►✓✔]|\d+[.)])\s+/;
const PICTO = /\p{Extended_Pictographic}/gu;
const HAS_PICTO = /\p{Extended_Pictographic}/u;
const KEY_LINE = /^\s*(?:[-•·*]\s+)?[`*_#\s]*([^:\n]{1,48}?)[`*_\s]*:\s*(.*)$/;
const KEY_SHAPE = /^[a-z][a-z0-9]*(?:\.[a-z0-9]+)?$/i;

function normKey(k: string): string {
  return fold(k).replace(/[\s_\-*`]/g, '');
}

function equipmentGroupLabel(suffix: string): string {
  const s = normKey(suffix);
  const known = EQUIPMENT_GROUPS.find((g) => s.startsWith(g.key.slice(0, 5)));
  if (known) return known.label;
  if (s.startsWith('confort')) return EQUIPMENT_GROUPS[0].label;
  const clean = suffix.trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/** Decides whether a "xxx : yyy" line opens a new key, and which one. */
function resolveKey(rawKey: string, bulleted: boolean, inBlock: boolean): Target | null {
  const k = normKey(rawKey);
  const alias = ALIASES[k];
  if (alias) {
    if (TEXT_FIELDS.has(alias)) return { kind: 'text', field: alias as 'description' | 'intro' };
    if (LIST_FIELDS.has(alias)) return { kind: 'list', field: alias as 'highlights' | 'badges' };
    return { kind: 'scalar', field: alias as ScalarField };
  }
  if (k.startsWith('equip')) {
    const dot = rawKey.indexOf('.');
    return { kind: 'equipment', group: dot >= 0 ? equipmentGroupLabel(rawKey.slice(dot + 1)) : 'Équipements' };
  }
  // A bare camelCase token is an unknown key — except inside a description or a list,
  // where "Contact : 06…" or "- Écran : tactile" are content.
  if (!bulleted && !inBlock && KEY_SHAPE.test(rawKey.trim())) return { kind: 'unknown', key: rawKey.trim() };
  return null;
}

export interface ParseResult {
  car: CarInput;
  unknown: UnknownLine[];
  warnings: string[];
  /** Fields the paste filled in, for the review screen. */
  found: string[];
}

export function parsePaste(input: string): ParseResult {
  const car = emptyCar();
  const unknown: UnknownLine[] = [];
  const warnings: string[] = [];
  const scalars: Partial<Record<ScalarField, string>> = {};
  const texts: Record<string, string[]> = { description: [], intro: [] };
  const lists: Record<string, string[]> = { highlights: [], badges: [] };
  const equipment: EquipmentGroup[] = [];
  const unknownMap = new Map<string, string[]>();

  let current: Target | null = null;

  const pushTo = (t: Target, value: string, isContinuation: boolean) => {
    switch (t.kind) {
      case 'scalar':
        if (value) scalars[t.field] = scalars[t.field] ? `${scalars[t.field]} ${value}` : value;
        break;
      case 'text':
        if (value || (isContinuation && texts[t.field].length)) texts[t.field].push(value);
        break;
      case 'list':
      case 'equipment': {
        const item = value.replace(BULLET, '').replace(PICTO, '').trim();
        // A non-bulleted line made of emoji ("🔹 Extérieur 🔹") is a separator, not an item.
        if (!item || (isContinuation && !BULLET.test(value) && HAS_PICTO.test(value))) break;
        if (t.kind === 'list') lists[t.field].push(item);
        else {
          let g = equipment.find((e) => e.group === t.group);
          if (!g) equipment.push((g = { group: t.group, items: [] }));
          g.items.push(item);
        }
        break;
      }
      case 'unknown': {
        const arr = unknownMap.get(t.key) ?? [];
        if (value) arr.push(value);
        unknownMap.set(t.key, arr);
        break;
      }
    }
  };

  for (const rawLine of input.replace(/\r\n?/g, '\n').split('\n')) {
    const line = rawLine.replace(/\s+$/, '');
    if (/^\s*```/.test(line)) continue;

    const m = line.match(KEY_LINE);
    if (m) {
      const inBlock = !!current && (current.kind === 'text' || current.kind === 'list' || current.kind === 'equipment');
      const target = resolveKey(m[1], /^\s*[-•·*]\s+/.test(line), inBlock);
      if (target) {
        current = target;
        if (target.kind === 'equipment' && !equipment.find((e) => e.group === target.group)) {
          equipment.push({ group: target.group, items: [] });
        }
        if (target.kind === 'unknown' && !unknownMap.has(target.key)) unknownMap.set(target.key, []);
        pushTo(target, m[2].trim(), false);
        continue;
      }
    }
    if (!current) {
      if (line.trim()) warnings.push(`Ligne ignorée (avant la première clé) : « ${line.trim()} »`);
      continue;
    }
    if (current.kind === 'text') pushTo(current, line.trim(), true);
    else if (line.trim()) pushTo(current, line.trim(), true);
  }

  const found: string[] = [];
  const s = scalars;
  if (s.brandName) car.brandName = s.brandName;
  if (s.model) car.model = s.model;
  if (s.subtitle) car.subtitle = s.subtitle;
  if (s.color) car.color = s.color;

  if (s.year) {
    const my = s.year.match(/(\d{1,2})\s*[/.-]\s*((?:19|20)\d{2})/);
    const y = s.year.match(/(?:19|20)\d{2}/);
    if (my) {
      car.year = Number(my[2]);
      car.month = parseMonth(my[1]);
    } else if (y) car.year = Number(y[0]);
    else warnings.push(`Année illisible : « ${s.year} »`);
  }
  if (s.month) {
    car.month = parseMonth(s.month);
    if (car.month == null) warnings.push(`Mois illisible : « ${s.month} »`);
  }
  for (const f of ['price', 'km', 'power', 'seats'] as const) {
    if (!s[f]) continue;
    const n = parseNumber(s[f]);
    if (n == null) warnings.push(`Nombre illisible pour ${f} : « ${s[f]} »`);
    car[f] = n;
  }
  if (s.fuel) {
    car.fuel = normalizeFuel(s.fuel);
    if (!car.fuel) warnings.push(`Carburant non reconnu : « ${s.fuel} » — choisissez-le dans la liste.`);
    else if (fold(car.fuel) !== fold(s.fuel)) warnings.push(`Carburant « ${s.fuel} » classé en « ${car.fuel} » pour les filtres du site.`);
  }
  if (s.gearbox) {
    car.gearbox = normalizeGearbox(s.gearbox);
    if (!car.gearbox) warnings.push(`Boîte non reconnue : « ${s.gearbox} » — choisissez-la dans la liste.`);
  }

  car.intro = texts.intro.join(' ').trim();
  car.description = texts.description.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  car.highlights = lists.highlights;
  car.badges = lists.badges;
  car.equipment = equipment.filter((g) => g.items.length);

  for (const [k, v] of Object.entries(car)) {
    if (Array.isArray(v) ? v.length : v != null && v !== '' && k !== 'status') found.push(k);
  }
  if (car.intro.length > 160) warnings.push('La phrase de résumé dépasse 160 caractères : raccourcissez-la si possible.');
  for (const [key, vals] of unknownMap) unknown.push({ key, value: vals.join('\n') });

  return { car, unknown, warnings, found };
}
