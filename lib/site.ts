/** Business information shared by every page, the JSON-LD and llms.txt. */

const CDN = 'https://cdn.prod.website-files.com/693fd417d70317ae61d7663c/';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://autodan.vercel.app').replace(/\/$/, '');

export const site = {
  name: 'Autodan',
  tagline: 'Achat, vente et recherche de véhicules d’occasion à Nice',
  description:
    'Autodan, concessionnaire indépendant de véhicules d’occasion à Nice : voitures inspectées et prêtes à rouler, recherche personnalisée, dépôt-vente, convoyage, livraison à domicile et gestion administrative.',
  logo: CDN + '693fd7f2babd04e5228ae504_Group%205.svg',
  contact: {
    street: '11 chemin de la Lauvette',
    postalCode: '06300',
    city: 'Nice',
    region: 'Provence-Alpes-Côte d’Azur',
    address: '11 chemin de la Lauvette, 06300 Nice',
    tel: '06.95.09.01.51',
    telIntl: '+33695090151',
    telHref: 'tel:+33695090151',
    mail: 'autodancontact@gmail.com',
    mailHref: 'mailto:autodancontact@gmail.com?subject=Contact%20Autodan',
  },
  social: [
    { name: 'Leboncoin', url: 'https://www.leboncoin.fr/recherche?category=1&text=autodan&kst=k' },
    { name: 'Instagram', url: 'https://www.instagram.com/autodan_/' },
    { name: 'Facebook', url: 'https://www.facebook.com/p/Autodan-61574027250856/' },
    { name: 'L’Argus', url: 'https://occasion.largus.fr/auto/autodan_561924/' },
  ],
  reasons: [
    { title: 'Expertise locale', body: 'Des années d’expérience dans la sélection et la vente de véhicules d’occasion à Nice' },
    { title: 'Inspection rigoureuse', body: 'Chaque véhicule est contrôlé avant sa mise en vente pour garantir fiabilité et sécurité' },
    { title: 'Achat en toute confiance', body: 'Des véhicules testés, des informations claires, et aucun compromis sur la qualité.' },
  ],
  services: [
    { title: 'Achat & vente', body: 'Nous achetons votre véhicule et vendons le nôtre, avec un prix clair annoncé dès le départ.' },
    { title: 'Recherche personnalisée', body: 'Vous décrivez votre besoin et votre budget, nous trouvons le véhicule qui correspond.' },
    { title: 'Dépôt-vente', body: 'Vous nous confiez votre voiture, nous gérons annonces, visites et négociation.' },
    { title: 'Convoyage', body: 'Le véhicule est acheminé où vous le souhaitez, partout en France.' },
    { title: 'Livraison à domicile', body: 'Votre voiture vous est livrée chez vous, prête à rouler.' },
    { title: 'Gestion administrative', body: 'Carte grise, certificat de cession, contrôle technique : tout est pris en charge.' },
  ],
  about: {
    lead: 'Autodan est une entreprise indépendante basée à Nice, spécialisée dans l’achat, la vente et la recherche personnalisée de véhicules d’occasion.',
    body: 'Chaque véhicule est rigoureusement sélectionné et contrôlé, afin de garantir fiabilité, transparence et tranquillité d’esprit. Nous vous accompagnons de A à Z : recherche sur mesure, dépôt-vente, convoyage, livraison à domicile et gestion administrative.',
    claim: 'Un seul interlocuteur, zéro stress, et un service clé en main pour concrétiser votre projet automobile en toute confiance.',
  },
  testimonial: {
    quote:
      'Je recommande vivement les services Autodan pour votre vente/achat de véhicule. J’ai obtenu ma première voiture automatique avec eux et j’en suis plus que satisfaite !',
    name: 'Oriane Airaudi',
    role: 'Acheteuse',
    photo: CDN + '694babf5448babe7553983df_WhatsApp%20Image%202025-12-23%20at%2019.06.23.jpeg',
  },
  topics: ['Un véhicule en stock', 'Recherche personnalisée', 'Vendre / faire estimer ma voiture', 'Dépôt-vente', 'Autre'],
};

export const NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/voitures', label: 'Véhicules' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
];
