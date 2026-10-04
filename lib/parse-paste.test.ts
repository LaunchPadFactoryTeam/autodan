import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePaste } from './parse-paste';

const FIESTA = `brandName : Ford
model : Fiesta
subtitle : 1.0 EcoBoost Hybrid 125 ch
year : 2020
month : 12
price : 13900
km : 48000
fuel : Essence micro-hybride (mHEV)
gearbox : Manuelle 6 rapports
power : 125
color : Gris magnétique métallisé
seats : 5
intro : Première main, suivi d'entretien complet, révision et contrôle technique de 2026.
highlights :
- Première main
- Révision complète 04/2026
- Contrôle technique 05/2026
equipment.interieur :
- Écran tactile couleur Ford SYNC
- Apple CarPlay / Android Auto
- Climatisation automatique
- Démarrage sans clé
equipment.exterieur :
- Jantes alliage gris anthracite 17 pouces
- Vitres arrière surteintées
- Feux arrière à LED
equipment.conduite :
- Radars de recul
- Régulateur et limiteur de vitesse
- Aide au maintien dans la voie
equipment.securite :
- ABS, ESP
- Airbags frontaux, latéraux, rideaux
- Fixations Isofix
description :
Très belle Ford Fiesta de décembre 2020 dans un excellent état général
intérieur comme extérieur. Véhicule visible sur rendez-vous uniquement,
possibilité de livraison à domicile.`;

test('parses the reference Fiesta block from the note', () => {
  const { car, unknown } = parsePaste(FIESTA);
  assert.equal(car.brandName, 'Ford');
  assert.equal(car.model, 'Fiesta');
  assert.equal(car.subtitle, '1.0 EcoBoost Hybrid 125 ch');
  assert.equal(car.year, 2020);
  assert.equal(car.month, 12);
  assert.equal(car.price, 13900);
  assert.equal(car.km, 48000);
  assert.equal(car.fuel, 'Hybride');
  assert.equal(car.gearbox, 'Manuelle');
  assert.equal(car.power, 125);
  assert.equal(car.seats, 5);
  assert.equal(car.color, 'Gris magnétique métallisé');
  assert.deepEqual(car.highlights, ['Première main', 'Révision complète 04/2026', 'Contrôle technique 05/2026']);
  assert.deepEqual(car.equipment.map((g) => g.group), ['Intérieur & confort', 'Extérieur', 'Conduite', 'Sécurité']);
  assert.deepEqual(car.equipment[3].items, ['ABS, ESP', 'Airbags frontaux, latéraux, rideaux', 'Fixations Isofix']);
  assert.match(car.description, /^Très belle Ford Fiesta/);
  assert.match(car.description, /livraison à domicile\.$/);
  assert.deepEqual(unknown, []);
});

test('tolerates accents, case, spacing, numbers as read, bullets and emoji', () => {
  const { car, unknown } = parsePaste(`
**Marque**: Peugeot
MODÈLE :208
Prix : 13 900 €
Kilométrage:  48 000 km
Puissance : 100 ch
Carburant : gazole
Boîte : BVA8
année : 03/2021

equipment.Sécurité :
🔹 Sécurité 🔹
• ABS
· ESP
equipment.confort :
* Climatisation
warranty : 12 mois
`);
  assert.equal(car.brandName, 'Peugeot');
  assert.equal(car.model, '208');
  assert.equal(car.price, 13900);
  assert.equal(car.km, 48000);
  assert.equal(car.power, 100);
  assert.equal(car.fuel, 'Diesel');
  assert.equal(car.gearbox, 'Automatique');
  assert.equal(car.year, 2021);
  assert.equal(car.month, 3);
  assert.deepEqual(car.equipment, [
    { group: 'Sécurité', items: ['ABS', 'ESP'] },
    { group: 'Intérieur & confort', items: ['Climatisation', 'warranty : 12 mois'] },
  ]);
  assert.deepEqual(unknown, []);
});

test('keeps unknown keys and does not cut descriptions on "Contact : …"', () => {
  const { car, unknown, warnings } = parsePaste(`garantie : 12 mois
brandName : Fiat
fuel : vapeur
description :
Belle voiture.

Contact : 06 00 00 00 00`);
  assert.deepEqual(unknown, [{ key: 'garantie', value: '12 mois' }]);
  assert.equal(car.brandName, 'Fiat');
  assert.equal(car.fuel, '');
  assert.ok(warnings.some((w) => w.includes('vapeur')));
  assert.equal(car.description, 'Belle voiture.\n\nContact : 06 00 00 00 00');
});
