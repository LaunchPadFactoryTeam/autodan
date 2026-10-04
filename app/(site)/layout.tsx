import Script from 'next/script';
import '../site.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { JsonLd } from '@/components/JsonLd';
import { dealerJsonLd, websiteJsonLd } from '@/lib/seo';

const UMAMI_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip" href="#contenu">Aller au contenu</a>
      <Header />
      <div id="contenu">{children}</div>
      <Footer />
      <JsonLd data={[dealerJsonLd(), websiteJsonLd()]} />
      {UMAMI_ID && (
        <Script src={UMAMI_SRC} data-website-id={UMAMI_ID} data-domains={process.env.NEXT_PUBLIC_UMAMI_DOMAINS} strategy="afterInteractive" />
      )}
    </>
  );
}
