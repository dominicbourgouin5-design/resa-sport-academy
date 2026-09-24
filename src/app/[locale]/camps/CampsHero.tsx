'use client';

import { useTranslations } from 'next-intl';
import PageHero from '@/components/ui/PageHero';

export default function CampsHero() {
  const t = useTranslations('campsHub');

  return (
    <PageHero
      slides={[
        '/images/programs/doors/training.jpg',
        '/images/programs/doors/academy.jpg'
      ]}
      badge={t('badge')}
      title={t('title')}
      subtitle={t('subtitle')}
    />
  );
}