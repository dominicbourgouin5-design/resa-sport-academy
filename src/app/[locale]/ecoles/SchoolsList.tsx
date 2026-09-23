'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

export default function SchoolsList({ schools }: { schools: any[] }) {
  const t = useTranslations('schools');
  const locale = useLocale();
  const [q, setQ] = useState('');

  const filtered = schools.filter((s) =>
    s.name.toLowerCase().includes(q.toLowerCase()) ||
    (s.city ?? '').toLowerCase().includes(q.toLowerCase()) ||
    (s.district ?? '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      {/* ─── HERO compact ─── */}
      <section className="relative overflow-hidden bg-resa-navy text-white">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-halo" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <span className="mb-3 inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/85 backdrop-blur">
            {locale === 'fr' ? 'Ligue Scolaire Primaire — Saison 2027' : 'Primary School League — 2027 Season'}
          </span>
          <h1 className="font-display text-3xl font-black leading-tight tracking-tight md:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
            {t('subtitle')}
          </p>
        </div>
        <div className="h-1 gradient-line" />
      </section>

      {/* ─── BARRE DE FILTRE ─── */}
      <section className="border-b border-black/5 bg-resa-gray">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 md:px-6">
          <div className="relative flex-1 min-w-[220px]">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-resa-text/40">
              🔍
            </span>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-full border border-black/5 bg-white py-2.5 pl-10 pr-4 text-sm text-resa-text shadow-resa outline-none transition focus:border-resa-royal/40 focus:ring-2 focus:ring-resa-royal/10"
            />
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-resa-text/50">
            {filtered.length} {locale === 'fr' ? 'écoles' : 'schools'}
          </div>
        </div>
      </section>

      {/* ─── LISTE ─── */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-resa-text/60">{t('noResults')}</p>
        ) : (
          <div className="-mx-3 flex flex-wrap">
            {filtered.map((school) => (
              <div key={school.id} className="w-full px-3 pb-6 sm:w-1/2 lg:w-1/3">
                <SchoolCard school={school} t={t} locale={locale} />
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function SchoolCard({ school, t, locale }: { school: any; t: any; locale: string }) {
  const initial = school.name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/ecoles/${school.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-300 hover:-translate-y-1 hover:shadow-resa-lg"
    >
      {/* Bande accent top */}
      <div className="h-1 w-full bg-gradient-to-r from-resa-navy via-resa-royal to-resa-red" />

      {/* En-tête */}
      <div className="flex items-start gap-3 p-5 pb-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-resa-navy to-resa-royal font-display text-xl font-black text-white shadow-resa transition-transform duration-300 group-hover:scale-105">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-base font-bold leading-tight text-resa-navy transition-colors duration-300 group-hover:text-resa-red line-clamp-2">
            {school.name}
          </h2>
          {school.city && (
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
              {school.city}
              {school.district && ` · ${school.district}`}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {school.description_fr && (
        <p className="px-5 text-xs leading-relaxed text-resa-text/60 line-clamp-2">
          {school.description_fr}
        </p>
      )}

      {/* Footer avec catégories + CTA */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-black/5 px-5 pt-4 pb-4">        <div className="flex gap-1">
          {['U7', 'U9', 'U11'].map((c, i) => (
            <span
              key={c}
              className={
                'rounded-md px-1.5 py-0.5 text-[9px] font-black tracking-wider ' +
                (i === 0 ? 'bg-resa-royal/10 text-resa-royal' :
                 i === 1 ? 'bg-resa-red/10 text-resa-red' :
                           'bg-resa-navy/10 text-resa-navy')
              }
            >
              {c}
            </span>
          ))}
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-bold text-resa-navy transition-colors group-hover:text-resa-red">
          {t('viewProfile')}
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </div>
    </Link>
  );
}