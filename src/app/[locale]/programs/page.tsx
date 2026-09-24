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

      {/* ═══════════ 4 GRANDES PORTES ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <Reveal variant="right">
          <div className="mb-12 max-w-3xl">
            <div className="mb-3 h-1 w-14 bg-resa-red" />
            <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
              {t('doorsTitle')}
            </h2>
            <p className="mt-3 text-base text-resa-text/70">
              {t('doorsSubtitle')}
            </p>
          </div>
        </Reveal>

        <div className="-mx-3 flex flex-wrap">
          {doors.map((d, i) => (
            <div key={d.key} className="w-full px-3 pb-6 sm:w-1/2">
              <Reveal variant="up" delay={i * 100}>
                <Link href={d.href as any} className="group block h-full">
                  <article
                    className={`relative flex h-80 flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br ${d.gradient} shadow-resa-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_60px_rgba(10,31,68,.28)] md:h-96`}
                  >
                    {/* Image de fond (apparaît si présente) */}
                    <img
                      src={d.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Pattern overlay (visible surtout quand pas d'image) */}
                    <div className="absolute inset-0 opacity-40">
                      {d.pattern === 'grid'    && <div className="h-full w-full bg-grid" />}
                      {d.pattern === 'dots'    && <div className="h-full w-full bg-dots" />}
                      {d.pattern === 'stripes' && <div className="h-full w-full bg-stripes" />}
                      {d.pattern === 'halo'    && <div className="h-full w-full bg-halo" />}
                    </div>

                    {/* Overlay vertical navy */}
                    <div className="absolute inset-0 bg-gradient-to-t from-resa-navy via-resa-navy/55 to-resa-navy/10" />

                    {/* Halo décoratif */}
                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

                    {/* Icône badge top-left */}
                    <div className="absolute left-5 top-5 grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur-md transition-transform duration-500 group-hover:scale-110 md:left-6 md:top-6 md:h-16 md:w-16">
                      <div className="h-7 w-7 md:h-8 md:w-8">{d.icon}</div>
                    </div>

                    {/* Contenu bottom */}
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
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ PROGRAMMES TRAINING (depuis DB) ═══════════ */}
      {programs.length > 0 && (
        <section className="bg-resa-gray py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <Reveal variant="right">
              <div className="mb-12 max-w-3xl">
                <div className="mb-3 h-1 w-14 bg-resa-red" />
                <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                  {t('trainingTitle')}
                </h2>
                <p className="mt-3 text-base text-resa-text/70">
                  {t('trainingSubtitle')}
                </p>
              </div>
            </Reveal>

            <div className="-mx-3 flex flex-wrap">
              {programs.map((p, i) => {
                const title = isFr ? p.title_fr : p.title_en;
                const description = isFr ? p.description_fr : p.description_en;

                return (
                  <div key={p.id} className="w-full px-3 pb-6 sm:w-1/2 lg:w-1/3">
                    <Reveal variant="up" delay={i * 60}>
                      <Link
                        href={`/private-training/${p.slug}` as any}
                        className="group block h-full"
                      >
                        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                          {/* Image header */}
                          <div className="relative h-44 overflow-hidden">
                            {/* Fallback gradient */}
                            <div
                              className={`absolute inset-0 bg-gradient-to-br ${
                                p.accent ?? 'from-resa-navy to-resa-royal'
                              }`}
                            />

                            {/* Image de fond (apparaît si présente) */}
                            <img
                              src={`/images/programs/training/${p.slug}.jpg`}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                            />

                            {/* Pattern overlay */}
                            <div className="absolute inset-0 bg-grid opacity-25" />

                            {/* Overlay navy */}
                            <div className="absolute inset-0 bg-gradient-to-t from-resa-navy/90 via-resa-navy/30 to-transparent" />

                            {/* Icône badge */}
                            <div className="absolute left-4 top-4 grid h-12 w-12 place-items-center rounded-xl border border-white/15 bg-white/10 text-2xl backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                              <span>{p.icon ?? '⚽'}</span>
                            </div>

                            {/* Lien "Réserver" top-right */}
                            <div className="absolute right-4 top-4 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                              {t('trainingCta')}
                            </div>
                          </div>

                          {/* Contenu */}
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
                  </div>
                );
              })}
            </div>

            <Reveal variant="up">
              <div className="mt-8 text-center">
                <Link
                  href="/private-training"
                  className="group inline-flex items-center gap-2 rounded-full border border-resa-navy/15 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-resa-navy transition-all duration-300 hover:scale-[1.03] hover:bg-resa-navy hover:text-white"
                >
                  {t('trainingSeeAll')}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══════════ POUR QUI ? ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <Reveal variant="right">
          <div className="mb-12 max-w-3xl">
            <div className="mb-3 h-1 w-14 bg-resa-red" />
            <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
              {t('profilesTitle')}
            </h2>
            <p className="mt-3 text-base text-resa-text/70">
              {t('profilesSubtitle')}
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {profiles.map((p, i) => (
            <Reveal key={p.key} variant="up" delay={i * 100}>
              <Link href={p.href as any} className="group block h-full">
                <article className="flex h-full flex-col items-center rounded-2xl border border-black/5 bg-white p-6 text-center shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                  {/* Avatar avec fallback gradient */}
                  <div
                    className={`relative mb-4 grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-gradient-to-br ${p.gradient} shadow-resa-lg transition-transform duration-500 group-hover:scale-105`}
                  >
                    {/* Image de fond (apparaît si présente) */}
                    <img
                      src={p.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                    {/* Fallback icône (visible seulement si image absente → z-0, sinon caché par img z-1) */}
                    <span className="relative z-[-1] text-4xl">{p.icon}</span>
                    {/* Overlay subtle pour contraste */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
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
      </section>

      {/* ═══════════ PLAYER PATHWAY ═══════════ */}
      <section className="bg-fade-navy py-16 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-12 max-w-2xl">
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

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="relative overflow-hidden bg-resa-navy py-20 text-white md:py-28">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-resa-red/15 blur-3xl anim-float" />

        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
          <Reveal variant="zoom">
            <h2 className="font-display text-4xl font-black md:text-5xl">
              {t('ctaTitle')}
            </h2>
          </Reveal>
          <Reveal variant="up" delay={120}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/75">
              {t('ctaText')}
            </p>
          </Reveal>
          <Reveal variant="up" delay={240}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/inscriptions"
                className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:scale-[1.04] hover:bg-red-700"
              >
                {t('ctaRegister')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.04] hover:bg-white hover:text-resa-navy"
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