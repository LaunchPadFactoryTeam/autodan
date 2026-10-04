import { notFound } from 'next/navigation';
import { Backoffice } from '@/components/admin/Backoffice';
import { isAdminToken } from '@/lib/admin';
import { SITE_URL } from '@/lib/site';
import { readCars, readDrafts, readMessages, usesBlob } from '@/lib/store';
import { getUmamiSummary } from '@/lib/umami';

export const dynamic = 'force-dynamic';

export default async function GestionPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isAdminToken(token)) notFound();

  const [cars, drafts, messages, stats] = await Promise.all([
    readCars(),
    readDrafts().catch(() => []),
    readMessages().catch(() => []),
    getUmamiSummary(30),
  ]);

  return (
    <Backoffice
      token={token}
      initialCars={cars}
      initialDrafts={drafts}
      initialMessages={messages}
      stats={stats}
      config={{
        siteUrl: SITE_URL,
        storageReady: usesBlob() || !process.env.VERCEL,
        tallyFormId: process.env.NEXT_PUBLIC_TALLY_FORM_ID || '',
        umamiShareUrl: process.env.UMAMI_SHARE_URL || '',
        umamiConfigured: !!process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
      }}
    />
  );
}
