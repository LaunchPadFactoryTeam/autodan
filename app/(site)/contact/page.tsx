import type { Metadata } from 'next';
import { ContactForm } from '@/components/ContactForm';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact — 11 chemin de la Lauvette, Nice',
  description: `Contactez Autodan à Nice : ${site.contact.tel}, ${site.contact.mail}. Achat d’un véhicule, recherche personnalisée, estimation ou dépôt-vente de votre voiture.`,
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  const c = site.contact;
  return (
    <main className="wrap page-main">
      <h1 className="page-title">Contactez-nous</h1>
      <div className="contact-layout">
        <div className="card contact-info">
          <p className="kicker">Venez nous rencontrer</p>
          <div className="rows">
            <div>
              <p className="l">Adresse</p>
              <address className="addr" style={{ fontStyle: 'normal' }}>
                {c.address}
              </address>
            </div>
            <div>
              <p className="l">Téléphone</p>
              <a href={c.telHref} className="tel" data-umami-event="Appeler" data-umami-event-emplacement="contact">
                {c.tel}
              </a>
            </div>
            <div>
              <p className="l">E-mail</p>
              <a href={c.mailHref} className="mail" data-umami-event="E-mail" data-umami-event-emplacement="contact">
                {c.mail}
              </a>
            </div>
          </div>
          <p className="kicker" style={{ margin: '28px 0 12px' }}>
            Nos annonces
          </p>
          <div className="social">
            {site.social.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener">
                {s.name}
              </a>
            ))}
          </div>
        </div>
        <div className="card contact-form-card">
          <ContactForm topics={site.topics} tel={c.tel} />
        </div>
      </div>
      <div className="map">
        <iframe
          title="Plan d’accès Autodan, 11 chemin de la Lauvette à Nice"
          src={`https://www.google.com/maps?q=${encodeURIComponent('Autodan, ' + c.address)}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Accueil', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />
    </main>
  );
}
