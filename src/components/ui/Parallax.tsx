'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export default function Parallax({
  children,
  speed = 0.15,
  className,
  direction = 'up'
}: {
  children: ReactNode;
  /** Intensité : 0.05 = subtil, 0.3 = marqué */
  speed?: number;
  className?: string;
  /** 'up' = monte au scroll, 'down' = descend */
  direction?: 'up' | 'down';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect de prefers-reduced-motion
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) return;

    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;
        const elementCenter = rect.top + rect.height / 2;

        // Distance entre le centre de la section et le centre du viewport
        const distance = elementCenter - viewportCenter;

        // Amplitude proportionnelle à la distance
        const rawOffset = distance * speed;
        const clampedOffset = Math.max(-120, Math.min(120, rawOffset));

        setOffset(direction === 'up' ? -clampedOffset : clampedOffset);
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
  }, [speed, direction]);

  return (
    <div
      ref={ref}
      className={cn('will-change-transform', className)}
      style={{ transform: `translate3d(0, ${offset}px, 0)` }}
    >
      {children}
    </div>
  );
}