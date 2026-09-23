'use client';

import { useTranslations } from 'next-intl';
import PageHero from '@/components/ui/PageHero';

export default function CompetitionHero({ seasonName }: { seasonName: string }) {
  const t = useTranslations('competition');

  return (
    <PageHero
      slides={[
        '/images/headers/competition-1.jpg',
        '/images/headers/competition-2.jpg'
      ]}
      badge={seasonName}
      title={t('title')}
      subtitle={t('subtitle')}
    />
  );
}