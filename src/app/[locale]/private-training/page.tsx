import { setRequestLocale } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import PrivateTrainingHero from './PrivateTrainingHero';
import { getTrainingPrograms, getFeaturedCoaches } from '@/lib/queries';

export default async function PrivateTrainingPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [programs, coaches] = await Promise.all([
    getTrainingPrograms(),
    getFeaturedCoaches(3)
  ]);
  return <PrivateTrainingContent programs={programs} coaches={coaches} />;
}

function PrivateTrainingContent({
  programs,
  coaches
}: {
  programs: any[];
  coaches: any[];
}) {
  const t = useTranslations('privateTraining');
  const locale = useLocale();
  const isFr = locale === 'fr';

  // ─── 3 raisons ───
  const reasons = [
    { key: 'Personal', icon: '🎯' },
    { key: 'Faster',   icon: '⚡' },
    { key: 'Flexible', icon: '📅' }
  ];

  // ─── 4 étapes ───
  const steps = [
    { n: '01', key: 'Choose' },
    { n: '02', key: 'Book' },
    { n: '03', key: 'Confirm' },
    { n: '04', key: 'Train' }
  ];

  return (
    <>
      <PrivateTrainingHero />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1 — 3 RAISONS
          Fond : blanc + dots + radial tint + cartes dégradées
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 opacity-[0.045]">
          <div className="h-full w-full bg-dots" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 50% at 50% 30%, rgba(30,58,138,0.06) 0%, transparent 70%)'
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-14 max-w-2xl">
              <div className="mb-3 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                {t('whyTitle')}
              </h2>
              <p className="mt-3 text-base text-resa-text/70">
                {t('whySubtitle')}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {reasons.map((r, i) => (
              <Reveal key={r.key} variant="up" delay={i * 100} className="h-full">
                <article className="group relative flex h-full gap-5 overflow-hidden rounded-2xl border border-black/5 bg-linear-to-br from-white to-resa-gray/60 p-7 shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                  {/* Halo décoratif au survol */}
                  <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-resa-royal/0 blur-2xl transition-all duration-500 group-hover:bg-resa-royal/10" />

                  {/* Icône qui pulse */}
                  <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-linear-to-br from-resa-navy to-resa-royal text-2xl text-white shadow-resa transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    {r.icon}
                  </div>

                  <div className="relative flex-1">
                    <h3 className="font-display text-lg font-black text-resa-navy transition-colors duration-300 group-hover:text-resa-red">
                      {t(`why${r.key}Title` as any)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-resa-text/65">
                      {t(`why${r.key}Text` as any)}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2 — 7 PROGRAMMES
          Fond : terrain de foot VERTICAL (comme /programs)
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-linear-to-br from-resa-gray/60 via-white to-resa-gray/40 py-24 md:py-32">

        {/* Terrain SVG vertical */}
        <svg
          aria-hidden
          viewBox="0 0 400 600"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 h-full w-full text-resa-navy/[0.06]"
        >
          <rect x="20" y="20" width="360" height="560" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="20" y1="300" x2="380" y2="300" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="200" cy="300" r="55" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="200" cy="300" r="3" fill="currentColor" />
          <rect x="100" y="20" width="200" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="140" y="20" width="120" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 155 100 A 45 45 0 0 0 245 100" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="200" cy="70" r="3" fill="currentColor" />
          <rect x="100" y="500" width="200" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="140" y="550" width="120" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 155 500 A 45 45 0 0 1 245 500" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="200" cy="530" r="3" fill="currentColor" />
          <path d="M 20 40 A 20 20 0 0 0 40 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 360 20 A 20 20 0 0 1 380 40" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 20 560 A 20 20 0 0 1 40 580" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 360 580 A 20 20 0 0 0 380 560" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        {/* Halos radiaux colorés */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(45% 40% at 12% 15%, rgba(30,58,138,0.08) 0%, transparent 65%), radial-gradient(40% 35% at 92% 88%, rgba(220,38,38,0.06) 0%, transparent 65%)'
          }}
        />

        {/* Voile blanc central pour lisibilité */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 60% at 50% 45%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.35) 55%, transparent 80%)'
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-14 max-w-2xl">
              <div className="mb-3 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                {t('programsTitle')}
              </h2>
              <p className="mt-3 text-base text-resa-text/70">
                {t('programsSubtitle')}
              </p>
            </div>
          </Reveal>

          {programs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white/60 p-12 text-center text-resa-text/50 backdrop-blur-sm">
              {t('programsEmpty')}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
              {programs.map((p, i) => {
                const title = isFr ? p.title_fr : p.title_en;
                const description = isFr ? p.description_fr : p.description_en;

                return (
                  <Reveal key={p.id} variant="up" delay={i * 60} className="h-full">
                    <Link
                      href={`/private-training/${p.slug}` as any}
                      className="group block h-full"
                    >
                      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                        {/* Barre gradient accent */}
                        <div
                          className={`h-1.5 w-full bg-linear-to-r ${
                            p.accent ?? 'from-resa-navy to-resa-royal'
                          }`}
                        />

                        {/* Zone icône avec fond animé */}
                        <div className="relative flex h-32 items-center justify-center overflow-hidden bg-resa-gray">
                          <div className="absolute inset-0 bg-grid opacity-40" />
                          <div className="pointer-events-none absolute inset-0 bg-halo opacity-30" />
                          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/30 blur-2xl transition-transform duration-700 group-hover:scale-150" />
                          <div className="relative text-5xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                            {p.icon ?? '⚽'}
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col p-6">
                          <h3 className="font-display text-lg font-black text-resa-navy transition-colors duration-300 group-hover:text-resa-red">
                            {title}
                          </h3>
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-resa-text/65 line-clamp-3">
                            {description}
                          </p>
                          <div className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-resa-red transition-all duration-300 group-hover:gap-3">
                            {t('programCta')}
                            <span className="transition-transform duration-300 group-hover:translate-x-1">
                              →
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3 — COMMENT ÇA MARCHE
          Fond : navy + cercles dashed + numéros qui "pop"
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-fade-navy py-24 text-white md:py-32">
        {/* Cercles concentriques décoratifs */}
        <svg
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
        >
          <circle cx="50%" cy="50%" r="18%" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 10" />
          <circle cx="50%" cy="50%" r="30%" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 10" />
          <circle cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 10" />
          <circle cx="50%" cy="50%" r="55%" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 10" />
        </svg>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-14 max-w-2xl">
              <div className="mb-3 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black md:text-4xl">
                {t('howTitle')}
              </h2>
              <p className="mt-3 text-base text-white/65">
                {t('howSubtitle')}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.n} variant="up" delay={i * 100} className="h-full">
                <div className="group relative h-full">
                  {/* Numéro qui pop + change de couleur au survol */}
                  <div className="font-display text-6xl font-black text-white/10 transition-all duration-500 group-hover:text-resa-red/30 group-hover:-rotate-3 group-hover:scale-110">
                    {s.n}
                  </div>

                  {/* Ligne de séparation qui s'étend */}
                  <div className="mt-4 h-0.5 w-8 rounded-full bg-resa-red transition-all duration-500 group-hover:w-20" />

                  <div className="mt-4 font-display text-lg font-black text-white transition-colors duration-300 group-hover:text-resa-red">
                    {t(`how${s.key}Title` as any)}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">
                    {t(`how${s.key}Text` as any)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4 — COACHS VEDETTES
          Fond : blanc + dots + cartes dégradées + photo qui scale
      ═══════════════════════════════════════════════════════════ */}
      {coaches.length > 0 && (
        <section className="relative overflow-hidden bg-white py-24 md:py-32">
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
            <div className="h-full w-full bg-dots" />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(50% 50% at 50% 60%, rgba(30,58,138,0.05) 0%, transparent 70%)'
            }}
          />

          <div className="relative mx-auto max-w-7xl px-4 md:px-6">
            <Reveal variant="right">
              <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="mb-3 h-1 w-14 bg-resa-red" />
                  <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                    {t('coachesTitle')}
                  </h2>
                  <p className="mt-3 text-base text-resa-text/70">
                    {t('coachesSubtitle')}
                  </p>
                </div>
                <Link
                  href="/coaches"
                  className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-resa-red transition hover:text-resa-navy"
                >
                  {t('coachesSeeAll')}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-3 md:gap-8">
              {coaches.map((c, i) => {
                const role = isFr ? c.role_fr : c.role_en;
                const initials =
                  c.initials ?? c.name?.slice(0, 2).toUpperCase() ?? '';

                return (
                  <Reveal key={c.id} variant="up" delay={i * 100} className="h-full">
                    <Link
                      href={`/coaches/${c.slug}` as any}
                      className="group block h-full"
                    >
                      <article className="relative flex h-full flex-col items-center gap-4 overflow-hidden rounded-2xl border border-black/5 bg-linear-to-br from-white to-resa-gray/60 p-7 text-center shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                        {/* Halo décoratif */}
                        <div className="pointer-events-none absolute -top-12 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-resa-royal/0 blur-2xl transition-all duration-500 group-hover:bg-resa-royal/10" />

                        <div className="relative">
                          {c.photo_url ? (
                            <img
                              src={c.photo_url}
                              alt={c.name}
                              className="h-20 w-20 rounded-full object-cover ring-2 ring-white shadow-resa transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="grid h-20 w-20 place-items-center rounded-full bg-linear-to-br from-resa-navy to-resa-royal font-display text-2xl font-black text-white shadow-resa transition-transform duration-500 group-hover:scale-105">
                              {initials}
                            </div>
                          )}
                          {c.flag && (
                            <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-white text-base shadow-resa">
                              {c.flag}
                            </div>
                          )}
                        </div>

                        <div className="relative">
                          <div className="font-display text-lg font-black text-resa-navy transition-colors duration-300 group-hover:text-resa-red">
                            {c.name}
                          </div>
                          {role && (
                            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                              {role}
                            </div>
                          )}
                        </div>
                      </article>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5 — CTA FINAL IMMERSIF
          Fond : navy dégradé + dots + halos flottants + badge
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-linear-to-b from-resa-navy via-resa-navy to-resa-navy-deep py-28 text-white md:py-40">
        <div className="absolute inset-0 bg-dots opacity-20" />

        {/* Cercles concentriques */}
        <svg
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
        >
          <circle cx="50%" cy="50%" r="22%" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="50%" cy="50%" r="36%" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="50%" cy="50%" r="50%" fill="none" stroke="white" strokeWidth="0.5" />
        </svg>

        {/* Halos flottants */}
        <div className="pointer-events-none absolute -top-32 left-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-resa-red/15 blur-3xl anim-float" />
        <div
          className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-resa-royal/25 blur-3xl anim-float"
          style={{ animationDelay: '1.5s' }}
        />

        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
          {/* Badge "Prochaine étape" */}
          <Reveal variant="up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-resa-red anim-glow" />
              {isFr ? 'Prochaine étape' : 'Next step'}
            </span>
          </Reveal>

          <Reveal variant="zoom" delay={80}>
            <h2 className="mt-6 font-display text-4xl font-black md:text-6xl">
              {t('ctaTitle')}
            </h2>
          </Reveal>

          <Reveal variant="up" delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/75">
              {t('ctaText')}
            </p>
          </Reveal>

          <Reveal variant="up" delay={240}>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact#form"
                className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:scale-[1.04] hover:bg-red-700"
              >
                {t('ctaBook')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/coaches"
                className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.04] hover:bg-white hover:text-resa-navy"
              >
                {t('ctaCoaches')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}