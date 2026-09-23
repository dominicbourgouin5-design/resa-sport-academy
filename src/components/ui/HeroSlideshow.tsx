'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Liste des slides disponibles dans /public/images/hero/
const SLIDES = [
  '/images/hero/slide-1.jpg',
  '/images/hero/slide-2.jpg',
  '/images/hero/slide-3.jpg',
  '/images/hero/slide-4.jpg'
];

const SLIDE_DURATION = 6000; // 6 secondes par slide
const TRANSITION_DURATION = 1500; // 1.5s de fondu

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});

  // Avance automatique
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, SLIDE_DURATION);

    return () => clearInterval(interval);
  }, []);

  // Détecte les images absentes (404)
  const handleError = (idx: number) => {
    setLoaded((l) => ({ ...l, [idx]: false }));
  };
  const handleLoad = (idx: number) => {
    setLoaded((l) => ({ ...l, [idx]: true }));
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
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
            style={{
              transitionDuration: `${TRANSITION_DURATION}ms`
            }}
            aria-hidden={!isActive}
          >
                <img
                src={src}
                alt=""
                onLoad={() => handleLoad(idx)}
                onError={() => handleError(idx)}
                className={cn(
                    // Effet Ken Burns + cadrage à droite
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
  );
}