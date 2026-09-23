'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export default function Collapsible({
  title,
  subtitle,
  icon,
  accent = 'red',
  defaultOpen = true,
  badge,
  children,
  className
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode | string;
  accent?: 'red' | 'royal' | 'navy' | 'emerald' | 'amber';
  defaultOpen?: boolean;
  badge?: number | string;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const accentBg: Record<string, string> = {
    red:     'from-resa-red/5',
    royal:   'from-resa-royal/5',
    navy:    'from-resa-navy/5',
    emerald: 'from-emerald-500/5',
    amber:   'from-amber-500/5'
  };
  const accentBar: Record<string, string> = {
    red:     'bg-resa-red',
    royal:   'bg-resa-royal',
    navy:    'bg-resa-navy',
    emerald: 'bg-emerald-500',
    amber:   'bg-amber-500'
  };

  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm',
        className
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center gap-3 bg-gradient-to-r to-transparent px-5 py-4 text-left transition hover:bg-resa-gray/30',
          accentBg[accent]
        )}
        aria-expanded={open}
      >
        <div className={cn('h-4 w-1 rounded-full', accentBar[accent])} />

        {icon && (
          <span className="text-base">
            {typeof icon === 'string' ? icon : icon}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold text-resa-navy">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-[11px] text-resa-text/50">{subtitle}</p>
          )}
        </div>

        {badge !== undefined && (
          <span className="shrink-0 rounded-full bg-resa-navy/10 px-2 py-0.5 text-[10px] font-bold text-resa-navy">
            {badge}
          </span>
        )}

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn(
            'h-4 w-4 shrink-0 text-resa-text/40 transition-transform duration-300',
            open && 'rotate-180'
          )}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="anim-fade-in">{children}</div>
      )}
    </section>
  );
}