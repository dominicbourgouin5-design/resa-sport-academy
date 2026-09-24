'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { WHATSAPP_URL, cn } from '@/lib/utils';

export default function ActionsMenu() {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);

  const actions = [
    {
      key: 'contact',
      label: t('contactTooltip'),
      desc: t('contactDesc'),
      href: '/contact',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-10 5L2 7" />
        </svg>
      ),
      external: false
    },
    {
      key: 'book',
      label: t('bookCoach'),
      desc: t('bookCoachDesc'),
      href: '/private-training',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v4M16 2v4M3 10h18" />
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="m9 16 2 2 4-4" />
        </svg>
      ),
      external: false
    },
    {
      key: 'whatsapp',
      label: t('whatsapp'),
      desc: t('whatsappDesc'),
      href: WHATSAPP_URL,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.52 3.48A11.9 11.9 0 0 0 12.02 0C5.4 0 .04 5.36.04 11.98c0 2.11.55 4.17 1.6 5.99L0 24l6.17-1.62a11.94 11.94 0 0 0 5.85 1.5h.01c6.62 0 11.98-5.36 11.98-11.98 0-3.2-1.24-6.2-3.49-8.42Z" />
        </svg>
      ),
      external: true
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 text-white/85 backdrop-blur transition hover:bg-white/10 xl:px-3.5',
          open && 'bg-white/15'
        )}
        aria-label={t('actions')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="hidden text-[10px] font-bold uppercase tracking-wide xl:inline">
          {t('actions')}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={cn('h-2.5 w-2.5 transition-transform duration-200', open && 'rotate-180')}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="dropdown-panel dropdown-enter absolute right-0 top-full z-50 mt-3 w-72">
            <div className="relative py-2">
              {actions.map((a, i) => {
                const inner = (
                  <>
                    <span className="dropdown-item-icon">
                      {a.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold tracking-tight">
                        {a.label}
                      </div>
                      <div className="mt-0.5 text-[11px] text-white/45">
                        {a.desc}
                      </div>
                    </div>
                  </>
                );

                return (
                  <div key={a.key}>
                    {i > 0 && <div className="dropdown-divider" />}
                    {a.external ? (
                      <a
                        href={a.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dropdown-item"
                        onClick={() => setOpen(false)}
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link
                        href={a.href as any}
                        className="dropdown-item"
                        onClick={() => setOpen(false)}
                      >
                        {inner}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}