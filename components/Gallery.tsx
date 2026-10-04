'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

export function Gallery({ photos, title, badges }: { photos: string[]; title: string; badges: string[] }) {
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);
  const n = photos.length;
  const go = (d: number) => setI((x) => (x + d + n) % n);

  return (
    <div className="card gallery">
      <div
        className="stage"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null || n < 2) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {n > 0 ? (
          <Image
            key={photos[i]}
            src={photos[i]}
            alt={`${title} — photo ${i + 1} sur ${n}`}
            fill
            priority={i === 0}
            sizes="(max-width: 860px) 100vw, 880px"
          />
        ) : (
          <span className="no-photo" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: 'rgba(5,39,71,.65)' }}>
            Photos sur demande
          </span>
        )}
        {badges.length > 0 && (
          <div className="badges">
            {badges.map((b) => (
              <span key={b} className={`badge${b === 'Vendu' ? ' sold' : ''}`}>
                {b}
              </span>
            ))}
          </div>
        )}
        {n > 1 && (
          <>
            <button type="button" className="arrow prev" onClick={() => go(-1)} aria-label="Photo précédente">
              ‹
            </button>
            <button type="button" className="arrow next" onClick={() => go(1)} aria-label="Photo suivante">
              ›
            </button>
            <span className="counter" aria-hidden="true">
              {i + 1} / {n}
            </span>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="thumbs">
          {photos.map((src, k) => (
            <button key={src} type="button" className="thumb" aria-current={k === i} aria-label={`Voir la photo ${k + 1}`} onClick={() => setI(k)}>
              <Image src={src} alt="" width={92} height={69} sizes="92px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
