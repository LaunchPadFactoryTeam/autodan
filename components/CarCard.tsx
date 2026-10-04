import Image from 'next/image';
import Link from 'next/link';
import type { Car } from '@/lib/types';
import { carChips, carTitle, displayBadges, euro } from '@/lib/format';

export function CarCard({ car, priority = false }: { car: Car; priority?: boolean }) {
  const title = carTitle(car);
  const cover = car.photos[0];
  const badges = displayBadges(car);
  return (
    <Link href={`/voitures/${car.slug}`} className={`car-card${car.status === 'sold' ? ' is-sold' : ''}`}>
      <article style={{ display: 'contents' }}>
        <div className="media">
          {cover ? (
            <Image
              src={cover}
              alt={`${title} ${car.subtitle}`.trim()}
              fill
              sizes="(max-width: 560px) 100vw, (max-width: 1020px) 50vw, 420px"
              priority={priority}
            />
          ) : (
            <span className="no-photo">Photos sur demande</span>
          )}
          {badges.length > 0 && (
            <div className="badges">
              {badges.map((b) => (
                <span key={b} className={`badge${b === 'Vendu' ? ' sold' : ''}`}>
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="body">
          <div className="row">
            <h3>{title}</h3>
            <p className="price">{euro(car.price)}</p>
          </div>
          <p className="sub">{car.subtitle}</p>
          <div className="chips">
            {carChips(car).map((q) => (
              <span key={q} className="chip">
                {q}
              </span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}
