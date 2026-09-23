'use client';

import { useTranslations } from 'next-intl';
import PageHero from '@/components/ui/PageHero';

export default function SponsorsHero({ count }: { count: number }) {
  const t = useTranslations('sponsors');

  return (
    <PageHero
      slides={['/images/headers/sponsors-1.jpg']}
      badge={`${count} ${count > 1 ? 'partenaires officiels' : 'partenaire officiel'}`}
      title={t('title')}
      subtitle={t('subtitle')}
    />
  );
}