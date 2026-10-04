'use client';

/**
 * Downscales a phone photo in the browser before upload (≈ 6 MB → ≈ 600 KB), so it fits Vercel's
 * request limit and uploads fast on 4G. The server then recompresses and strips metadata.
 */
export async function downscale(file: File, max = 2400, quality = 0.86): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', quality));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file; // Unsupported format in this browser: let the server handle it.
  }
}
