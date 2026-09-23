'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'up' | 'in' | 'left' | 'right' | 'zoom';

const variants: Record<Variant, string> = {
  up:    'reveal',
  in:    'reveal',
  left:  'reveal reveal-left',
  right: 'reveal reveal-right',
  zoom:  'reveal reveal-zoom'
};

export default function Reveal({
  children,
  variant = 'up',
  delay = 0,
  className,
  as: Tag = 'div'
}: {
  children: ReactNode;
  variant?: Variant;
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduce) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Component = Tag as any;

  return (
    <Component
      ref={ref as any}
      className={cn(variants[variant], visible && 'is-visible', className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Component>
  );
}