/** Schema.org JSON-LD: what search engines and AI answer engines read to understand the business and the stock. */
import type { Car } from './types';
import { SITE_URL, site } from './site';
import { carTitle } from './format';

const abs = (u: string) => (u.startsWith('http') ? u : SITE_URL + u);
export const DEALER_ID = SITE_URL + '/#autodealer';

export function dealerJsonLd() {
  const c = site.contact;
  return {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    '@id': DEALER_ID,
    name: site.name,
    description: site.description,
    url: SITE_URL,
    logo: site.logo,
    image: abs('/images/hero-audi.jpg'),
    telephone: c.telIntl,
    email: c.mail,
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    address: {
      '@type': 'PostalAddress',
      streetAddress: c.street,
      postalCode: c.postalCode,
      addressLocality: c.city,
      addressRegion: c.region,
      addressCountry: 'FR',
    },
    areaServed: [
      { '@type': 'City', name: 'Nice' },
      { '@type': 'AdministrativeArea', name: 'Alpes-Maritimes' },
      { '@type': 'Country', name: 'France' },
    ],
    sameAs: site.social.map((s) => s.url),
    makesOffer: site.services.map((s) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: s.title, description: s.body },
    })),
    review: {
      '@type': 'Review',
      reviewBody: site.testimonial.quote,
      author: { '@type': 'Person', name: site.testimonial.name },
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITE_URL + '/#website',
    url: SITE_URL,
    name: site.name,
    inLanguage: 'fr-FR',
    publisher: { '@id': DEALER_ID },
  };
}

export function carJsonLd(car: Car) {
  const url = `${SITE_URL}/voitures/${car.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Car',
    '@id': url + '#vehicle',
    name: [carTitle(car), car.subtitle].filter(Boolean).join(' '),
    url,
    description: [car.intro, car.description].filter(Boolean).join(' '),
    image: car.photos.map(abs),
    brand: car.brandName ? { '@type': 'Brand', name: car.brandName } : undefined,
    model: car.model || undefined,
    vehicleConfiguration: car.subtitle || undefined,
    itemCondition: 'https://schema.org/UsedCondition',
    vehicleModelDate: car.year ? String(car.year) : undefined,
    dateVehicleFirstRegistered: car.year
      ? `${car.year}${car.month ? '-' + String(car.month).padStart(2, '0') : ''}`
      : undefined,
    mileageFromOdometer: car.km != null ? { '@type': 'QuantitativeValue', value: car.km, unitCode: 'KMT' } : undefined,
    fuelType: car.fuel || undefined,
    vehicleTransmission: car.gearbox || undefined,
    vehicleEngine: car.power ? { '@type': 'EngineSpecification', enginePower: { '@type': 'QuantitativeValue', value: car.power, unitText: 'ch' } } : undefined,
    color: car.color || undefined,
    seatingCapacity: car.seats || undefined,
    numberOfPreviousOwners: car.highlights.some((h) => /premi[eè]re main/i.test(h)) ? 1 : undefined,
    additionalProperty: car.equipment.flatMap((g) =>
      g.items.map((i) => ({ '@type': 'PropertyValue', name: g.group, value: i })),
    ),
    offers:
      car.price != null
        ? {
            '@type': 'Offer',
            url,
            price: car.price,
            priceCurrency: 'EUR',
            availability: car.status === 'sold' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/UsedCondition',
            seller: { '@id': DEALER_ID },
            areaServed: 'FR',
          }
        : undefined,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: SITE_URL + it.path })),
  };
}

export function itemListJsonLd(cars: Car[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Véhicules d’occasion disponibles chez Autodan à Nice',
    numberOfItems: cars.length,
    itemListElement: cars.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE_URL}/voitures/${c.slug}`, name: carTitle(c) })),
  };
}
