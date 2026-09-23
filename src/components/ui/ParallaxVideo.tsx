'use client';

import { useEffect, useRef, useState } from 'react';

export default function ParallaxVideo({
  src = '/videos/hero.mp4',
  poster = '/images/hero-poster.jpg'
}: {
  src?: string;
  poster?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [offset, setOffset] = useState(0);

  // Parallax : translateY progressif selon le scroll
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let rafId: number;

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Progression : 0 quand la section entre par le bas, 1 quand elle sort par le haut
        const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);

        // Amplitude du parallax en pixels (plus grand = plus visible)
        const amplitude = 120;
        const y = (progress - 0.5) * amplitude * 2;

        setOffset(y);
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[70vh] min-h-[420px] overflow-hidden bg-resa-navy-deep text-white md:h-[85vh] md:min-h-[600px]"
    >
      {/* Vidéo en parallax */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        className="absolute inset-0 h-[calc(100%+240px)] w-full object-cover"
        style={{ transform: `translateY(${offset - 120}px)` }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Overlay navy pour lisibilité */}
      <div className="absolute inset-0 bg-resa-navy/65" />
      <div className="absolute inset-0 bg-gradient-to-t from-resa-navy via-resa-navy/40 to-transparent" />

      {/* Motifs décoratifs */}
      <div className="absolute inset-0 bg-grid opacity-20" />

      {/* Contenu textuel sur la vidéo */}
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-14 md:px-6 md:pb-20">
        <div className="max-w-3xl">
          <div className="mb-4 h-1 w-14 bg-resa-red" />
          <h2 className="font-display text-3xl font-black leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
            Notre terrain,<br />
            <span className="text-resa-red">notre avenir.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            Chaque semaine, plus de 500 jeunes jouent, apprennent et grandissent
            sur les terrains de la Ligue Scolaire Primaire de Côte d'Ivoire.
          </p>

          {/* Petites stats inline */}
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <Stat value="120+" label="Joueurs" />
            <Stat value="24" label="Équipes" />
            <Stat value="8" label="Écoles" />
          </div>
        </div>
      </div>

      {/* Indicateur de scroll (optionnel) */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block">
        <div className="flex flex-col items-center gap-2 text-white/40">
          <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Défiler</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="h-4 w-4 anim-float"
          >
            <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </section>
  );
}

// ─── Petite stat inline ─────────────────────────────────────
function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="font-display text-3xl font-black text-white">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
        {label}
      </span>
    </div>
  );
}