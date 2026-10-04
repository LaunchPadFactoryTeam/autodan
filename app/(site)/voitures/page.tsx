import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { StockBrowser } from '@/components/StockBrowser';
import { getPublicCars } from '@/lib/cars';
import { breadcrumbJsonLd, itemListJsonLd } from '@/lib/seo';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Voitures d’occasion disponibles',
  description:
    'Toutes les voitures d’occasion disponibles chez Autodan à Nice : véhicules inspectés, prix affichés TTC, filtres par carburant, boîte et budget.',
  alternates: { canonical: '/voitures' },
};

export default async function StockPage() {
  const cars = await getPublicCars();
  return (
    <main className="wrap page-main">
      <h1 className="page-title" style={{ marginBottom: 12 }}>
        Nos voitures
      </h1>
      <p className="stock-intro">
        Découvrez notre sélection de <strong>véhicules d’occasion disponibles immédiatement.</strong> Tous nos modèles sont{' '}
        <strong>inspectés</strong> et prêts à prendre la route.
      </p>
      <StockBrowser cars={cars} />
      <JsonLd
        data={[
          itemListJsonLd(cars),
          breadcrumbJsonLd([
            { name: 'Accueil', path: '/' },
            { name: 'Véhicules', path: '/voitures' },
          ]),
        ]}
      />
    </main>
  );
}
