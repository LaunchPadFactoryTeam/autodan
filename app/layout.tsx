import type { Metadata, Viewport } from 'next';
import { Archivo, Host_Grotesk } from 'next/font/google';
import { SITE_URL, site } from '@/lib/site';

const host = Host_Grotesk({ subsets: ['latin'], variable: '--font-host', display: 'swap' });
const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${site.name} — Voitures d’occasion à Nice`, template: `%s | ${site.name} Nice` },
  description: site.description,
  applicationName: site.name,
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: site.name,
    images: [{ url: '/images/og.jpg', width: 1200, height: 630, alt: 'Autodan, voitures d’occasion à Nice' }],
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = {
  themeColor: '#052747',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${host.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
