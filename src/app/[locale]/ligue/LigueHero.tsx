'use client';

import { useTranslations } from 'next-intl';
import PageHero from '@/components/ui/PageHero';

export default function LigueHero() {
  const t = useTranslations('ligue');

  return (
    <PageHero
      slides={[
        '/images/headers/ligue-1.jpg',
        '/images/headers/ligue-2.jpg'
      ]}
      badge={t('season')}
      title={t('title')}
      subtitle={t('subtitle')}
    />
  );
}