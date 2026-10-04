'use client';

import type { Car } from '@/lib/types';
import type { UmamiSummary } from '@/lib/umami';
import { carTitle } from '@/lib/format';
import type { BackofficeConfig } from './Backoffice';

/** The three questions from the note: how many visitors, which cars are viewed, how many contacts come out of it. */
export function Stats({ stats, cars, config }: { stats: UmamiSummary; cars: Car[]; config: BackofficeConfig }) {
  const count = (name: string) => stats.events.find((e) => e.name === name)?.count ?? 0;
  const titleFor = (path: string) => {
    const car = cars.find((c) => path === `/voitures/${c.slug}`);
    return car ? `${carTitle(car)} ${car.year ?? ''}` : path.replace('/voitures/', '');
  };
  const max = Math.max(1, ...stats.topCars.map((t) => t.views));

  return (
    <section>
      <h2 className="bo-h2">
        Statistiques · <b>{stats.rangeDays} derniers jours</b>
      </h2>
      <p className="bo-lead">Sans cookie ni bandeau : mesuré par Umami. Les appels et les formulaires sont comptés à chaque clic.</p>

      {!config.umamiConfigured && (
        <div className="bo-alert">
          La mesure d’audience n’est pas encore activée. Créez un site sur Umami Cloud (gratuit) et renseignez <span className="bo-mono">NEXT_PUBLIC_UMAMI_WEBSITE_ID</span> sur
          Vercel — voir docs/UMAMI.md.
        </div>
      )}
      {config.umamiConfigured && !stats.configured && (
        <div className="bo-alert">
          La mesure tourne. Pour afficher les chiffres ici, ajoutez une clé d’API Umami (<span className="bo-mono">UMAMI_API_KEY</span>) — ou ouvrez le tableau de bord
          partagé ci-dessous.
        </div>
      )}
      {stats.error && <div className="bo-alert error">Umami ne répond pas : {stats.error}</div>}

      {stats.configured && !stats.error && (
        <>
          <div className="bo-kpis">
            <div className="bo-kpi">
              <p className="l">Visiteurs</p>
              <p className="v">{stats.visitors ?? 0}</p>
            </div>
            <div className="bo-kpi">
              <p className="l">Pages vues</p>
              <p className="v">{stats.pageviews ?? 0}</p>
            </div>
            <div className="bo-kpi">
              <p className="l">Clics « Appeler »</p>
              <p className="v">{count('Appeler')}</p>
            </div>
            <div className="bo-kpi">
              <p className="l">Formulaires envoyés</p>
              <p className="v">{count('Formulaire envoyé')}</p>
            </div>
            <div className="bo-kpi">
              <p className="l">Clics « E-mail »</p>
              <p className="v">{count('E-mail')}</p>
            </div>
          </div>

          <p className="bo-rule-title">Fiches les plus vues</p>
          {stats.topCars.length === 0 ? (
            <p className="bo-empty">Pas encore de visite sur les fiches véhicule.</p>
          ) : (
            <ol className="bo-bars">
              {stats.topCars.map((t) => (
                <li key={t.path}>
                  <div>
                    <p className="bar-label" style={{ margin: '0 0 4px' }}>
                      {titleFor(t.path)}
                    </p>
                    <div className="bar">
                      <i style={{ width: `${(t.views / max) * 100}%` }} />
                    </div>
                  </div>
                  <span className="n">{t.views}</span>
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      {config.umamiShareUrl && (
        <div className="bo-section">
          <p className="bo-rule-title">Tableau de bord complet</p>
          <div className="bo-actions" style={{ marginBottom: 14 }}>
            <a className="bo-btn line" href={config.umamiShareUrl} target="_blank" rel="noopener noreferrer">
              Ouvrir dans Umami →
            </a>
          </div>
          <iframe className="bo-iframe" src={config.umamiShareUrl} title="Statistiques Umami" loading="lazy" />
        </div>
      )}
    </section>
  );
}
