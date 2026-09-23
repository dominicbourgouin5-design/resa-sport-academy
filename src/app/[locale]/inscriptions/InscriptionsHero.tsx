'use client';

import { useTranslations } from 'next-intl';
import PageHero from '@/components/ui/PageHero';

export default function InscriptionsHero() {
  const t = useTranslations('inscriptions');

  return (
    <PageHero
      slides={['/images/headers/inscriptions-1.jpg']}
      badge="Saison 2027 · Inscriptions ouvertes"
      title={t('title')}
      subtitle={t('subtitle')}
    />
  );
}