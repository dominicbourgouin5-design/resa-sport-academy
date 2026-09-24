'use client';

import { useTranslations } from 'next-intl';
import PageHero from '@/components/ui/PageHero';

export default function PrivateTrainingHero() {
  const t = useTranslations('privateTraining');

  return (
    <PageHero
      slides={[
        '/images/headers/private-training-1.jpg',
        '/images/headers/private-training-3.jpg'
      ]}
      badge={t('badge')}
      title={t('title')}
      subtitle={t('subtitle')}
    />
  );
}