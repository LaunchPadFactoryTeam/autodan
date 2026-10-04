'use client';

import { useRef, useState } from 'react';
import type { Api } from './api';
import { downscale } from './resize';

const isExternal = (u: string) => !u.startsWith('/') && !u.includes('.public.blob.vercel-storage.com/') && !u.includes('cdn.prod.website-files.com/');

export function PhotoManager({
  api,
  photos,
  onChange,
  slugHint,
  onBusy,
}: {
  api: Api;
  photos: string[];
  onChange: (p: string[]) => void;
  slugHint: string;
  onBusy?: (busy: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(0);
  const [over, setOver] = useState(false);
  const [error, setError] = useState('');
  // Uploads finish one by one; keep a ref so each completion appends to the latest list.
  const latest = useRef(photos);
  latest.current = photos;

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name));
    if (!list.length) return;
    setError('');
    setPending((n) => n + list.length);
    onBusy?.(true);
    for (const file of list) {
      try {
        const blob = await downscale(file);
        const form = new FormData();
        form.append('file', blob, file.name.replace(/\.\w+$/, '') + '.jpg');
        form.append('slug', slugHint);
        const { url } = await api.post<{ url: string }>('/api/admin/photos', form);
        onChange((latest.current = [...latest.current, url]));
      } catch (e) {
        setError(`${file.name} : ${(e as Error).message}`);
      } finally {
        setPending((n) => n - 1);
      }
    }
    onBusy?.(false);
  }

  const move = (i: number, d: number) => {
    const next = [...photos];
    const [p] = next.splice(i, 1);
    next.splice(Math.max(0, Math.min(next.length, i + d)), 0, p);
    onChange(next);
  };

  return (
    <div>
      <div
        className={`bo-drop${over ? ' over' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          upload(e.dataTransfer.files);
        }}
      >
        <span className="t">Ajouter des photos</span>
        <span className="d">Depuis la galerie ou l’appareil photo · redimensionnées automatiquement</span>
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) upload(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {error && <div className="bo-alert error" style={{ marginTop: 10 }}>{error}</div>}
      {(photos.length > 0 || pending > 0) && (
        <div className="bo-photos">
          {photos.map((src, i) => (
            <div key={src} className="bo-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Photo ${i + 1}`} loading="lazy" />
              {i === 0 && <span className="main">Principale</span>}
              {isExternal(src) && <span className="ext">importée à la publication</span>}
              <div className="tools">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Avancer">
                  ←
                </button>
                <button type="button" onClick={() => move(i, -i)} disabled={i === 0} aria-label="Mettre en photo principale">
                  ★
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === photos.length - 1} aria-label="Reculer">
                  →
                </button>
                <button type="button" onClick={() => onChange(photos.filter((_, k) => k !== i))} aria-label="Retirer">
                  ✕
                </button>
              </div>
            </div>
          ))}
          {Array.from({ length: pending }).map((_, i) => (
            <div key={'p' + i} className="bo-photo pending">
              Envoi…
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
