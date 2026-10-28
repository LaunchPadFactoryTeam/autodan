import type { Metadata } from 'next';
import Image from 'next/image';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbJsonLd } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Qui sommes-nous ? Nos services',
  description:
    'Autodan, maison indépendante basée à Nice : achat, vente, recherche personnalisée, dépôt-vente, convoyage, livraison à domicile et gestion administrative de véhicules d’occasion.',
  alternates: { canonical: '/a-propos' },
};

export default function AboutPage() {
  const t = site.testimonial;
  return (
    <main className="wrap page-main">
      <h1 className="page-title">Qui sommes-nous ?</h1>
      <div className="card about-hero">
        <div className="text">
          <p className="lead">{site.about.lead}</p>
          <p className="body">{site.about.body}</p>
          <p className="claim yellow">{site.about.claim}</p>
        </div>
        <div className="photo">
          {/* Placeholder: replace /images/about-car.jpg with a photo of the showroom or the stock. */}
          <Image src="/images/about-car.jpg" alt="Véhicule d’occasion sélectionné par Autodan à Nice" fill sizes="(max-width: 860px) 100vw, 660px" />
          <figure className="founder-chip">
            <Image src="/images/raphael-avatar.jpg" alt="" width={48} height={48} />
            <figcaption>
              <span className="n">Raphaël Danyach</span>
              <span className="r">Fondateur d’Autodan</span>
            </figcaption>
          </figure>
        </div>
      </div>

      <h2 className="h2-section">Nos services</h2>
      <div className="services">
        {site.services.map((s, i) => (
          <section key={s.title} className="service">
            <span className="n" aria-hidden="true">
              0{i + 1}
            </span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </section>
        ))}
      </div>

      <figure className="card quote-wide" style={{ marginInline: 0, marginBottom: 0 }}>
        <blockquote className="quote-text">« {t.quote} »</blockquote>
        <figcaption className="quote-author">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.photo} alt="" width={52} height={52} loading="lazy" />
          <div>
            <p className="n">{t.name}</p>
            <p className="r">{t.role}</p>
          </div>
        </figcaption>
      </figure>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Accueil', path: '/' },
          { name: 'À propos', path: '/a-propos' },
        ])}
      />
    </main>
  );
}
