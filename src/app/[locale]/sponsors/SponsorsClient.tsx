'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import ScrollButton from '@/components/ui/ScrollButton';
import PartnerRequestForm from '@/components/PartnerRequestForm';

type Tier = 'all' | 'platinum' | 'gold' | 'silver' | 'official';

const TIERS_ORDER: Tier[] = ['all', 'platinum', 'gold', 'silver', 'official'];

export default function SponsorsClient({ sponsors }: { sponsors: any[] }) {
  const t = useTranslations('sponsors');
  const locale = useLocale();
  const isFr = locale === 'fr';

  const [activeTier, setActiveTier] = useState<Tier>('all');

  const tierLabels: Record<string, string> = {
    all:      isFr ? 'Tous les niveaux' : 'All levels',
    platinum: t('tierPlatinum'),
    gold:     t('tierGold'),
    silver:   t('tierSilver'),
    official: t('tierOfficial')
  };

  const tierBadge: Record<string, string> = {
    platinum: 'bg-slate-800 text-white',
    gold:     'bg-amber-500 text-white',
    silver:   'bg-gray-400 text-white',
    official: 'bg-resa-navy text-white'
  };

  const tierGradient: Record<string, string> = {
    platinum: 'from-slate-700 to-slate-900',
    gold:     'from-amber-500 to-amber-700',
    silver:   'from-gray-400 to-gray-600',
    official: 'from-resa-navy to-resa-royal'
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: sponsors.length };
    for (const tr of ['platinum', 'gold', 'silver', 'official']) {
      c[tr] = sponsors.filter((s) => s.tier === tr).length;
    }
    return c;
  }, [sponsors]);

  const filtered = useMemo(() => {
    if (activeTier === 'all') return sponsors;
    return sponsors.filter((s) => s.tier === activeTier);
  }, [activeTier, sponsors]);

  return (
    <>
      {/* ═══════ BARRE TOP : FILTRE + CTA DEVENIR PARTENAIRE ═══════ */}
      <section className="relative overflow-hidden border-y border-black/5 bg-linear-to-b from-white to-resa-gray/40">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full bg-dots" />
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between md:px-6">
          {/* Gauche : filtre + compteur */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <label
                htmlFor="tier-filter"
                className="text-[11px] font-bold uppercase tracking-widest text-resa-text/50"
              >
                {isFr ? 'Filtrer' : 'Filter'}
              </label>

              <div className="relative">
                <select
                  id="tier-filter"
                  value={activeTier}
                  onChange={(e) => setActiveTier(e.target.value as Tier)}
                  className="appearance-none rounded-xl border border-black/10 bg-white pl-4 pr-10 py-2.5 text-sm font-semibold text-resa-navy shadow-resa outline-none transition focus:border-resa-royal/50 focus:ring-2 focus:ring-resa-royal/10"
                >
                  {TIERS_ORDER.map((tr) => {
                    if (tr !== 'all' && counts[tr] === 0) return null;
                    return (
                      <option key={tr} value={tr}>
                        {tierLabels[tr]} ({counts[tr]})
                      </option>
                    );
                  })}
                </select>
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-resa-navy/50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 8l4 4 4-4" />
                </svg>
              </div>
            </div>

            <div className="text-xs font-semibold uppercase tracking-widest text-resa-text/50">
              {filtered.length}{' '}
              {filtered.length > 1
                ? isFr ? 'partenaires' : 'partners'
                : isFr ? 'partenaire' : 'partner'}
            </div>
          </div>

             {/* Droite : CTA "Devenir partenaire" */}
                    <ScrollButton
                    targetId="form-partenaire"
                    className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-resa-red px-6 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:scale-[1.04] hover:bg-red-700 sm:px-7 sm:py-3.5 sm:text-sm"
                    >
                    {isFr ? 'Devenir partenaire' : 'Become a partner'}
                    <span className="transition-transform duration-300 group-hover:translate-y-1">↓</span>
                    </ScrollButton>
        </div>
      </section>

      {/* ═══════ GRILLE ═══════ */}
      <section className="relative overflow-hidden bg-white py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full bg-grid" />
        </div>
        <svg
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] text-resa-navy/[0.05]"
        >
          <circle cx="50%" cy="50%" r="20%" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="32%" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="44%" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-resa-text/50">
              {isFr ? 'Aucun partenaire à afficher.' : 'No partners to display.'}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8">
              {filtered.map((s, i) => (
                <Reveal key={s.id} variant="up" delay={i * 40} className="h-full">
                  <SponsorCard
                    sponsor={s}
                    gradient={tierGradient[s.tier] ?? 'from-resa-navy to-resa-royal'}
                    badgeClass={tierBadge[s.tier] ?? 'bg-resa-navy text-white'}
                    badgeLabel={tierLabels[s.tier] ?? s.tier}
                    isFr={isFr}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════ DEVENIR PARTENAIRE — TITRE + FORMULAIRE ═══════ */}
        <section
        id="devenir-partenaire"
        className="relative scroll-mt-24 overflow-hidden bg-linear-to-b from-resa-navy via-resa-navy to-resa-navy-deep pt-24 pb-16 text-white md:pt-32 md:pb-20"
        >
        <div className="absolute inset-0 bg-dots opacity-20" />
        <svg
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
        >
          <circle cx="50%" cy="50%" r="22%" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="50%" cy="50%" r="36%" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="50%" cy="50%" r="50%" fill="none" stroke="white" strokeWidth="0.5" />
        </svg>
        <div className="pointer-events-none absolute -top-32 left-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-resa-red/15 blur-3xl anim-float" />
        <div
          className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-resa-royal/25 blur-3xl anim-float"
          style={{ animationDelay: '1.5s' }}
        />

        <div className="relative mx-auto max-w-3xl px-4 text-center md:px-6">
          <Reveal variant="up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-resa-red anim-glow" />
              {isFr ? 'Partenariat' : 'Partnership'}
            </span>
          </Reveal>

          <Reveal variant="zoom" delay={80}>
            <h2 className="mt-6 font-display text-4xl font-black md:text-5xl">
              {t('become')}
            </h2>
          </Reveal>

          <Reveal variant="up" delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-base text-white/75 md:text-lg">
              {t('becomeText')}
            </p>
          </Reveal>
        </div>

             {/* Formulaire */}
                <div
                id="form-partenaire"
                className="relative mx-auto mt-10 max-w-2xl scroll-mt-24 px-4 md:px-6"
                >
            <PartnerRequestForm />
            </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// CARTE SPONSOR
// ═══════════════════════════════════════════════════════════
function SponsorCard({
  sponsor,
  gradient,
  badgeClass,
  badgeLabel,
  isFr
}: {
  sponsor: any;
  gradient: string;
  badgeClass: string;
  badgeLabel: string;
  isFr: boolean;
}) {
  return (
    <Link href={`/sponsors/${sponsor.slug}` as any} className="group block h-full">
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-linear-to-br from-white to-resa-gray/60 shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
        <div className={`h-1 w-full bg-linear-to-r ${gradient}`} />

        <div className="flex flex-1 flex-col p-6">
          {sponsor.logo_url ? (
            <div className="mb-5 grid h-16 w-16 shrink-0 place-items-center rounded-xl border border-black/5 bg-white shadow-resa transition-transform duration-300 group-hover:scale-105">
              <img
                src={sponsor.logo_url}
                alt={sponsor.name}
                className="h-full w-full rounded-xl object-contain p-2"
              />
            </div>
          ) : (
            <div
              className={`mb-5 grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-linear-to-br ${gradient} font-display text-2xl font-black text-white shadow-resa transition-transform duration-300 group-hover:scale-105`}
            >
              {sponsor.name.charAt(0).toUpperCase()}
            </div>
          )}

          <span
            className={`mb-2 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${badgeClass}`}
          >
            {badgeLabel}
          </span>

          <h3 className="font-display text-lg font-black leading-tight text-resa-navy transition-colors duration-300 group-hover:text-resa-red">
            {sponsor.name}
          </h3>

          <p className="mt-2 flex-1 text-sm leading-relaxed text-resa-text/65 line-clamp-3">
            {isFr
              ? sponsor.description_fr
              : sponsor.description_en || sponsor.description_fr}
          </p>

          <div className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-resa-royal transition-colors group-hover:text-resa-red">
            {isFr ? 'Voir le partenaire' : 'View partner'}
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </div>
        </div>
      </article>
    </Link>
  );
}