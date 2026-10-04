/**
 * Copies the images still served by the old Webflow CDN (logo, Dacia photos, testimonial photo)
 * into public/images/webflow and rewrites the references in lib/, so the site no longer depends on Webflow.
 *
 * Run once, before closing the Webflow account:  npm run assets:import
 * Note: once the stock has been saved from the backoffice, it lives in Vercel Blob — re-upload the
 * Dacia photos from the backoffice (Modifier → Photos) if they still point at Webflow.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const BASES = {
  CDN: 'https://cdn.prod.website-files.com/693fd417d70317ae61d7663c/',
  CMS: 'https://cdn.prod.website-files.com/693fd418d70317ae61d76716/',
};

await mkdir('public/images/webflow', { recursive: true });
for (const file of ['lib/site.ts', 'lib/seed.ts']) {
  const jobs = [];
  const src = (await readFile(file, 'utf8')).replace(/\b(CDN|CMS) \+ '([^']+)'/g, (_m, base, name) => {
    const local = '/images/webflow/' + decodeURIComponent(name).replace(/[^\w.-]+/g, '-');
    jobs.push([BASES[base] + name, local]);
    return `'${local}'`;
  });
  for (const [url, local] of jobs) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    await writeFile(path.join('public', local), Buffer.from(await res.arrayBuffer()));
    console.log('✓', local);
  }
  await writeFile(file, src);
}
console.log('Terminé. Vérifiez puis commitez public/images/webflow et lib/.');
