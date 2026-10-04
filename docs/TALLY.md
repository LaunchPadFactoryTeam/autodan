# Formulaire Tally — porte 1 « champ par champ »

Le formulaire est **intégré dans le backoffice** (onglet *Ajouter un véhicule → Porte 1*). Quand il est validé,
la fiche s'ouvre aussitôt dans l'écran de relecture. Le webhook sert de filet : une réponse envoyée hors du
backoffice (lien Tally direct) apparaît dans « À relire avant mise en ligne ».

Tout fonctionne avec l'offre **gratuite** de Tally (upload de fichiers, webhooks et intégration inclus).

## 1. Créer le formulaire

Sur [tally.so](https://tally.so) → *Create form*. Ajoutez les questions ci-dessous **avec ces intitulés**
(le site reconnaît les questions par un mot-clé de leur titre : « marque », « prix », « kilométrage »… vous
pouvez reformuler tant que le mot-clé reste).

| # | Intitulé de la question | Type Tally | Champ de la fiche | Requis |
|---|---|---|---|---|
| 1 | Marque | Dropdown (liste ci-dessous) | `brandName` | oui |
| 2 | Modèle | Short answer | `model` | oui |
| 3 | Version / motorisation | Short answer | `subtitle` | |
| 4 | Année de mise en circulation | Number | `year` | oui |
| 5 | Mois de mise en circulation | Dropdown : Janvier … Décembre | `month` | |
| 6 | Prix de vente (€) | Number | `price` | oui |
| 7 | Kilométrage (km) | Number | `km` | oui |
| 8 | Carburant | Multiple choice : Essence, Diesel, Hybride, Hybride rechargeable, Électrique, GPL | `fuel` | oui |
| 9 | Boîte de vitesses | Multiple choice : Manuelle, Automatique | `gearbox` | oui |
| 10 | Puissance (ch) | Number | `power` | |
| 11 | Couleur | Short answer | `color` | |
| 12 | Nombre de places | Number | `seats` | |
| 13 | Phrase de résumé | Short answer (max 120 caractères) | `intro` | |
| 14 | Points forts (un par ligne) | Long answer | `highlights` | |
| 15 | Équipements · Intérieur & confort | Checkboxes | `equipment` | |
| 16 | Équipements · Extérieur | Checkboxes | `equipment` | |
| 17 | Équipements · Conduite | Checkboxes | `equipment` | |
| 18 | Équipements · Sécurité | Checkboxes | `equipment` | |
| 19 | Autres équipements | Long answer (séparés par des virgules ou un par ligne) | `equipment` | |
| 20 | Description | Long answer | `description` | |
| 21 | Photos du véhicule (la première sert de visuel principal) | File upload, plusieurs fichiers | `photos` | oui |

Conseil mobile : une page Tally par bloc (identité → prix/km → technique → équipements → texte → photos).

**Marques** (question 1) : Abarth, Alfa Romeo, Audi, BMW, Citroën, Cupra, Dacia, DS, Fiat, Ford, Honda,
Hyundai, Jeep, Kia, Land Rover, Mazda, Mercedes-Benz, MG, Mini, Nissan, Opel, Peugeot, Porsche, Renault, Seat,
Skoda, Smart, Suzuki, Tesla, Toyota, Volkswagen, Volvo, Autre.

**Équipements** — douze cases par groupe, tirées des annonces Fiesta et Duster :

- *Intérieur & confort* : Climatisation automatique, Écran tactile, Apple CarPlay / Android Auto, Bluetooth,
  GPS, Volant multifonction, Volant cuir, Démarrage sans clé, Sièges chauffants, Accoudoir central,
  Vitres électriques AV/AR, Banquette AR rabattable
- *Extérieur* : Jantes alliage, Vitres arrière surteintées, Feux LED, Feux de jour LED, Rétroviseurs
  électriques, Rétroviseurs rabattables, Barres de toit, Toit ouvrant / panoramique, Peinture métallisée,
  Caméra de recul, Radars de recul, Attelage
- *Conduite* : Régulateur de vitesse, Limiteur de vitesse, Régulateur adaptatif, Stop & Start, Aide au
  démarrage en côte, Aide au maintien dans la voie, Alerte de franchissement de ligne, Détection de fatigue,
  Modes de conduite, Indicateur de pression des pneus, Écran conducteur numérique, Aide au stationnement
- *Sécurité* : ABS, ESP, Airbags frontaux, Airbags latéraux, Airbags rideaux, Fixations Isofix, Freinage
  d'urgence automatique, Surveillance des angles morts, Verrouillage centralisé, Antidémarrage, Reconnaissance
  des panneaux, Appel d'urgence (eCall)

## 2. Relier le formulaire au site

1. **Publish** le formulaire. Son identifiant est la fin de son adresse : `https://tally.so/r/`**`w4XyZq`**.
2. Dans Vercel → *Settings → Environment Variables* : `NEXT_PUBLIC_TALLY_FORM_ID = w4XyZq`.
3. Dans Tally → *Integrations → Webhooks → Connect* :
   - Endpoint URL : `https://<votre-site>/api/tally`
   - Cochez *Signing secret*, copiez la valeur et collez-la sur Vercel dans `TALLY_SIGNING_SECRET`.
4. Redéployez (Vercel → *Deployments → Redeploy*).

Les photos déposées dans Tally sont copiées dans le stockage du site au moment de « Mettre en ligne »
(redimensionnées, compressées) : la fiche ne dépend pas de Tally une fois publiée.

## Dépannage

- *La fiche ne s'ouvre pas après validation* : elle arrive quand même par le webhook dans « À relire avant
  mise en ligne » — rechargez la page de gestion.
- *Un champ reste vide* : vérifiez que l'intitulé de la question contient le mot-clé du tableau.
- *Sans Tally*, la porte 1 propose le **formulaire intégré** (même écran que la relecture), qui fonctionne seul.
