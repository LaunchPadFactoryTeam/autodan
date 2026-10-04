import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Gallery } from '@/components/Gallery';
import { JsonLd } from '@/components/JsonLd';
import { QuestionForm } from '@/components/QuestionForm';
import { getPublicCar, getPublicCars } from '@/lib/cars';
import { carSpecs, carTitle, displayBadges, euro, metaDescription } from '@/lib/format';
import { breadcrumbJsonLd, carJsonLd } from '@/lib/seo';
import { site } from '@/lib/site';

export const revalidate = 86400;

export async function generateStaticParams() {
  return (await getPublicCars()).map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const car = await getPublicCar(slug);
  if (!car) return { title: 'Véhicule introuvable', robots: { index: false } };
  const title = [carTitle(car), car.year, car.status === 'sold' ? 'vendu' : euro(car.price)].filter(Boolean).join(' · ');
  return {
    title,
    description: metaDescription(car),
    alternates: { canonical: `/voitures/${car.slug}` },
    openGraph: {
      title: `${title} | Autodan Nice`,
      description: metaDescription(car),
      url: `/voitures/${car.slug}`,
      images: car.photos.length ? car.photos.slice(0, 4).map((url) => ({ url })) : undefined,
    },
  };
}

export default async function CarPage({ params }: Props) {
  const { slug } = await params;
  const car = await getPublicCar(slug);
  if (!car) notFound();

  const title = carTitle(car);
  const c = site.contact;
  const sold = car.status === 'sold';

  return (
    <main className="wrap car-main">
      <nav aria-label="Fil d’Ariane">
        <Link href="/voitures" className="back-link">
          ← Toutes nos voitures
        </Link>
      </nav>

      <div className="car-layout">
        <div className="gallery-col">
          <Gallery photos={car.photos} title={title} badges={displayBadges(car)} />

          <section className="card panel" aria-labelledby="specs-title">
            <h2 id="specs-title">Caractéristiques</h2>
            <dl className="specs" style={{ margin: 0 }}>
              {carSpecs(car).map((s) => (
                <div key={s.label} className="spec">
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {(car.intro || car.description || car.highlights.length > 0) && (
            <section className="card panel" aria-labelledby="desc-title">
              <h2 id="desc-title" style={{ marginBottom: 16 }}>
                Description
              </h2>
              {car.intro && <p className="car-intro">{car.intro}</p>}
              {car.highlights.length > 0 && (
                <ul className="highlights">
                  {car.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
              {car.description && <p className="car-desc">{car.description}</p>}
            </section>
          )}

          {car.equipment.length > 0 && (
            <section className="card panel" aria-labelledby="equip-title">
              <h2 id="equip-title">Options & équipements</h2>
              <div className="equip">
                {car.equipment.map((g) => (
                  <div key={g.group}>
                    <h3 className="label-sm">{g.group}</h3>
                    <ul>
                      {g.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="car-aside">
          <div className="card buy-box">
            <h1>{title}</h1>
            <p className="sub">{car.subtitle}</p>
            <p className="price">{sold ? 'Vendu' : euro(car.price)}</p>
            <p className="note">{sold ? 'Ce véhicule a trouvé preneur. Autodan peut en rechercher un similaire.' : 'Prix affiché TTC, frais de dossier inclus'}</p>
            <div className="actions">
              <a href={c.telHref} className="cta-block dark" data-umami-event="Appeler" data-umami-event-emplacement="fiche" data-umami-event-vehicule={car.slug}>
                Appeler {c.tel}
              </a>
              <a
                href={`mailto:${c.mail}?subject=${encodeURIComponent(`${title} ${car.year ?? ''} — demande d’information`)}`}
                className="cta-block light"
                data-umami-event="E-mail"
                data-umami-event-emplacement="fiche"
                data-umami-event-vehicule={car.slug}
              >
                Écrire un e-mail
              </a>
            </div>
          </div>
          <QuestionForm carSlug={car.slug} carTitle={`${title} ${car.year ?? ''}`.trim()} tel={c.tel} />
        </aside>
      </div>

      <div className="mobile-cta">
        <a href={c.telHref} className="call" data-umami-event="Appeler" data-umami-event-emplacement="barre mobile" data-umami-event-vehicule={car.slug}>
          Appeler
        </a>
        <a href="#question" className="ask">
          Poser une question
        </a>
      </div>

      <JsonLd
        data={[
          carJsonLd(car),
          breadcrumbJsonLd([
            { name: 'Accueil', path: '/' },
            { name: 'Véhicules', path: '/voitures' },
            { name: title, path: `/voitures/${car.slug}` },
          ]),
        ]}
      />
    </main>
  );
}
