'use client';

import { useEffect, useRef, useState } from 'react';

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutExpo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setValue(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

export function StatCounter({
  value,
  label
}: {
  value: number;
  label: string;
}) {
  const { value: animated, ref } = useCountUp(value);

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-4xl font-black leading-none text-white md:text-5xl">
        {animated}
        <span className="text-resa-red">.</span>
      </div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
        {label}
      </div>
    </div>
  );
}

export function StatsGrid({ items }: { items: { value: number; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
      {items.map((s, i) => (
        <div
          key={s.label}
          className="opacity-0"
          style={{
            animation: 'resa-stagger 620ms cubic-bezier(0.22, 1, 0.36, 1) both',
            animationDelay: `${i * 80}ms`
          }}
        >
          <StatCounter value={s.value} label={s.label} />
        </div>
      ))}
    </div>
  );
}