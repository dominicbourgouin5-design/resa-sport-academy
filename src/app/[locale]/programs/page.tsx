import { setRequestLocale } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import PlayerPathway from '@/components/ui/PlayerPathway';
import ProgramsHero from './ProgramsHero';
import { getTrainingPrograms } from '@/lib/queries';

export default async function ProgramsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const programs = await getTrainingPrograms();
  return <ProgramsContent programs={programs} />;
}

function ProgramsContent({ programs }: { programs: any[] }) {
  const t = useTranslations('programsHub');
  const locale = useLocale();
  const isFr = locale === 'fr';

  // ─── 4 grandes portes ───
  const doors = [
    {
      key: 'academy',
      href: '/academy',
      image: '/images/programs/doors/academy.jpg',
      gradient: 'from-resa-royal via-resa-navy to-resa-navy-deep',
      pattern: 'grid',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-6 10 6-10 6z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      )
    },
    {
      key: 'league',
      href: '/ligue',
      image: '/images/programs/doors/league.jpg',
      gradient: 'from-resa-red via-red-800 to-resa-navy-deep',
      pattern: 'dots',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0z" />
        </svg>
      )
    },
    {
      key: 'training',
      href: '/private-training',
      image: '/images/programs/doors/training.jpg',
      gradient: 'from-resa-navy via-resa-royal to-resa-navy-deep',
      pattern: 'halo',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )
    },
    {
      key: 'coaches',
      href: '/coaches',
      image: '/images/programs/doors/coaches.jpg',
      gradient: 'from-amber-500 via-amber-600 to-amber-800',
      pattern: 'stripes',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    }
  ];

  // ─── Profils ───
  const profiles = [
    {
      key: 'School',
      href: '/inscriptions',
      icon: '🏫',
      image: '/images/programs/profiles/school.jpg',
      gradient: 'from-resa-navy via-resa-royal to-resa-navy-deep'
    },
    {
      key: 'Player',
      href: '/private-training',
      icon: '⚽',
      image: '/images/programs/profiles/player.jpg',
      gradient: 'from-resa-red via-red-700 to-red-900'
    },
    {
      key: 'Parent',
      href: '/inscriptions',
      icon: '👨‍👩‍👦',
      image: '/images/programs/profiles/parent.jpg',
      gradient: 'from-amber-500 via-amber-600 to-amber-800'
    },
    {
      key: 'Partner',
      href: '/sponsors',
      icon: '🤝',
      image: '/images/programs/profiles/partner.jpg',
      gradient: 'from-emerald-600 via-emerald-700 to-emerald-900'
    }
  ];

  // ─── Étapes du pathway ───
  const pathwaySteps = [
    { n: '01', icon: '🌱', title: t('pathwayLearnTitle'),      text: t('pathwayLearnText') },
    { n: '02', icon: '⚽', title: t('pathwayDevelopTitle'),    text: t('pathwayDevelopText') },
    { n: '03', icon: '🏆', title: t('pathwayCompeteTitle'),    text: t('pathwayCompeteText') },
    { n: '04', icon: '🔍', title: t('pathwayIdentifiedTitle'), text: t('pathwayIdentifiedText') },
    { n: '05', icon: '🚀', title: t('pathwayNextTitle'),       text: t('pathwayNextText') }
  ];

  return (
    <>
      <ProgramsHero />

      {/* ═══════ 1 · 4 GRANDES PORTES — CLAIR ═══════ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 opacity-[0.035]">
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
          <Reveal variant="right">
            <div className="mb-14 max-w-3xl">
              <div className="mb-3 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                {t('doorsTitle')}
              </h2>
              <p className="mt-3 text-base text-resa-text/70">
                {t('doorsSubtitle')}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 md:gap-8">
            {doors.map((d, i) => (
              <Reveal key={d.key} variant="up" delay={i * 100} className="h-full">
                <Link href={d.href as any} className="group block h-full">
                  <article
                    className={`relative flex h-80 flex-col justify-end overflow-hidden rounded-3xl bg-linear-to-br ${d.gradient} shadow-resa-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(10,31,68,.28)] md:h-96`}
                  >
                    <img
                      src={d.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 opacity-40">
                      {d.pattern === 'grid'    && <div className="h-full w-full bg-grid" />}
                      {d.pattern === 'dots'    && <div className="h-full w-full bg-dots" />}
                      {d.pattern === 'stripes' && <div className="h-full w-full bg-stripes" />}
                      {d.pattern === 'halo'    && <div className="h-full w-full bg-halo" />}
                    </div>
                    <div className="absolute inset-0 bg-linear-to-t from-resa-navy via-resa-navy/55 to-resa-navy/10" />
                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute left-5 top-5 grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur-md transition-transform duration-500 group-hover:scale-110 md:left-6 md:top-6 md:h-16 md:w-16">
                      <div className="h-7 w-7 md:h-8 md:w-8">{d.icon}</div>
                    </div>
                    <div className="relative p-6 md:p-8">
                      <h3 className="font-display text-2xl font-black leading-tight text-white md:text-3xl">
                        {t(`door${d.key.charAt(0).toUpperCase() + d.key.slice(1)}Title` as any)}
                      </h3>
                      <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80 md:text-[15px]">
                        {t(`door${d.key.charAt(0).toUpperCase() + d.key.slice(1)}Text` as any)}
                      </p>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm transition-all duration-300 group-hover:gap-3 group-hover:bg-white group-hover:text-resa-navy">
                        {t('doorCta')}
                        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                      </div>
                    </div>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 2 · PROGRAMS TRAINING — TERRAIN VERTICAL EN BACKGROUND ═══════ */}
      {programs.length > 0 && (
        <section className="relative overflow-hidden bg-linear-to-br from-resa-gray/60 via-white to-resa-gray/40 py-24 md:py-32">

          {/* ── Terrain de foot VERTICAL EN BACKGROUND COMPLET ── */}
          <svg
            aria-hidden
            viewBox="0 0 400 600"
            preserveAspectRatio="xMidYMid slice"
            className="pointer-events-none absolute inset-0 h-full w-full text-resa-navy/[0.06]"
          >
            {/* Contour terrain */}
            <rect x="20" y="20" width="360" height="560" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />

            {/* Ligne médiane (horizontale) */}
            <line x1="20" y1="300" x2="380" y2="300" stroke="currentColor" strokeWidth="1.5" />

            {/* Cercle d'engagement */}
            <circle cx="200" cy="300" r="55" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="200" cy="300" r="3" fill="currentColor" />

            {/* Surface de réparation HAUT */}
            <rect x="100" y="20" width="200" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="140" y="20" width="120" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 155 100 A 45 45 0 0 0 245 100" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="200" cy="70" r="3" fill="currentColor" />

            {/* Surface de réparation BAS */}
            <rect x="100" y="500" width="200" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <rect x="140" y="550" width="120" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 155 500 A 45 45 0 0 1 245 500" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="200" cy="530" r="3" fill="currentColor" />

            {/* Arcs de corner */}
            <path d="M 20 40 A 20 20 0 0 0 40 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 360 20 A 20 20 0 0 1 380 40" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 20 560 A 20 20 0 0 1 40 580" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M 360 580 A 20 20 0 0 0 380 560" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>

          {/* ── Halos radiaux colorés (royal + rouge) ── */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(45% 40% at 12% 15%, rgba(30,58,138,0.08) 0%, transparent 65%), radial-gradient(40% 35% at 92% 88%, rgba(220,38,38,0.06) 0%, transparent 65%)'
            }}
          />

          {/* ── Voile blanc central pour garantir la lisibilité du contenu ── */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(70% 60% at 50% 45%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.35) 55%, transparent 80%)'
            }}
          />

          {/* ── Trame dots très subtile ── */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
            <div className="h-full w-full bg-dots" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 md:px-6">
            <Reveal variant="right">
              <div className="mb-14 max-w-3xl">
                <div className="mb-3 h-1 w-14 bg-resa-red" />
                <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                  {t('trainingTitle')}
                </h2>
                <p className="mt-3 text-base text-resa-text/70">
                  {t('trainingSubtitle')}
                </p>
              </div>
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
              {programs.map((p, i) => {
                const title = isFr ? p.title_fr : p.title_en;
                const description = isFr ? p.description_fr : p.description_en;

                return (
                  <Reveal key={p.id} variant="up" delay={i * 60} className="h-full">
                    <Link href={`/private-training/${p.slug}` as any} className="group block h-full">
                      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                        <div className="relative h-44 overflow-hidden">
                          <div className={`absolute inset-0 bg-linear-to-br ${p.accent ?? 'from-resa-navy to-resa-royal'}`} />
                          <img
                            src={`/images/programs/training/${p.slug}.jpg`}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-grid opacity-25" />
                          <div className="absolute inset-0 bg-linear-to-t from-resa-navy/90 via-resa-navy/30 to-transparent" />
                          <div className="absolute left-4 top-4 grid h-12 w-12 place-items-center rounded-xl border border-white/15 bg-white/10 text-2xl backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                            <span>{p.icon ?? '⚽'}</span>
                          </div>
                          <div className="absolute right-4 top-4 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                            {t('trainingCta')}
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="font-display text-base font-black text-resa-navy transition-colors group-hover:text-resa-red md:text-lg">
                            {title}
                          </h3>
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-resa-text/65 line-clamp-2">
                            {description}
                          </p>
                          <div className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-resa-red">
                            {t('trainingCta')}
                            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                          </div>
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

      {/* ═══════ 3 · PLAYER PATHWAY — SOMBRE ═══════ */}
      <section className="relative overflow-hidden bg-fade-navy py-24 text-white md:py-32">
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
                {t('pathwayTitle')}
              </h2>
              <p className="mt-3 text-base text-white/65">
                {t('pathwaySubtitle')}
              </p>
            </div>
          </Reveal>

          <PlayerPathway steps={pathwaySteps} />
        </div>
      </section>

      {/* ═══════ 4 · POUR QUI ? — CLAIR ═══════ */}
      <section className="relative overflow-hidden bg-white py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
          <div className="h-full w-full bg-dots" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 55% at 50% 40%, rgba(30,58,138,0.05) 0%, transparent 70%)'
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-14 max-w-3xl">
              <div className="mb-3 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                {t('profilesTitle')}
              </h2>
              <p className="mt-3 text-base text-resa-text/70">
                {t('profilesSubtitle')}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 md:gap-8">
            {profiles.map((p, i) => (
              <Reveal key={p.key} variant="up" delay={i * 100} className="h-full">
                <Link href={p.href as any} className="group block h-full">
                  <article className="flex h-full flex-col items-center rounded-2xl border border-black/5 bg-linear-to-br from-white to-resa-gray/60 p-6 text-center shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                    <div
                      className={`relative mb-4 grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-linear-to-br ${p.gradient} shadow-resa-lg transition-transform duration-500 group-hover:scale-105`}
                    >
                      <img
                        src={p.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                      <span className="relative z-[-1] text-4xl">{p.icon}</span>
                      <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                    </div>
                    <h3 className="font-display text-base font-black text-resa-navy transition-colors group-hover:text-resa-red">
                      {t(`profile${p.key}Title` as any)}
                    </h3>
                    <p className="mt-2 flex-1 text-xs leading-relaxed text-resa-text/60">
                      {t(`profile${p.key}Text` as any)}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-resa-red">
                      {t('profileCta')}
                      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </div>
                  </article>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 5 · CTA FINAL — SOMBRE ═══════ */}
      <section className="relative overflow-hidden bg-linear-to-b from-resa-navy via-resa-navy to-resa-navy-deep py-28 text-white md:py-40">
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

        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
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
                href="/inscriptions#form"
                className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:scale-[1.04] hover:bg-red-700"
              >
                {t('ctaRegister')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/contact#form"
                className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.04] hover:bg-white hover:text-resa-navy"
              >
                {t('ctaContact')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}