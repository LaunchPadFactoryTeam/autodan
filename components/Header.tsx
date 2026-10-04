'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NAV, site } from '@/lib/site';

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="site-header">
      <div className="wrap bar">
        <Link href="/" className="logo" aria-label="Autodan — accueil">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={site.logo} alt="Autodan" width={120} height={32} />
        </Link>
        <nav id="menu" className={`nav${open ? ' open' : ''}`} aria-label="Navigation principale">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? 'page' : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="header-cta">
          <a href={site.contact.telHref} className="tel-pill" data-umami-event="Appeler" data-umami-event-emplacement="en-tête">
            <span className="full">{site.contact.tel}</span>
            <span className="short">Appeler</span>
          </a>
          <button type="button" className="menu-btn" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)}>
            <span />
            <i className="sr-only">Menu</i>
          </button>
        </div>
      </div>
    </header>
  );
}
