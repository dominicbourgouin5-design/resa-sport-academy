'use client';

import { useTranslations } from 'next-intl';
import PageHero from '@/components/ui/PageHero';

export default function AcademyHero() {
  const t = useTranslations('academy');

  return (
    <PageHero
      slides={[
        '/images/headers/academy-1.jpg',
        '/images/headers/academy-2.jpg'
      ]}
      badge={t('badge')}
      title={t('title')}
      subtitle={t('subtitle')}
    />
  );
}