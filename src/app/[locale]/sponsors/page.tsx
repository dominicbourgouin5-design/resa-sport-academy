import { setRequestLocale } from 'next-intl/server';
import SponsorsHero from './SponsorsHero';
import SponsorsClient from './SponsorsClient';
import { getSponsors } from '@/lib/queries';

export default async function SponsorsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sponsors = await getSponsors();

  return (
    <>
      <SponsorsHero count={sponsors.length} />
      <SponsorsClient sponsors={sponsors} />
    </>
  );
}