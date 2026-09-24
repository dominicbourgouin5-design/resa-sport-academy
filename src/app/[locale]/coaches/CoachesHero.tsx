'use client';

import { useTranslations } from 'next-intl';
import PageHero from '@/components/ui/PageHero';

export default function CoachesHero() {
  const t = useTranslations('coaches');

  return (
    <PageHero
      slides={[
        '/images/headers/coaches-1.jpg',
        '/images/headers/coaches-2.jpg'
      ]}
      badge={t('badge')}
      title={t('title')}
      subtitle={t('subtitle')}
    />
  );
}