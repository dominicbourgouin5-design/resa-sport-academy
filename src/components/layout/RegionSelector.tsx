'use client';

import { useEffect, useState } from 'react';
import { REGIONS, type RegionCode, DEFAULT_REGION } from '@/lib/regions';
import { cn } from '@/lib/utils';

const COOKIE_NAME = 'resa_region';

export function getRegionFromCookie(): RegionCode {
  if (typeof document === 'undefined') return DEFAULT_REGION;
  const match = document.cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return (match?.[1] as RegionCode) ?? DEFAULT_REGION;
}

export default function RegionSelector() {
  const [region, setRegion] = useState<RegionCode>(DEFAULT_REGION);
  const [open, setOpen] = useState(false);

  // Charge la région depuis le cookie au montage
  useEffect(() => {
    setRegion(getRegionFromCookie());
  }, []);

  const selectRegion = (code: RegionCode) => {
    // Persiste dans un cookie 1 an
    document.cookie = `${COOKIE_NAME}=${code}; path=/; max-age=31536000; SameSite=Lax`;
    setRegion(code);
    setOpen(false);
    // Recharge pour appliquer au contenu (plus tard on utilisera un state global)
    window.location.reload();
  };

  const current = REGIONS.find((r) => r.code === region) ?? REGIONS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur transition hover:bg-white/10"
        aria-label="Choisir la région"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span className="hidden sm:inline">{current.shortLabel}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={cn('h-2.5 w-2.5 transition-transform', open && 'rotate-180')}>
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-black/5 bg-white shadow-xl anim-fade-up">
            <div className="border-b border-black/5 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-resa-text/40">
              Région
            </div>
            <ul className="py-1">
              {REGIONS.map((r) => (
                <li key={r.code}>
                  <button
                    onClick={() => selectRegion(r.code)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-left text-[12px] font-medium transition',
                      r.code === region
                        ? 'bg-resa-navy/5 text-resa-navy'
                        : 'text-resa-text/70 hover:bg-resa-gray'
                    )}
                  >
                    <span className="text-base">{r.flag}</span>
                    <span className="flex-1">{r.label}</span>
                    {r.code === region && (
                      <span className="text-resa-red">✓</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}