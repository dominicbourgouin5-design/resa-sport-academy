'use client';

import { useTranslations, useLocale } from 'next-intl';
import PageHero from '@/components/ui/PageHero';

export default function NewsHero({ count }: { count: number }) {
  const t = useTranslations('news');
  const locale = useLocale();
  const isFr = locale === 'fr';

  return (
    <PageHero
      slides={['/images/headers/actualites-1.jpg']}
      badge={`${count} ${isFr ? 'articles publiés' : 'published articles'}`}
      title={t('title')}
      subtitle={t('subtitle')}
    />
  );
}