/** Allowed values for the fields that drive the site's filters, plus normalisers. */

export const FUELS = ['Essence', 'Diesel', 'Hybride', 'Hybride rechargeable', 'Électrique', 'GPL'] as const;
export const GEARBOXES = ['Manuelle', 'Automatique'] as const;
export const BADGE_PRESETS = ['Nouveauté', 'Affaire à saisir', 'Prix en baisse', 'Première main', 'Garantie'];

/** Keys of the paste format, in the order of the LLM instruction. */
export const EQUIPMENT_GROUPS = [
  { key: 'interieur', label: 'Intérieur & confort' },
  { key: 'exterieur', label: 'Extérieur' },
  { key: 'conduite', label: 'Conduite' },
  { key: 'securite', label: 'Sécurité' },
] as const;

export function fold(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Recale a free-text fuel ("Essence micro-hybride (mHEV)", "gazole"…) onto FUELS. */
export function normalizeFuel(raw: string): string {
  const f = fold(raw);
  if (!f) return '';
  if (/rechargeable|plug|phev/.test(f)) return 'Hybride rechargeable';
  if (/hybrid|hev/.test(f)) return 'Hybride';
  if (/electri|ev\b|100 ?%/.test(f)) return 'Électrique';
  if (/diesel|gazole|gasoil|dci|hdi|tdi|crdi|bluehdi/.test(f)) return 'Diesel';
  if (/gpl|lpg|bicarbur/.test(f)) return 'GPL';
  if (/essence|sp ?9[58]|e10|tce|tsi|puretech|ecoboost/.test(f)) return 'Essence';
  return '';
}

export function normalizeGearbox(raw: string): string {
  const g = fold(raw);
  if (!g) return '';
  if (/auto|bva|dsg|edc|cvt|eat|robot|sequenti/.test(g)) return 'Automatique';
  if (/manu|bvm|meca/.test(g)) return 'Manuelle';
  return '';
}

const MONTHS = ['janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin', 'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre'];
export const MONTH_LABELS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

/** "13 900 €" → 13900, "48 000 km" → 48000, "125 ch" → 125. Returns null when no digit. */
export function parseNumber(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  const cleaned = raw.replace(/[\s  .]/g, '').replace(',', '.');
  const m = cleaned.match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  return Math.round(Number(m[0]));
}

export function parseMonth(raw: string | number | null | undefined): number | null {
  if (raw == null || raw === '') return null;
  const n = parseNumber(raw);
  if (n != null) return n >= 1 && n <= 12 ? n : null;
  const f = fold(String(raw));
  const i = MONTHS.findIndex((m) => f.startsWith(m.slice(0, 4)));
  return i >= 0 ? i + 1 : null;
}

export function slugify(s: string): string {
  return fold(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}
