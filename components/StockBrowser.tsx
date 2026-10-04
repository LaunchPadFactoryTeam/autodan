'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Car } from '@/lib/types';
import { euro } from '@/lib/format';
import { CarCard } from './CarCard';

const SORTS = ['Prix croissant', 'Prix décroissant', 'Année récente', 'Kilométrage'] as const;
type Sort = (typeof SORTS)[number];

export function StockBrowser({ cars }: { cars: Car[] }) {
  const fuels = useMemo(() => ['Tous', ...Array.from(new Set(cars.map((c) => c.fuel).filter(Boolean)))], [cars]);
  const gearboxes = useMemo(() => ['Toutes', ...Array.from(new Set(cars.map((c) => c.gearbox).filter(Boolean)))], [cars]);
  const ceiling = useMemo(() => {
    const max = Math.max(0, ...cars.map((c) => c.price ?? 0));
    return Math.max(20000, Math.ceil(max / 1000) * 1000);
  }, [cars]);

  const [fuel, setFuel] = useState('Tous');
  const [gearbox, setGearbox] = useState('Toutes');
  const [maxPrice, setMaxPrice] = useState(ceiling);
  const [sort, setSort] = useState<Sort>('Prix croissant');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = cars.filter(
      (c) =>
        (fuel === 'Tous' || c.fuel === fuel) &&
        (gearbox === 'Toutes' || c.gearbox === gearbox) &&
        (c.price == null || c.price <= maxPrice),
    );
    const sold = (c: Car) => (c.status === 'sold' ? 1 : 0);
    const by: Record<Sort, (a: Car, b: Car) => number> = {
      'Prix croissant': (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity),
      'Prix décroissant': (a, b) => (b.price ?? 0) - (a.price ?? 0),
      'Année récente': (a, b) => (b.year ?? 0) - (a.year ?? 0),
      Kilométrage: (a, b) => (a.km ?? Infinity) - (b.km ?? Infinity),
    };
    return list.sort((a, b) => sold(a) - sold(b) || by[sort](a, b));
  }, [cars, fuel, gearbox, maxPrice, sort]);

  const availableCount = filtered.filter((c) => c.status === 'available').length;
  const activeFilters = (fuel !== 'Tous' ? 1 : 0) + (gearbox !== 'Toutes' ? 1 : 0) + (maxPrice < ceiling ? 1 : 0);
  const reset = () => {
    setFuel('Tous');
    setGearbox('Toutes');
    setMaxPrice(ceiling);
  };

  return (
    <div className="stock-layout">
      <div>
        <button
          type="button"
          className="btn btn-ghost-white filters-toggle"
          aria-expanded={filtersOpen}
          aria-controls="filtres"
          onClick={() => setFiltersOpen((o) => !o)}
        >
          {filtersOpen ? 'Masquer les filtres' : `Filtres${activeFilters ? ` (${activeFilters})` : ''}`}
        </button>
        <aside id="filtres" className={`filters${filtersOpen ? ' open' : ''}`} aria-label="Filtres">
          <p className="filters-title">Filtres</p>
          <p className="label-sm" id="f-fuel">Carburant</p>
          <div className="chips" role="group" aria-labelledby="f-fuel">
            {fuels.map((f) => (
              <button key={f} type="button" className="filter-chip" aria-pressed={fuel === f} onClick={() => setFuel(f)}>
                {f}
              </button>
            ))}
          </div>
          <p className="label-sm" id="f-gear">Boîte de vitesses</p>
          <div className="chips" role="group" aria-labelledby="f-gear">
            {gearboxes.map((g) => (
              <button key={g} type="button" className="filter-chip" aria-pressed={gearbox === g} onClick={() => setGearbox(g)}>
                {g}
              </button>
            ))}
          </div>
          <label className="label-sm" htmlFor="f-budget" style={{ display: 'block', margin: '0 0 10px' }}>
            Budget max · {euro(maxPrice)}
          </label>
          <input
            id="f-budget"
            type="range"
            min={5000}
            max={ceiling}
            step={500}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
          <button type="button" className="reset-btn" onClick={reset}>
            Réinitialiser les filtres
          </button>
        </aside>
      </div>

      <div>
        <div className="results-bar">
          <p className="count" aria-live="polite">
            {availableCount} véhicule{availableCount > 1 ? 's' : ''} disponible{availableCount > 1 ? 's' : ''}
          </p>
          <label>
            Trier par
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              {SORTS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
        </div>
        {filtered.length > 0 ? (
          <div className="car-grid narrow">
            {filtered.map((c, i) => (
              <CarCard key={c.slug} car={c} priority={i < 2} />
            ))}
          </div>
        ) : (
          <div className="card empty">
            <p className="t">Aucun véhicule ne correspond.</p>
            <p className="d">Dites-nous ce que vous cherchez : Autodan fait la recherche pour vous.</p>
            <Link href="/contact?demande=recherche" className="btn btn-primary btn-sm">
              Lancer une recherche personnalisée
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
