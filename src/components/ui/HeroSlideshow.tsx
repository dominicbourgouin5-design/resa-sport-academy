'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const SLIDES = [
  '/images/hero/slide-1.jpg',
  '/images/hero/slide-2.jpg',
  '/images/hero/slide-3.jpg',
  '/images/hero/slide-4.jpg'
];

const SLIDE_DURATION = 6000;
const TRANSITION_DURATION = 1500;

// Facteur de parallaxe du fond (0 = statique, 1 = suit le scroll)
// 0.4 = le fond descend doucement quand on scrolle → effet de profondeur
const PARALLAX_FACTOR = 0.4;

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const [offset, setOffset] = useState(0);

  // Avance automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, SLIDE_DURATION);
    return () => clearInterval(interval);
  }, []);

  // Parallaxe : RAF + passive listener pour perf maximale
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        // On limite l'effet à 1.5× la hauteur du viewport
        if (y < vh * 1.5) {
          setOffset(y * PARALLAX_FACTOR);
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleError = (idx: number) =>
    setLoaded((l) => ({ ...l, [idx]: false }));
  const handleLoad = (idx: number) =>
    setLoaded((l) => ({ ...l, [idx]: true }));

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Wrapper parallaxe */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(0, ${offset}px, 0)` }}
      >
        {SLIDES.map((src, idx) => {
          const isActive = idx === current;
          const isLoaded = loaded[idx] !== false;

          if (!isLoaded) return null;

          return (
            <div
              key={src}
              className={cn(
                'absolute inset-0 transition-opacity ease-in-out',
                isActive ? 'opacity-100' : 'opacity-0'
              )}
              style={{ transitionDuration: `${TRANSITION_DURATION}ms` }}
              aria-hidden={!isActive}
            >
              <img
                src={src}
                alt=""
                onLoad={() => handleLoad(idx)}
                onError={() => handleError(idx)}
                className={cn(
                  'h-full w-full object-cover object-right will-change-transform',
                  isActive ? 'scale-105' : 'scale-100'
                )}
                style={{
                  transition: `transform ${SLIDE_DURATION + TRANSITION_DURATION}ms ease-out`
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}