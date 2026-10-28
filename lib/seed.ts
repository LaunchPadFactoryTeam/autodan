import type { Car, CarInput } from './types';

/** Stock shown until the first save from the backoffice. Mirrors the existing Webflow site. */

const CMS = 'https://cdn.prod.website-files.com/693fd418d70317ae61d76716/';
const T = '2026-10-04T00:00:00.000Z';

export function emptyCar(): CarInput {
  return {
    status: 'available',
    featured: false,
    brandName: '',
    model: '',
    subtitle: '',
    year: null,
    month: null,
    price: null,
    km: null,
    fuel: '',
    gearbox: '',
    power: null,
    color: '',
    seats: null,
    badges: [],
    photos: [],
    intro: '',
    description: '',
    highlights: [],
    equipment: [],
  };
}

export const SEED_CARS: Car[] = [
  {
    ...emptyCar(),
    slug: 'dacia-duster-2020',
    brandName: 'Dacia',
    model: 'Duster',
    subtitle: '1.5 Blue dCi 115ch — série « 15 ans »',
    year: 2020,
    price: 13000,
    km: 93700,
    fuel: 'Diesel',
    gearbox: 'Manuelle',
    power: 115,
    color: 'Noire',
    seats: 4,
    badges: ['Nouveauté', 'Affaire à saisir'],
    photos: [
      CMS + '6940122bf22861723b8758ea_dacia_main.png',
      CMS + '6940121a57b3242d24cfcce4_dacia1.png',
      CMS + '6940121a75b3d77c1112e04b_dacia2.png',
      CMS + '6940121ac0740b2d67a32b0b_dacia3.png',
    ],
    intro: 'Dacia Duster 1.5 Blue dCi 115ch 15 ans.',
    description:
      'Le Dacia Duster recevait en 2020 une livrée spéciale « 15 ans » comprenant le pack City Plus (avertisseurs d’angle mort, caméra multivues), véhicule en parfait état possédant un suivi Renault.',
    equipment: [
      { group: 'Audio & télécommunications', items: ['Commandes audio au volant', 'Écran tactile', 'GPS cartographique', 'Kit mains-libres Bluetooth', 'Radio numérique DAB', 'Prise USB'] },
      { group: 'Conduite', items: ['Aide au démarrage en côte', 'Stop & Start', 'Limiteur de vitesse', 'Régulateur de vitesse', 'Accès sans clé', 'Assistance à la descente'] },
      { group: 'Extérieur', items: ['Barres de toit', 'Caméra multivues', 'Feux de jour à LED', 'Jantes alu bi-tons', 'Radar de stationnement AR', 'Rétroviseurs électriques dégivrants'] },
      { group: 'Intérieur', items: ['Climatisation automatique', 'Écran multifonction couleur', 'Volant multifonction', 'Vitres électriques AV / AR', 'Banquette AR rabattable', 'Fixations Isofix'] },
      { group: 'Sécurité', items: ['ABS & EBD', 'ESP + antipatinage', 'Airbags latéraux avant', 'Contrôle des angles morts', 'Détecteur de sous-gonflage', 'Aide au freinage d’urgence'] },
    ],
    createdAt: T,
    updatedAt: T,
  },
  {
    ...emptyCar(),
    slug: 'renault-twingo-iii-2021',
    brandName: 'Renault',
    model: 'Twingo III',
    subtitle: 'Essence 95 ch — boîte automatique',
    year: 2021,
    price: 13000,
    fuel: 'Essence',
    gearbox: 'Automatique',
    power: 95,
    seats: 4,
    badges: ['Nouveauté'],
    intro: 'Twingo III automatique, citadine idéale pour Nice.',
    description: 'Citadine automatique facile à vivre et à garer. Photos et descriptif complet sur demande.',
    createdAt: T,
    updatedAt: T,
  },
  {
    ...emptyCar(),
    slug: 'fiat-500-2016',
    brandName: 'Fiat',
    model: '500',
    subtitle: 'Essence 69 ch — boîte manuelle',
    year: 2016,
    price: 9000,
    fuel: 'Essence',
    gearbox: 'Manuelle',
    power: 69,
    seats: 4,
    badges: ['Affaire à saisir'],
    intro: 'Fiat 500, la citadine la plus facile à garer sur la Côte.',
    description: 'Citadine économique et maniable. Photos et descriptif complet sur demande.',
    createdAt: T,
    updatedAt: T,
  },
];
