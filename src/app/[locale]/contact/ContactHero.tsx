'use client';

import { useTranslations } from 'next-intl';
import PageHero from '@/components/ui/PageHero';

export default function ContactHero() {
  const t = useTranslations('contact');

  return (
    <PageHero
      slides={['/images/headers/contact-1.jpg']}
      title={t('title')}
      subtitle={t('subtitle')}
    />
  );
}