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
  /** Liste des chemins d'images. 1 seule = image fixe. 2+ = slideshow. */
  slides: Slide[];
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumb?: { href: string; label: string }[];
  /** 'light' | 'medium' | 'dark' — intensité de l'overlay */
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

  const overlayOpacity =
    overlay === 'light' ? 'bg-resa-navy/55' :
    overlay === 'dark'  ? 'bg-resa-navy/85' :
                          'bg-resa-navy/70';

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

      {/* Overlay navy uniforme */}
      <div className={cn('absolute inset-0', overlayOpacity)} />

      {/* Dégradé vertical pour la lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-t from-resa-navy via-resa-navy/40 to-resa-navy/60" />

      {/* Grille discrète */}
      <div className="absolute inset-0 bg-grid opacity-20" />

      {/* Halos décoratifs */}
      <div className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-resa-red/10 blur-3xl anim-float" />

      {/* Contenu */}
      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
        {/* Breadcrumb optionnel */}
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
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80 md:text-lg anim-fade-up delay-200">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Ligne gradient bas */}
      <div className="h-1 gradient-line" />
    </section>
  );
}