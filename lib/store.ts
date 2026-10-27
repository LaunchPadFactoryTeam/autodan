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
import { BlobNotFoundError, BlobPreconditionFailedError, del, head, put } from '@vercel/blob';
import { SEED_CARS } from './seed';
import type { Car, Draft, Message } from './types';

export const usesBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

/** The Blob calls this module makes, gathered in one object so tests can stand in for them. */
export const blobApi = {
  head,
  put,
  del,
  fetch: (url: string) => fetch(url, { cache: 'no-store' }),
};
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
    // The public URL is served through Vercel's CDN, which keeps a copy for up to cacheControlMaxAge
    // (and get()'s useCache:false only applies to private stores). Reading through the CDN returns a
    // stale document and a stale ETag, and every conditional write then fails with "ETag mismatch".
    // head() asks the Blob API, so its ETag is current; the unique query string skips the CDN copy.
    let meta: Awaited<ReturnType<typeof head>>;
    try {
      meta = await blobApi.head(p);
    } catch (e) {
      if (e instanceof BlobNotFoundError) return { data: null };
      throw e;
    }
    const res = await blobApi.fetch(`${meta.url}?v=${encodeURIComponent(meta.etag)}-${Date.now()}`);
    if (!res.ok) throw new Error(`Lecture de ${p} impossible (${res.status})`);
    return { data: JSON.parse(await res.text()) as T, etag: meta.etag };
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
    await blobApi.put(p, body, {
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
      if (e instanceof BlobPreconditionFailedError) {
        if (attempt < 4) continue;
        throw new Error('Une autre modification était en cours au même moment. Réessayez dans quelques secondes.');
      }
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
    const res = await blobApi.put(name, buf, { access: 'public', contentType: 'image/jpeg', addRandomSuffix: false });
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
  if (blobs.length && usesBlob()) await blobApi.del(blobs).catch((e) => console.error('del photos', e));
  for (const u of urls.filter((x) => x.startsWith('/media/'))) {
    await fs.unlink(path.join(LOCAL_DIR, u.replace(/^\/+/, ''))).catch(() => {});
  }
}

export async function readLocalMedia(rel: string): Promise<Buffer | null> {
  const file = path.join(LOCAL_DIR, 'media', rel);
  if (!file.startsWith(path.join(LOCAL_DIR, 'media'))) return null;
  return fs.readFile(file).catch(() => null);
}
