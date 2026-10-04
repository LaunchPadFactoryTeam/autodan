import Link from 'next/link';
import { NAV, site } from '@/lib/site';

export function Footer() {
  const c = site.contact;
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={site.logo} alt="Autodan" className="footer-logo" width={110} height={30} loading="lazy" />
            <p className="footer-claim">Achat, vente et recherche de véhicules à Nice.</p>
          </div>
          <div>
            <p className="footer-h">Nous trouver</p>
            <address>
              <p style={{ margin: '0 0 10px' }}>{c.address}</p>
              <a href={c.telHref} style={{ display: 'block', marginBottom: 6 }} data-umami-event="Appeler" data-umami-event-emplacement="pied de page">
                {c.tel}
              </a>
              <a href={c.mailHref} data-umami-event="E-mail" data-umami-event-emplacement="pied de page">
                {c.mail}
              </a>
            </address>
          </div>
          <nav aria-label="Pied de page">
            <p className="footer-h">Navigation</p>
            <ul className="footer-links">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="footer-h">Nos annonces</p>
            <ul className="footer-links">
              {site.social.map((s) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noopener">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="copyright">Copyright © {new Date().getFullYear()} Autodan — Voitures d’occasion à Nice</p>
      </div>
    </footer>
  );
}
