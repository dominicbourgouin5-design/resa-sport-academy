'use client';

import { useEffect, useRef } from 'react';

export default function ParallaxBg({
  image,
  overlay = 'navy',
  children,
  className = ''
}: {
  image: string;
  overlay?: 'navy' | 'navy-deep' | 'dark';
  children: React.ReactNode;
  className?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  // Manipulation DOM directe (pas de state React) → zéro tremblement
  useEffect(() => {
    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!sectionRef.current || !imageRef.current) return;
        const rect = sectionRef.current.getBoundingClientRect();
        // Arrondi à l'entier → évite les micro-mouvements fractionnaires
        const offset = -Math.round(rect.top);
        // transform GPU-accéléré (pas de reflow)
        imageRef.current.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      cancelAnimationFrame(raf);
    };
  }, []);

  const gradients: Record<string, string> = {
    navy:
      'linear-gradient(180deg, rgba(10,31,68,0.85) 0%, rgba(10,31,68,0.72) 50%, rgba(6,21,48,0.95) 100%)',
    'navy-deep':
      'linear-gradient(180deg, rgba(6,21,48,0.92) 0%, rgba(6,21,48,0.78) 50%, rgba(6,21,48,0.96) 100%)',
    dark:
      'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.92) 100%)'
  };

  return (
    <section
      ref={sectionRef}
      className={`relative overflow-hidden bg-resa-navy ${className}`}
    >
      {/* ═══ Image "fixe" : reste collée au viewport pendant que la section scrolle ═══ */}
      <div
        ref={imageRef}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-screen bg-cover bg-center will-change-transform"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Overlay navy */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: gradients[overlay] ?? gradients.navy }}
      />

      {/* Grille discrète */}
      <div aria-hidden className="absolute inset-0 bg-grid opacity-10" />

      {/* Contenu */}
      <div className="relative">{children}</div>
    </section>
  );
}