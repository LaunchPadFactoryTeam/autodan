import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BlobNotFoundError, BlobPreconditionFailedError } from '@vercel/blob';
import { blobApi, mutateCars, readCars } from './store';
import { SEED_CARS } from './seed';

/**
 * A fake Blob store that behaves like production: the API (head/put) is always current,
 * but the public URL without a query string is served from a CDN copy that does not change.
 */
function fakeBlob() {
  const docs = new Map<string, { body: string; etag: string; cdnBody: string }>();
  let n = 0;
  const url = (p: string) => `https://store.public.blob.vercel-storage.com/${p}`;
  blobApi.head = (async (p: string) => {
    const d = docs.get(p);
    if (!d) throw new BlobNotFoundError();
    return { url: url(p), etag: d.etag };
  }) as unknown as typeof blobApi.head;
  blobApi.fetch = async (u: string) => {
    const [base, query] = u.split('?');
    const d = docs.get(base.replace(url(''), ''))!;
    return new Response(query ? d.body : d.cdnBody);
  };
  blobApi.put = (async (p: string, body: string, opts: { ifMatch?: string }) => {
    const d = docs.get(p);
    if (opts.ifMatch && opts.ifMatch !== d?.etag) throw new BlobPreconditionFailedError();
    const etag = `"v${++n}"`;
    docs.set(p, { body, etag, cdnBody: d?.cdnBody ?? body });
    return { url: url(p), etag };
  }) as unknown as typeof blobApi.put;
}

test('successive writes succeed even though the CDN serves a stale copy', async () => {
  process.env.BLOB_READ_WRITE_TOKEN = 'test';
  fakeBlob();

  assert.equal((await readCars()).length, SEED_CARS.length);
  await mutateCars((cars) => cars.filter((c) => c.slug !== 'fiat-500-2016'));
  await mutateCars((cars) => cars.map((c) => (c.slug === 'dacia-duster-2020' ? { ...c, price: 12500 } : c)));
  await mutateCars((cars) => cars.filter((c) => c.slug !== 'renault-twingo-iii-2021'));

  const cars = await readCars();
  assert.deepEqual(cars.map((c) => c.slug), ['dacia-duster-2020']);
  assert.equal(cars[0].price, 12500);
  delete process.env.BLOB_READ_WRITE_TOKEN;
});
