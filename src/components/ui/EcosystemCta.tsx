'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function EcosystemCta({ isFr }: { isFr: boolean }) {
  const t = useTranslations('universe');
  const ref = useRef<HTMLElement>(null);
  const [bgTop, setBgTop] = useState(0);
  const [bgHeight, setBgHeight] = useState(0);

  // Simule background-attachment: fixed (fiable sur iOS aussi)
  useEffect(() => {
    const update = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      // Le fond est positionné pour rester collé au viewport
      setBgTop(-rect.top);
      setBgHeight(window.innerHeight);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-resa-navy py-24 text-white md:py-32"
    >
      {/* ─── Image de fond FIXE (le contenu scrolle par-dessus) ─── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/images/home/cta-ecosystem.jpg)',
          top: bgTop,
          height: bgHeight
        }}
      />

      {/* ─── Overlay navy ─── */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,31,68,0.85) 0%, rgba(10,31,68,0.72) 40%, rgba(6,21,48,0.94) 100%)'
        }}
      />

      <div aria-hidden className="absolute inset-0 bg-dots opacity-20" />

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-resa-red/15 blur-3xl anim-float"
      />

      {/* ─── Contenu ─── */}
      <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
        <h2 className="font-display text-4xl font-black md:text-6xl">
          {t('ctaTitle')}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
          {t('ctaText')}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/inscriptions"
            className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:scale-[1.04] hover:bg-red-700"
          >
            {isFr ? "S'inscrire" : 'Register'}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href="/sponsors"
            className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.04] hover:bg-white hover:text-resa-navy"
          >
            {t('ctaPartner')}
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}