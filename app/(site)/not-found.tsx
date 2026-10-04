import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="wrap page-main">
      <h1 className="page-title">Cette page n’existe plus.</h1>
      <p className="stock-intro">Le véhicule a peut-être été vendu. Retrouvez tout le stock disponible, ou dites-nous ce que vous cherchez.</p>
      <div className="hero-actions">
        <Link href="/voitures" className="btn btn-primary">Voir les véhicules</Link>
        <Link href="/contact?demande=recherche" className="btn btn-outline">Recherche personnalisée</Link>
      </div>
    </main>
  );
}
