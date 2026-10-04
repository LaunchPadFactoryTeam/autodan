(function () {
  var CDN = 'https://cdn.prod.website-files.com/693fd417d70317ae61d7663c/';
  var CMS = 'https://cdn.prod.website-files.com/693fd418d70317ae61d76716/';

  var dacia = {
    slug: 'dacia-duster',
    brandName: 'Dacia',
    model: 'Duster',
    title: 'Dacia Duster',
    subtitle: '1.5 Blue dCi 115ch — série « 15 ans »',
    year: '2020',
    price: 13000,
    priceLabel: '13 000 €',
    fuel: 'Diesel',
    engineType: 'Thermique',
    power: '115 ch',
    gearbox: 'Manuelle',
    km: '93 700 km',
    seats: '4',
    color: 'Noire',
    badges: ['Nouveauté', 'Affaire à saisir'],
    photos: [
      CMS + '6940122bf22861723b8758ea_dacia_main.png',
      CMS + '6940121a57b3242d24cfcce4_dacia1.png',
      CMS + '6940121a75b3d77c1112e04b_dacia2.png',
      CMS + '6940121ac0740b2d67a32b0b_dacia3.png'
    ],
    intro: 'Dacia Duster 1.5 Blue dCi 115ch 15 ans.',
    description: 'Le Dacia Duster recevais en 2020 une livrée spéciale « 15 ans » comprenant le pack City Plus (avertisseurs d’angle mort, caméra multivues), véhicule en parfait état possédant un suivi Renault.',
    equipment: [
      { group: 'Audio & télécommunications', items: ['Commandes audio au volant', 'Écran tactile', 'GPS cartographique', 'Kit mains-libres Bluetooth', 'Radio numérique DAB', 'Prise USB'] },
      { group: 'Conduite', items: ['Aide au démarrage en côte', 'Stop & Start', 'Limiteur de vitesse', 'Régulateur de vitesse', 'Accès sans clé', 'Assistance à la descente'] },
      { group: 'Extérieur', items: ['Barres de toit', 'Caméra multivues', 'Feux de jour à LED', 'Jantes alu bi-tons', 'Radar de stationnement AR', 'Rétroviseurs électriques dégivrants'] },
      { group: 'Intérieur', items: ['Climatisation automatique', 'Écran multifonction couleur', 'Volant multifonction', 'Vitres électriques AV / AR', 'Banquette AR rabattable', 'Fixations Isofix'] },
      { group: 'Sécurité', items: ['ABS & EBD', 'ESP + antipatinage', 'Airbags latéraux avant', 'Contrôle des angles morts', 'Détecteur de sous-gonflage', 'Aide au freinage d’urgence'] }
    ]
  };

  var twingo = {
    slug: 'twingo-iii',
    brandName: 'Renault',
    model: 'Twingo III',
    title: 'Twingo III',
    subtitle: 'Essence 95 ch — boîte automatique',
    year: '2021',
    price: 13000,
    priceLabel: '13 000 €',
    fuel: 'Essence',
    engineType: 'Thermique',
    power: '95 ch',
    gearbox: 'Automatique',
    km: '—',
    seats: '4',
    color: '—',
    badges: ['Nouveauté'],
    photos: [],
    intro: 'Twingo III automatique, citadine idéale pour Nice.',
    description: 'Photos et descriptif à fournir par Autodan — cet emplacement se remplit automatiquement dès que la fiche est complétée dans le backoffice.',
    equipment: []
  };

  var fiat = {
    slug: 'fiat-500',
    brandName: 'Fiat',
    model: '500',
    title: 'Fiat 500',
    subtitle: 'Essence 69 ch — boîte manuelle',
    year: '2016',
    price: 9000,
    priceLabel: '9 000 €',
    fuel: 'Essence',
    engineType: 'Thermique',
    power: '69 ch',
    gearbox: 'Manuelle',
    km: '—',
    seats: '4',
    color: '—',
    badges: ['Affaire à saisir'],
    photos: [],
    intro: 'Fiat 500, la citadine la plus facile à garer sur la Côte.',
    description: 'Photos et descriptif à fournir par Autodan — cet emplacement se remplit automatiquement dès que la fiche est complétée dans le backoffice.',
    equipment: []
  };

  window.AUTODAN = {
    logo: CDN + '693fd7f2babd04e5228ae504_Group%205.svg',
    heroPhoto: CDN + '6942f86a17cc559404fc7a1e_erik-mclean-3WAMh1omVAY-unsplash.jpg',
    contact: {
      address: '11 chemin de la Lauvette, 06300 Nice',
      tel: '06.95.09.01.51',
      telHref: 'tel:+33695090151',
      mail: 'autodancontact@gmail.com',
      mailHref: 'mailto:autodancontact@gmail.com?subject=Contact%20Autodan'
    },
    social: [
      { name: 'Leboncoin', url: 'https://www.leboncoin.fr/recherche?category=1&text=autodan&kst=k' },
      { name: 'Instagram', url: 'https://www.instagram.com/autodan_/' },
      { name: 'Facebook', url: 'https://www.facebook.com/p/Autodan-61574027250856/' },
      { name: 'L’Argus', url: 'https://occasion.largus.fr/auto/autodan_561924/' }
    ],
    cars: [dacia, twingo, fiat],
    reasons: [
      { title: 'Expertise locale', body: 'Des années d’expérience dans la sélection et la vente de véhicules d’occasion à Nice' },
      { title: 'Inspection rigoureuse', body: 'Chaque véhicule est contrôlé avant sa mise en vente pour garantir fiabilité et sécurité' },
      { title: 'Achat en toute confiance', body: 'Des véhicules testés, des informations claires, et aucun compromis sur la qualité.' }
    ],
    services: [
      { title: 'Achat & vente', body: 'Nous achetons votre véhicule et vendons le nôtre, avec un prix clair annoncé dès le départ.' },
      { title: 'Recherche personnalisée', body: 'Vous décrivez votre besoin et votre budget, nous trouvons le véhicule qui correspond.' },
      { title: 'Dépôt-vente', body: 'Vous nous confiez votre voiture, nous gérons annonces, visites et négociation.' },
      { title: 'Convoyage', body: 'Le véhicule est acheminé où vous le souhaitez, partout en France.' },
      { title: 'Livraison à domicile', body: 'Votre voiture vous est livrée chez vous, prête à rouler.' },
      { title: 'Gestion administrative', body: 'Carte grise, certificat de cession, contrôle technique : tout est pris en charge.' }
    ],
    about: {
      lead: 'Autodan est une entreprise indépendante basée à Nice, spécialisée dans l’achat, la vente et la recherche personnalisée de véhicules d’occasion.',
      body: 'Chaque véhicule est rigoureusement sélectionné et contrôlé, afin de garantir fiabilité, transparence et tranquilité d’esprit. Nous vous accompagnons de A à Z : recherche sur mesure, dépot-vente, convoyage, livraison à domicile et gestion administrative.',
      claim: 'Un seul interlocuteur, zéro stress, et un service clé en main pour concrétiser votre projet automobile en toute confiance.'
    },
    testimonial: {
      quote: 'Je recommande vivement les services Autodan pour votre vente/achat de véhicule. J’ai obtenu ma première voiture automatique avec eux et j’en suis plus que satisfaite !',
      name: 'Oriane Airaudi',
      role: 'Acheteuse',
      photo: CDN + '694babf5448babe7553983df_WhatsApp%20Image%202025-12-23%20at%2019.06.23.jpeg'
    }
  };
  window.dispatchEvent(new Event('autodan-data'));
})();
