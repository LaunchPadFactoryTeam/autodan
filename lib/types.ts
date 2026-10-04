export type CarStatus = 'available' | 'sold' | 'hidden';

export interface EquipmentGroup {
  group: string;
  items: string[];
}

export interface Car {
  slug: string;
  status: CarStatus;
  brandName: string;
  model: string;
  subtitle: string;
  year: number | null;
  month: number | null;
  price: number | null;
  km: number | null;
  fuel: string;
  gearbox: string;
  power: number | null;
  color: string;
  seats: number | null;
  badges: string[];
  photos: string[];
  intro: string;
  description: string;
  highlights: string[];
  equipment: EquipmentGroup[];
  createdAt: string;
  updatedAt: string;
}

/** What the review screen edits: a car without its bookkeeping fields. */
export type CarInput = Omit<Car, 'slug' | 'createdAt' | 'updatedAt'> & { slug?: string };

export interface UnknownLine {
  key: string;
  value: string;
}

export interface Draft {
  id: string;
  source: 'paste' | 'tally';
  /** Tally submission id, used to avoid importing the same submission twice. */
  externalId?: string;
  createdAt: string;
  car: CarInput;
  unknown: UnknownLine[];
}

export interface Message {
  id: string;
  createdAt: string;
  kind: 'contact' | 'question';
  name: string;
  phone: string;
  email: string;
  topic: string;
  message: string;
  carSlug?: string;
  carTitle?: string;
}
