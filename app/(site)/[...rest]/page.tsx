import { notFound } from 'next/navigation';

/** Sends unknown URLs to (site)/not-found.tsx so the 404 keeps the header, footer and links. */
export default function CatchAll() {
  notFound();
}
