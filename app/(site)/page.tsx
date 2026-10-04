import Image from 'next/image';
import Link from 'next/link';
import { CarCard } from '@/components/CarCard';
import { getPublicCars } from '@/lib/cars';
import { site } from '@/lib/site';

export const revalidate = 86400;

export default async function HomePage() {
  const cars = await getPublicCars();
  const available = cars.filter((c) => c.status === 'available').length;
  const t = site.testimonial;

  return (
    <main>
      <section className="hero">
        <div className="wrap">
          <div>
            <span className="hero-count">
              {available} véhicule{available > 1 ? 's' : ''} disponible{available > 1 ? 's' : ''} à Nice
            </span>
            <h1>Votre prochaine voiture, inspectée et prête à rouler.</h1>
            <p>
              <strong>Achat, vente et recherche</strong> personnalisée de véhicules selon vos objectifs.{' '}
              <strong>Dépôt-vente, convoyage et livraison à domicile</strong> en toute maîtrise.
            </p>
            <p className="last">
              Process clair, <strong>gestion administrative</strong> complète et <strong>gain de temps garanti.</strong>
            </p>
            <div className="hero-actions">
              <Link href="/voitures" className="btn btn-primary">
                Voir les {available} véhicules
              </Link>
              <a href={site.contact.telHref} className="btn btn-outline" data-umami-event="Appeler" data-umami-event-emplacement="accueil">
                Appeler Autodan
              </a>
            </div>
          </div>
          <div className="hero-photo">
            <Image
              src="/images/hero-audi.jpg"
              alt="Audi TT gris Autodan sur les hauteurs de Nice, vue sur la mer"
              fill
              priority
              sizes="(max-width: 860px) 100vw, 600px"
            />
            <div className="fade" />
            <div className="caption">
              <p className="k">Autodan · Nice</p>
              <p className="t">
                Livrée, immatriculée,
                <br />
                prête à rouler.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="reasons" aria-label="Pourquoi Autodan">
        <div className="wrap">
          {site.reasons.map((r, i) => (
            <div key={r.title} className="reason">
              <span className="num-dot" aria-hidden="true">
                0{i + 1}
              </span>
              <div>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="stock-title">
        <div className="wrap section-head">
          <div>
            <h2 id="stock-title">Nos voitures du moment</h2>
            <p>Voici les voitures qu’Autodan peut vous proposer à la vente dès aujourd’hui.</p>
          </div>
          <Link href="/voitures" className="btn btn-ghost-white">
            Tout le stock →
          </Link>
        </div>
        <div className="wrap pb72">
          <div className="car-grid">
            {cars.slice(0, 6).map((c, i) => (
              <CarCard key={c.slug} car={c} priority={i === 0} />
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="about-title">
        <div className="wrap pb72">
          <div className="card about-teaser">
            <div className="photo">
              <Image src="/images/about-bmw.jpg" alt="Véhicule Autodan à Nice" fill sizes="(max-width: 860px) 100vw, 660px" />
            </div>
            <div className="text">
              <p className="kicker">Qui sommes-nous</p>
              <h2 id="about-title">Une maison indépendante, basée à Nice.</h2>
              <p className="p">{site.about.lead}</p>
              <p className="p" style={{ marginBottom: 22 }}>
                {site.about.body}
              </p>
              <p className="claim">{site.about.claim}</p>
              <Link href="/a-propos" className="btn btn-primary btn-sm">
                Nos services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap pb72 duo">
          <div className="sell-card">
            <h2>Vendons votre voiture dès aujourd’hui.</h2>
            <p>Transmettez-nous les informations et photos de votre véhicule pour que nous préparions sa mise en vente sur nos canaux.</p>
            <Link href="/contact?demande=vendre" className="btn btn-yellow">
              Estimer mon véhicule
            </Link>
          </div>
          <figure className="card quote-card" style={{ margin: 0 }}>
            <p className="kicker">La satisfaction de nos clients</p>
            <blockquote className="quote-text" style={{ marginInline: 0 }}>
              « {t.quote} »
            </blockquote>
            <figcaption className="quote-author">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={t.photo} alt="" width={52} height={52} loading="lazy" />
              <div>
                <p className="n">{t.name}</p>
                <p className="r">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>
    </main>
  );
}
