/**
 * /llms.txt — a plain-text summary for AI answer engines (GEO): who Autodan is, how to reach them,
 * and the live stock with prices, so an assistant asked "voiture d'occasion à Nice" can cite real facts.
 */
import { getPublicCars } from '@/lib/cars';
import { carTitle, dateLabel, euro, kmLabel, powerLabel } from '@/lib/format';
import { SITE_URL, site } from '@/lib/site';

export const revalidate = 86400;

export async function GET() {
  const cars = await getPublicCars();
  const c = site.contact;
  const available = cars.filter((x) => x.status === 'available');
  const lines = [
    `# ${site.name} — voitures d’occasion à Nice`,
    '',
    `> ${site.description}`,
    '',
    '## Contact',
    `- Adresse : ${c.address}, France`,
    `- Téléphone : ${c.tel} (${c.telIntl})`,
    `- E-mail : ${c.mail}`,
    `- Site : ${SITE_URL}`,
    ...site.social.map((s) => `- ${s.name} : ${s.url}`),
    '',
    '## Services',
    ...site.services.map((s) => `- ${s.title} : ${s.body}`),
    '',
    `## Véhicules disponibles (${available.length})`,
    ...available.map((x) =>
      `- [${carTitle(x)} ${x.subtitle}](${SITE_URL}/voitures/${x.slug}) — ${[euro(x.price), dateLabel(x), kmLabel(x.km), x.fuel, x.gearbox, powerLabel(x.power)].filter(Boolean).join(', ')}`,
    ),
    '',
    '## Pages',
    `- [Tous les véhicules](${SITE_URL}/voitures)`,
    `- [Qui sommes-nous et services](${SITE_URL}/a-propos)`,
    `- [Contact](${SITE_URL}/contact)`,
    '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
