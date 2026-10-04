import { revalidatePath } from 'next/cache';

/** Regenerates every public page (home, stock, car pages, sitemap, llms.txt) after a change in the backoffice. */
export function revalidateSite() {
  revalidatePath('/', 'layout');
  revalidatePath('/sitemap.xml');
  revalidatePath('/llms.txt');
}
