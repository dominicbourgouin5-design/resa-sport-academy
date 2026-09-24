import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import PlayerPathway from '@/components/ui/PlayerPathway';
import AcademyHero from './AcademyHero';

export default async function AcademyPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AcademyContent />;
}

function AcademyContent() {
  const t = useTranslations('academy');

  // ─── 4 piliers (avec images) ───
  const pillars = [
    {
      key: 'Tech',
      icon: '⚽',
      image: '/images/academy/pillars/tech.jpg',
      gradient: 'from-resa-navy via-resa-royal to-resa-navy-deep'
    },
    {
      key: 'Tactic',
      icon: '🧠',
      image: '/images/academy/pillars/tactic.jpg',
      gradient: 'from-resa-royal via-resa-navy to-resa-navy-deep'
    },
    {
      key: 'Phys',
      icon: '💪',
      image: '/images/academy/pillars/phys.jpg',
      gradient: 'from-resa-red via-red-700 to-red-900'
    },
    {
      key: 'Mental',
      icon: '🎯',
      image: '/images/academy/pillars/mental.jpg',
      gradient: 'from-amber-500 via-amber-600 to-amber-800'
    }
  ];

  // ─── 4 programmes (avec images) ───
  const programs = [
    {
      key: 'Discovery',
      range: 'U7 – U9',
      icon: '🌱',
      image: '/images/academy/programs/discovery.jpg',
      gradient: 'from-resa-royal to-resa-navy'
    },
    {
      key: 'Development',
      range: 'U9 – U11',
      icon: '⚽',
      image: '/images/academy/programs/development.jpg',
      gradient: 'from-resa-navy to-resa-royal'
    },
    {
      key: 'Performance',
      range: 'U11 – U13',
      icon: '🏆',
      image: '/images/academy/programs/performance.jpg',
      gradient: 'from-resa-red to-red-800'
    },
    {
      key: 'Elite',
      range: 'U13 – U15',
      icon: '🚀',
      image: '/images/academy/programs/elite.jpg',
      gradient: 'from-amber-500 to-amber-700'
    }
  ];

  // ─── Pathway steps ───
  const pathwaySteps = [
    { n: '01', icon: '🌱', title: t('pathwayLearnTitle'),      text: t('pathwayLearnText') },
    { n: '02', icon: '⚽', title: t('pathwayDevelopTitle'),    text: t('pathwayDevelopText') },
    { n: '03', icon: '🏆', title: t('pathwayCompeteTitle'),    text: t('pathwayCompeteText') },
    { n: '04', icon: '🔍', title: t('pathwayIdentifiedTitle'), text: t('pathwayIdentifiedText') },
    { n: '05', icon: '🚀', title: t('pathwayNextTitle'),       text: t('pathwayNextText') }
  ];

  // ─── 2 régions ───
  const regions = [
    {
      key: 'Usa',
      flag: '🇺🇸',
      image: '/images/academy/regions/usa.jpg',
      gradient: 'from-blue-600 via-blue-700 to-blue-900'
    },
    {
      key: 'Africa',
      flag: '🇨🇮',
      image: '/images/academy/regions/africa.jpg',
      gradient: 'from-emerald-600 via-emerald-700 to-emerald-900'
    }
  ];

  return (
    <>
      <AcademyHero />

      {/* ─── MISSION ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal variant="right">
            <article className="relative h-full overflow-hidden rounded-3xl bg-resa-navy p-8 text-white shadow-resa-lg md:p-10">
              <div className="absolute inset-0 bg-grid opacity-30" />
              <div className="absolute right-0 top-0 h-40 w-40 bg-halo opacity-60 anim-float" />
              <div className="relative">
                <div className="mb-5 h-1 w-12 bg-resa-red" />
                <div className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-white/50">
                  01
                </div>
                <h2 className="font-display text-3xl font-black md:text-4xl">
                  {t('missionTitle')}
                </h2>
                <p className="mt-4 leading-relaxed text-white/75">
                  {t('missionText')}
                </p>
              </div>
            </article>
          </Reveal>

          <Reveal variant="left" delay={120}>
            <article className="relative h-full overflow-hidden rounded-3xl bg-white p-8 shadow-resa-lg md:p-10">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-resa-royal/5" />
              <div className="relative">
                <div className="mb-5 h-1 w-12 bg-resa-royal" />
                <div className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-resa-text/40">
                  02
                </div>
                <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                  {t('whyTitle')}
                </h2>
                <p className="mt-4 leading-relaxed text-resa-text/75">
                  {t('whyText')}
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ─── 4 PILIERS (avec images) ─── */}
      <section className="bg-resa-gray py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-12 max-w-2xl">
              <div className="mb-3 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                {t('pillarsTitle')}
              </h2>
              <p className="mt-3 text-base text-resa-text/70">
                {t('pillarsSubtitle')}
              </p>
            </div>
          </Reveal>

          <div className="-mx-3 flex flex-wrap">
            {pillars.map((p, i) => (
              <div key={p.key} className="w-full px-3 pb-6 sm:w-1/2 lg:w-1/4">
                <Reveal variant="up" delay={i * 100}>
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                    {/* Image header */}
                    <div className="relative h-40 overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} />
                      <img
                        src={p.image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-resa-navy/60 via-transparent to-transparent" />
                      <div className="absolute left-4 top-4 grid h-12 w-12 place-items-center rounded-xl border border-white/15 bg-white/10 text-2xl backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                        {p.icon}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="font-display text-lg font-black text-resa-navy transition-colors duration-300 group-hover:text-resa-red">
                        {t(`pillar${p.key}Title` as any)}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-resa-text/65">
                        {t(`pillar${p.key}Text` as any)}
                      </p>
                    </div>
                  </article>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4 PROGRAMMES PAR ÂGE (avec images) ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <Reveal variant="right">
          <div className="mb-12 max-w-2xl">
            <div className="mb-3 h-1 w-14 bg-resa-red" />
            <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
              {t('programsTitle')}
            </h2>
            <p className="mt-3 text-base text-resa-text/70">
              {t('programsSubtitle')}
            </p>
          </div>
        </Reveal>

        <div className="-mx-3 flex flex-wrap">
          {programs.map((p, i) => (
            <div key={p.key} className="w-full px-3 pb-6 sm:w-1/2">
              <Reveal variant="up" delay={i * 100}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg md:flex-row">
                  {/* Image à gauche (vertical strip) */}
                  <div className="relative h-48 overflow-hidden md:h-auto md:w-48 md:shrink-0">
                    <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} />
                    <img
                      src={p.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-resa-navy/60 via-transparent to-transparent md:bg-gradient-to-r" />

                    {/* Icône badge */}
                    <div className="absolute left-4 top-4 grid h-12 w-12 place-items-center rounded-xl border border-white/15 bg-white/10 text-2xl backdrop-blur-md md:bottom-4 md:top-auto">
                      {p.icon}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <div className="mb-1 text-[10px] font-black uppercase tracking-widest text-resa-red">
                      {p.range}
                    </div>
                    <h3 className="font-display text-xl font-black text-resa-navy transition-colors duration-300 group-hover:text-resa-red">
                      {t(`program${p.key}Title` as any)}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-resa-text/65">
                      {t(`program${p.key}Text` as any)}
                    </p>
                  </div>
                </article>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PLAYER PATHWAY ─── */}
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

      {/* ─── 2 RÉGIONS (avec images) ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <Reveal variant="right">
          <div className="mb-12 max-w-2xl">
            <div className="mb-3 h-1 w-14 bg-resa-red" />
            <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
              {t('regionsTitle')}
            </h2>
            <p className="mt-3 text-base text-resa-text/70">
              {t('regionsSubtitle')}
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          {regions.map((r, i) => (
            <Reveal key={r.key} variant="up" delay={i * 120}>
              <article className="relative flex h-64 items-center gap-6 overflow-hidden rounded-3xl shadow-resa-lg md:h-72">
                {/* Image en fond */}
                <div className={`absolute inset-0 bg-gradient-to-br ${r.gradient}`} />
                <img
                  src={r.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-resa-navy/95 via-resa-navy/60 to-resa-navy/30" />
                <div className="absolute inset-0 bg-grid opacity-20" />

                <div className="relative flex w-full items-center gap-6 p-8 text-white md:p-10">
                  <div className="text-6xl md:text-7xl">{r.flag}</div>
                  <div className="relative min-w-0 flex-1">
                    <h3 className="font-display text-2xl font-black md:text-3xl">
                      {t(`regions${r.key}Title` as any)}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/85 md:text-base">
                      {t(`regions${r.key}Text` as any)}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── TEASER COACHS ─── */}
      <section className="bg-resa-gray py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <Reveal variant="up">
            <article className="relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl bg-white p-10 text-center shadow-resa-lg md:flex-row md:p-14 md:text-left">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-resa-royal/5" />
              <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-resa-navy to-resa-royal text-5xl text-white shadow-resa">
                👥
              </div>
              <div className="relative flex-1">
                <h3 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
                  {t('coachesTeaserTitle')}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-resa-text/70">
                  {t('coachesTeaserText')}
                </p>
              </div>
              <Link
                href="/coaches"
                className="group relative inline-flex items-center gap-2 rounded-full bg-resa-navy px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.04] hover:bg-resa-red"
              >
                {t('coachesTeaserCta')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="relative overflow-hidden bg-fade-navy py-16 text-white md:py-20">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-resa-red/10 blur-3xl anim-float" />

        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
          <Reveal variant="zoom">
            <h2 className="font-display text-3xl font-black md:text-5xl">
              {t('ctaTitle')}
            </h2>
          </Reveal>
          <Reveal variant="up" delay={120}>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/70 md:text-lg">
              {t('ctaText')}
            </p>
          </Reveal>
          <Reveal variant="up" delay={240}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/inscriptions"
                className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:bg-red-700 hover:scale-[1.03]"
              >
                {t('ctaTrial')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white backdrop-blur transition-all duration-300 hover:bg-white hover:text-resa-navy hover:scale-[1.03]"
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