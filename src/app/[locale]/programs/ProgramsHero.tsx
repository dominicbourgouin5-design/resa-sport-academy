'use client';

import { useTranslations } from 'next-intl';
import PageHero from '@/components/ui/PageHero';

export default function ProgramsHero() {
  const t = useTranslations('programsHub');

  return (
    <PageHero
      slides={[
        '/images/headers/programs-1.jpg',
        '/images/headers/academy-1.jpg',
        '/images/headers/private-training-1.jpg'
      ]}
      badge={t('badge')}
      title={t('title')}
      subtitle={t('subtitle')}
    />
  );
}