'use client';

import { useTranslations } from 'next-intl';
import PageHero from '@/components/ui/PageHero';

export default function ResaHero() {
  const t = useTranslations('resa');

  return (
    <PageHero
      slides={['/images/headers/resa-1.jpg']}
      badge={t('badge')}
      title={t('title')}
      subtitle={t('subtitle')}
    />
  );
}