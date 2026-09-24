'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

type Props = {
  stats: { schools: number; teams: number; players: number };
  isFr: boolean;
};

export default function HeroContent({ stats, isFr }: Props) {
  const t = useTranslations('universe');
  const [offset, setOffset] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        // Le contenu monte légèrement plus vite que le scroll (léger premier plan)
        // Valeur négative = monte plus vite → s'éloigne du bandeau de stats en bas
        setOffset(-y * 0.08);
        // Fade out sur 60% de la hauteur du viewport
        setOpacity(Math.max(0, 1 - y / (vh * 0.6)));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const statItems = [
    { value: `${stats.schools}+`, label: isFr ? 'Écoles' : 'Schools' },
    { value: stats.teams, label: isFr ? 'Équipes' : 'Teams' },
    { value: stats.players, label: isFr ? 'Joueurs' : 'Players' },
    { value: '2', label: isFr ? 'Continents' : 'Continents' }
  ];
  // Note : statItems est utilisé dans le bandeau de stats en bas du hero
  // (il reste dans page.tsx pour éviter le double parallax)

  return (
    <div
      className="relative mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl flex-col justify-center px-4 py-14 will-change-transform md:px-6 md:py-16"
      style={{
        transform: `translate3d(0, ${offset}px, 0)`,
        opacity
      }}
    >
      <div className="max-w-3xl">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/85 backdrop-blur anim-fade-up">
          <span className="h-1.5 w-1.5 rounded-full bg-resa-red anim-glow" />
          {t('heroBadge')}
        </span>

        <h1 className="font-display text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl md:text-7xl lg:text-7xl">
          <span className="block anim-fade-up delay-100">{t('heroTitle1')}</span>
          <span className="block text-resa-red anim-fade-up delay-200">
            {t('heroTitle2')}
          </span>
          <span className="block anim-fade-up delay-300">{t('heroTitle3')}</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 anim-fade-up delay-500 sm:text-lg md:text-xl">
          {t('heroSubtitle')}
        </p>

        <div className="mt-8 flex flex-wrap gap-3 anim-fade-up delay-700">
          <Link
            href="/programs"
            className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:scale-[1.03] hover:bg-red-700"
          >
            {t('heroCtaPrimary')}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href="/private-training"
            className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white backdrop-blur transition-all duration-300 hover:scale-[1.03] hover:bg-white hover:text-resa-navy"
          >
            {t('heroCtaSecondary')}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}