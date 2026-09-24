'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Slide = string;

const SLIDE_DURATION = 6000;
const TRANSITION_DURATION = 1500;

export default function PageHero({
  slides,
  title,
  subtitle,
  badge,
  breadcrumb,
  overlay = 'medium'
}: {
  slides: Slide[];
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumb?: { href: string; label: string }[];
  overlay?: 'light' | 'medium' | 'dark';
}) {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const isSlideshow = slides.length > 1;

  useEffect(() => {
    if (!isSlideshow) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, [isSlideshow, slides.length]);

  // Intensité de la couche de base
  const baseOpacity =
    overlay === 'light' ? 'bg-resa-navy/20' :
    overlay === 'dark'  ? 'bg-resa-navy/45' :
                          'bg-resa-navy/30';

  // Dégradé horizontal : très sombre à gauche (texte), quasi transparent à droite (image)
  const horizontalGradient =
    overlay === 'light'
      ? 'linear-gradient(90deg, rgba(6,21,48,0.82) 0%, rgba(6,21,48,0.55) 40%, rgba(6,21,48,0.15) 75%, rgba(6,21,48,0.05) 100%)'
      : overlay === 'dark'
      ? 'linear-gradient(90deg, rgba(6,21,48,0.98) 0%, rgba(6,21,48,0.88) 35%, rgba(6,21,48,0.60) 70%, rgba(6,21,48,0.35) 100%)'
      : 'linear-gradient(90deg, rgba(6,21,48,0.92) 0%, rgba(6,21,48,0.72) 40%, rgba(6,21,48,0.30) 75%, rgba(6,21,48,0.10) 100%)';

  return (
    <section className="relative overflow-hidden bg-resa-navy text-white">
      {/* Slideshow d'images */}
      {slides.map((src, idx) => {
        const isActive = idx === current;
        const isLoaded = loaded[idx] !== false;

        return (
          <div
            key={src}
            className={cn(
              'absolute inset-0 transition-opacity ease-in-out',
              isActive ? 'opacity-100' : 'opacity-0',
              isLoaded ? '' : 'hidden'
            )}
            style={{ transitionDuration: `${TRANSITION_DURATION}ms` }}
          >
            <img
              src={src}
              alt=""
              onLoad={() => setLoaded((l) => ({ ...l, [idx]: true }))}
              onError={() => setLoaded((l) => ({ ...l, [idx]: false }))}
              className={cn(
                'h-full w-full object-cover will-change-transform',
                isActive ? 'scale-105' : 'scale-100'
              )}
              style={{
                transition: `transform ${SLIDE_DURATION + TRANSITION_DURATION}ms ease-out`
              }}
            />
          </div>
        );
      })}

      {/* Couche de base (uniforme, légère) */}
      <div className={cn('absolute inset-0', baseOpacity)} />

      {/* Dégradé horizontal : sombre à gauche (lisibilité texte), clair à droite (image visible) */}
      <div
        className="absolute inset-0"
        style={{ background: horizontalGradient }}
      />

      {/* Dégradé vertical léger : transition douce vers le contenu en bas */}
      <div className="absolute inset-0 bg-gradient-to-t from-resa-navy via-transparent to-transparent" />

      {/* Dégradé top léger : lisibilité de la navbar au-dessus */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-resa-navy/40 to-transparent" />

      {/* Grille discrète */}
      <div className="absolute inset-0 bg-grid opacity-15" />

      {/* Halo décoratif */}
      <div className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-resa-red/10 blur-3xl anim-float" />

      {/* Contenu */}
      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
        {breadcrumb && breadcrumb.length > 0 && (
          <div className="mb-4 text-[11px] text-white/50">
            {breadcrumb.map((b, i) => (
              <span key={b.href}>
                {i > 0 && <span className="mx-2">/</span>}
                {i === breadcrumb.length - 1 ? (
                  <span className="font-bold text-white">{b.label}</span>
                ) : (
                  <a href={b.href} className="transition hover:text-white">{b.label}</a>
                )}
              </span>
            ))}
          </div>
        )}

        <div className="max-w-3xl">
          {badge && (
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/85 backdrop-blur anim-fade-up">
              <span className="h-1.5 w-1.5 rounded-full bg-resa-red" />
              {badge}
            </span>
          )}

          <h1 className="font-display text-3xl font-black leading-[1.05] tracking-tight md:text-5xl anim-fade-up delay-100">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg anim-fade-up delay-200">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="h-1 gradient-line" />
    </section>
  );
}