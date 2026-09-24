'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { REGIONS, LOCALE_BY_REGION, type RegionCode, DEFAULT_REGION } from '@/lib/regions';
import { cn } from '@/lib/utils';

const COOKIE_REGION = 'resa_region';

const LOCALES = [
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'en', flag: '🇬🇧', name: 'English' }
];

export default function LocaleRegionSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [region, setRegion] = useState<RegionCode>(DEFAULT_REGION);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(new RegExp(`${COOKIE_REGION}=([^;]+)`));
    if (match) setRegion(match[1] as RegionCode);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const currentRegion = REGIONS.find((r) => r.code === region) ?? REGIONS[0];

const selectRegion = (code: RegionCode) => {
  document.cookie = `${COOKIE_REGION}=${code}; path=/; max-age=31536000; SameSite=Lax`;
  setRegion(code);
  setOpen(false);
  const defaultLocale = LOCALE_BY_REGION[code];
  if (defaultLocale !== locale) {
    router.replace(pathname, { locale: defaultLocale });
  } else {
    // Même locale → force un refetch des données serveur
    router.refresh();
  }
};

  const selectLocale = (l: string) => {
    router.replace(pathname, { locale: l });
    setOpen(false);
  };

  return (
    <div className="relative">
      {/* ─── Bouton déclencheur ─── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/85 backdrop-blur transition hover:bg-white/10 sm:gap-2 sm:px-3"
        aria-label="Changer région et langue"
        aria-expanded={open}
      >
        <span className="text-sm leading-none">{currentRegion.flag}</span>
        <span className="hidden sm:inline">{currentRegion.shortLabel}</span>
        <span className="hidden text-white/30 sm:inline">·</span>
        <span>{locale.toUpperCase()}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={cn(
            'h-2.5 w-2.5 transition-transform duration-200',
            open && 'rotate-180'
          )}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ─── Overlay (fermeture au clic extérieur) ─── */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ─── Panneau ancré au bouton ─── */}
      {open && (
        <div
          className={cn(
            'dropdown-panel dropdown-enter absolute right-0 top-full z-50 mt-3',
            'w-56 max-w-[calc(100vw-3rem)]',
            'sm:w-72 sm:max-w-none'
          )}
        >
          <div className="relative py-2">

            {/* ─── Région ─── */}
            <div className="dropdown-section-label">Région</div>
            {REGIONS.map((r) => {
              const isCurrent = r.code === region;
              return (
                <button
                  key={r.code}
                  onClick={() => selectRegion(r.code)}
                  className={cn('dropdown-item', isCurrent && 'is-active')}
                >
                  <span className="dropdown-item-icon">
                    <span className="text-base leading-none">{r.flag}</span>
                  </span>
                  <span className="min-w-0 flex-1 truncate text-left text-[13px] font-semibold">
                    {r.label}
                  </span>
                  {isCurrent && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="dropdown-check h-3.5 w-3.5 shrink-0"
                    >
                      <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}

            <div className="dropdown-divider my-2" />

            {/* ─── Langue ─── */}
            <div className="dropdown-section-label">Langue</div>
            {LOCALES.map((l) => {
              const isCurrent = l.code === locale;
              return (
                <button
                  key={l.code}
                  onClick={() => selectLocale(l.code)}
                  className={cn('dropdown-item', isCurrent && 'is-active')}
                >
                  <span className="dropdown-item-icon">
                    <span className="text-base leading-none">{l.flag}</span>
                  </span>
                  <span className="min-w-0 flex-1 truncate text-left text-[13px] font-semibold">
                    {l.name}
                  </span>
                  {isCurrent && (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="dropdown-check h-3.5 w-3.5 shrink-0"
                    >
                      <path d="m5 12 5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}