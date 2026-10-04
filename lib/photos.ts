import sharp from 'sharp';
import { savePhoto } from './store';

/** Straightens (EXIF), caps at 2000 px and recompresses — a 6 MB phone photo lands around 400 KB. */
export async function processAndSave(input: Buffer, slug: string): Promise<string> {
  const out = await sharp(input, { failOn: 'none' })
    .rotate()
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  return savePhoto(out, slug);
}

/** Copies a photo hosted elsewhere (Tally upload) into our storage. */
export async function importRemotePhoto(url: string, slug: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Photo introuvable (${res.status}) : ${url}`);
  return processAndSave(Buffer.from(await res.arrayBuffer()), slug);
}
