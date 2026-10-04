/**
 * Persistence. Vercel Blob in production (BLOB_READ_WRITE_TOKEN set), a local `.data/` folder otherwise.
 *
 * Three JSON documents and a folder of photos:
 *  - data/cars.json            the stock (public content anyway)
 *  - <private>/drafts.json     fiches en attente de relecture
 *  - <private>/messages.json   contact requests (personal data)
 *  - cars/<slug>/*.jpg         photos
 *
 * <private> is a folder name derived from a secret, so its URL cannot be guessed from a photo URL.
 */
import { createHash, randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { BlobPreconditionFailedError, del, get, put } from '@vercel/blob';
import { SEED_CARS } from './seed';
import type { Car, Draft, Message } from './types';

export const usesBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;
const LOCAL_DIR = path.join(process.cwd(), '.data');

export class StorageUnavailableError extends Error {
  constructor() {
    super('Stockage non configuré : connectez un store Vercel Blob au projet (voir README).');
  }
}

function assertWritable() {
  if (!usesBlob() && process.env.VERCEL) throw new StorageUnavailableError();
}

function privateDir(): string {
  const secret = process.env.DATA_KEY || process.env.BLOB_READ_WRITE_TOKEN || 'local';
  return 'private-' + createHash('sha256').update(secret).digest('hex').slice(0, 24);
}

type DocName = 'cars' | 'drafts' | 'messages';
const docPath = (name: DocName) => (name === 'cars' ? 'data/cars.json' : `${privateDir()}/${name}.json`);

async function readDoc<T>(name: DocName): Promise<{ data: T | null; etag?: string }> {
  const p = docPath(name);
  if (usesBlob()) {
    const res = await get(p, { access: 'public', useCache: false });
    if (!res || res.statusCode !== 200) return { data: null };
    const text = await new Response(res.stream).text();
    return { data: JSON.parse(text) as T, etag: res.headers.get('etag') ?? undefined };
  }
  try {
    return { data: JSON.parse(await fs.readFile(path.join(LOCAL_DIR, p), 'utf8')) as T };
  } catch {
    return { data: null };
  }
}

async function writeDoc<T>(name: DocName, data: T, etag?: string): Promise<void> {
  assertWritable();
  const p = docPath(name);
  const body = JSON.stringify(data, null, 1);
  if (usesBlob()) {
    await put(p, body, {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      ...(etag ? { ifMatch: etag } : {}),
    });
    return;
  }
  const file = path.join(LOCAL_DIR, p);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, body);
}

/** Read-modify-write with optimistic concurrency, so two contact forms sent at once both land. */
async function mutate<T>(name: DocName, fallback: () => T, fn: (current: T) => T): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const { data, etag } = await readDoc<T>(name);
    const next = fn(data ?? fallback());
    try {
      await writeDoc(name, next, etag);
      return next;
    } catch (e) {
      if (e instanceof BlobPreconditionFailedError && attempt < 4) continue;
      throw e;
    }
  }
}

/* — cars — */

export async function readCars(): Promise<Car[]> {
  try {
    return (await readDoc<Car[]>('cars')).data ?? SEED_CARS;
  } catch (e) {
    console.error('readCars failed, serving seed', e);
    return SEED_CARS;
  }
}

export const mutateCars = (fn: (cars: Car[]) => Car[]) => mutate<Car[]>('cars', () => SEED_CARS, fn);

/* — drafts — */

export async function readDrafts(): Promise<Draft[]> {
  return (await readDoc<Draft[]>('drafts')).data ?? [];
}

export const mutateDrafts = (fn: (d: Draft[]) => Draft[]) => mutate<Draft[]>('drafts', () => [], fn);

/* — messages — */

export async function readMessages(): Promise<Message[]> {
  return (await readDoc<Message[]>('messages')).data ?? [];
}

export const mutateMessages = (fn: (m: Message[]) => Message[]) => mutate<Message[]>('messages', () => [], fn);

/* — photos — */

export async function savePhoto(buf: Buffer, slug: string): Promise<string> {
  assertWritable();
  const name = `cars/${slug || 'brouillon'}/${Date.now().toString(36)}-${randomUUID().slice(0, 8)}.jpg`;
  if (usesBlob()) {
    const res = await put(name, buf, { access: 'public', contentType: 'image/jpeg', addRandomSuffix: false });
    return res.url;
  }
  const file = path.join(LOCAL_DIR, 'media', name);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, buf);
  return '/media/' + name;
}

export function isOwnPhoto(url: string): boolean {
  return url.startsWith('/media/') || /\.public\.blob\.vercel-storage\.com\//.test(url) || url.startsWith('/images/');
}

export async function deletePhotos(urls: string[]): Promise<void> {
  const blobs = urls.filter((u) => /\.public\.blob\.vercel-storage\.com\//.test(u));
  if (blobs.length && usesBlob()) await del(blobs).catch((e) => console.error('del photos', e));
  for (const u of urls.filter((x) => x.startsWith('/media/'))) {
    await fs.unlink(path.join(LOCAL_DIR, u.replace(/^\/+/, ''))).catch(() => {});
  }
}

export async function readLocalMedia(rel: string): Promise<Buffer | null> {
  const file = path.join(LOCAL_DIR, 'media', rel);
  if (!file.startsWith(path.join(LOCAL_DIR, 'media'))) return null;
  return fs.readFile(file).catch(() => null);
}
