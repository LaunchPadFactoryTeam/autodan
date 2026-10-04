import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapTallySubmission } from './tally';

test('maps a Tally webhook body', () => {
  const { externalId, car, unknown } = mapTallySubmission({
    eventType: 'FORM_RESPONSE',
    data: {
      submissionId: 'sub_1',
      fields: [
        { key: 'q1', label: 'Marque', type: 'DROPDOWN', value: ['o1'], options: [{ id: 'o1', text: 'Ford' }, { id: 'o2', text: 'Fiat' }] },
        { key: 'q2', label: 'Modèle', type: 'INPUT_TEXT', value: 'Fiesta' },
        { key: 'q3', label: 'Version / motorisation', type: 'INPUT_TEXT', value: '1.0 EcoBoost 125 ch' },
        { key: 'q4', label: 'Année de mise en circulation', type: 'INPUT_NUMBER', value: 2020 },
        { key: 'q5', label: 'Mois de mise en circulation', type: 'DROPDOWN', value: ['m12'], options: [{ id: 'm12', text: 'Décembre' }] },
        { key: 'q6', label: 'Prix de vente (€)', type: 'INPUT_NUMBER', value: 13900 },
        { key: 'q7', label: 'Kilométrage (km)', type: 'INPUT_NUMBER', value: 48000 },
        { key: 'q8', label: 'Carburant', type: 'MULTIPLE_CHOICE', value: ['f1'], options: [{ id: 'f1', text: 'Hybride' }] },
        { key: 'q9', label: 'Boîte de vitesses', type: 'MULTIPLE_CHOICE', value: ['g1'], options: [{ id: 'g1', text: 'Manuelle' }] },
        { key: 'q10', label: 'Équipements · Sécurité', type: 'CHECKBOXES', value: ['s1', 's2'], options: [{ id: 's1', text: 'ABS' }, { id: 's2', text: 'ESP' }] },
        { key: 'q10_s1', label: 'Équipements · Sécurité (ABS)', type: 'CHECKBOXES', value: true },
        { key: 'q11', label: 'Autres équipements', type: 'TEXTAREA', value: 'Toit ouvrant, Attelage' },
        { key: 'q12', label: 'Photos du véhicule', type: 'FILE_UPLOAD', value: [{ id: 'p', name: 'a.jpg', url: 'https://storage.tally.so/a.jpg' }] },
        { key: 'q13', label: 'Garantie', type: 'INPUT_TEXT', value: '12 mois' },
      ],
    },
  });
  assert.equal(externalId, 'sub_1');
  assert.equal(car.brandName, 'Ford');
  assert.equal(car.model, 'Fiesta');
  assert.equal(car.subtitle, '1.0 EcoBoost 125 ch');
  assert.equal(car.year, 2020);
  assert.equal(car.month, 12);
  assert.equal(car.price, 13900);
  assert.equal(car.km, 48000);
  assert.equal(car.fuel, 'Hybride');
  assert.equal(car.gearbox, 'Manuelle');
  assert.deepEqual(car.equipment, [
    { group: 'Sécurité', items: ['ABS', 'ESP'] },
    { group: 'Autres équipements', items: ['Toit ouvrant', 'Attelage'] },
  ]);
  assert.deepEqual(car.photos, ['https://storage.tally.so/a.jpg']);
  assert.deepEqual(unknown, [{ key: 'Garantie', value: '12 mois' }]);
});

test('maps the embed Tally.FormSubmitted payload', () => {
  const { externalId, car } = mapTallySubmission({
    id: 'sub_2',
    fields: [
      { id: 'a', title: 'Marque', type: 'DROPDOWN', answer: { value: ['Fiat'] } },
      { id: 'b', title: 'Prix de vente (€)', type: 'INPUT_NUMBER', answer: { value: '9 000' } },
    ],
  });
  assert.equal(externalId, 'sub_2');
  assert.equal(car.brandName, 'Fiat');
  assert.equal(car.price, 9000);
});
