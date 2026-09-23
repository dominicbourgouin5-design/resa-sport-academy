import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import HeroSlideshow from '@/components/ui/HeroSlideshow';
import ParallaxVideo from '@/components/ui/ParallaxVideo';
import Parallax from '@/components/ui/Parallax';
import { getGlobalStats } from '@/lib/queries';
// import HeroVideo from '@/components/ui/HeroVideo';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const stats = await getGlobalStats();

  return <HomeContent stats={stats} />;
}

function HomeContent({ stats }: { stats: any }) {
  const t = useTranslations('home');

  const categories = [
    { code: 'U7',  level: 'CP · CE1',  accent: 'from-resa-royal to-resa-navy' },
    { code: 'U9',  level: 'CE2 · CM1', accent: 'from-resa-red  to-red-800' },
    { code: 'U11', level: 'CM2',       accent: 'from-resa-navy to-resa-navy-deep' }
  ];

  const statItems = [
    { value: `${stats.schools}+`,  label: t('statSchools') },
    { value: stats.categories,     label: t('statCategories') },
    { value: stats.months,         label: t('statMonths') },
    { value: stats.seasonYear + 1, label: t('statSeason') }
  ];

  return (
    <>
      {/* ─── HERO ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-resa-navy text-white">
        <HeroSlideshow />

        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, rgba(10,31,68,.95) 0%, rgba(10,31,68,.75) 35%, rgba(10,31,68,.35) 65%, rgba(10,31,68,.15) 100%)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-resa-navy/70 via-transparent to-resa-navy/40" />
        <div className="absolute inset-0 bg-grid opacity-20 anim-fade-in" />

        <div className="pointer-events-none absolute right-[-15%] top-[-25%] h-[420px] w-[420px] rounded-full bg-resa-red/15 blur-3xl anim-float" />
        <div className="pointer-events-none absolute bottom-[-15%] left-[-15%] h-[360px] w-[360px] rounded-full bg-resa-royal/25 blur-3xl anim-float delay-500" />

        <div className="relative mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl flex-col justify-center px-4 py-10 md:px-6 md:py-12">
          <div className="max-w-3xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/85 backdrop-blur anim-fade-up">
              <span className="h-1.5 w-1.5 rounded-full bg-resa-red anim-glow" />
              {t('heroBadge')}
            </span>

            <h1 className="font-display text-5xl font-black leading-[1.02] tracking-tight sm:text-6xl md:text-7xl lg:text-7xl">
              <span className="block anim-fade-up delay-100">{t('heroTitle1')}</span>
              <span className="block text-resa-red anim-fade-up delay-200">
                {t('heroTitle2')}
              </span>
              <span className="block anim-fade-up delay-300">{t('heroTitle3')}</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg md:text-xl anim-fade-up delay-500">
              {t('heroSubtitle')}
            </p>

            <div className="mt-7 flex flex-wrap gap-3 anim-fade-up delay-700">
              <Link
                href="/inscriptions"
                className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-6 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:bg-red-700 hover:scale-[1.03] hover:shadow-[0_24px_48px_rgba(220,38,38,.35)] md:text-sm"
              >
                {t('ctaPrimary')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/ligue"
                className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-xs font-bold uppercase tracking-wide text-white backdrop-blur transition-all duration-300 hover:bg-white hover:text-resa-navy hover:scale-[1.03] md:text-sm"
              >
                {t('ctaSecondary')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/10 bg-resa-navy-deep/70 backdrop-blur">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px md:grid-cols-4 md:px-6">
            {statItems.map((s, i) => (
              <Reveal
                key={i}
                variant="up"
                delay={i * 100}
                className="border-white/10 px-5 py-4 md:border-l first:md:border-l-0"
              >
                <div className="font-display text-2xl font-black text-white md:text-3xl">
                  {s.value}
                </div>
                <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/50">
                  {s.label}
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="h-1 gradient-line" />
      </section>

      {/* ─── PARALLAX VIDÉO ─── */}
      <ParallaxVideo />

      {/* ─── 3 CATÉGORIES ─── */}
      <section className="mx-auto max-w-7xl px-4 py-24 md:px-6">
        <Reveal className="mb-14 max-w-2xl" variant="right">
          <div className="mb-4 h-1 w-14 bg-resa-red" />
          <h2 className="font-display text-4xl font-black text-resa-navy md:text-5xl">
            {t('categoriesTitle')}
          </h2>
          <p className="mt-4 text-lg text-resa-text/70">
            {t('categoriesSubtitle')}
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((c, i) => (
            <Parallax key={c.code} speed={0.05 + i * 0.04} direction="up">
              <Reveal variant="up" delay={i * 120}>
                <article className="group relative h-full overflow-hidden rounded-2xl border border-black/5 bg-white p-8 shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.accent} transition-transform duration-500 group-hover:scale-x-110`} />
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-resa-royal/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative font-display text-6xl font-black text-resa-navy transition-transform duration-500 group-hover:scale-105 group-hover:text-resa-red">
                    {c.code}
                  </div>
                  <div className="mt-2 text-xs font-bold uppercase tracking-widest text-resa-red">
                    {c.level}
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-resa-text/70">
                    {t(`cat${c.code}` as any)}
                  </p>
                </article>
              </Reveal>
            </Parallax>
          ))}
        </div>
      </section>

      {/* ─── DEUX PILIERS ─── */}
      <section className="bg-resa-gray py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 md:grid-cols-2 md:px-6">
          {/* Pilier 1 : Ligue — monte */}
          <Parallax speed={0.08} direction="up">
            <Reveal variant="right">
              <article className="group relative h-full overflow-hidden rounded-2xl bg-resa-navy p-10 text-white shadow-resa-lg transition-all duration-500 hover:shadow-[0_32px_64px_rgba(10,31,68,.25)] hover:-translate-y-1">
                <div className="absolute inset-0 bg-grid opacity-40" />
                <div className="absolute right-0 top-0 h-40 w-40 bg-halo opacity-60 anim-float" />
                <div className="relative">
                  <div className="mb-5 h-1 w-12 bg-resa-red transition-all duration-500 group-hover:w-20" />
                  <h2 className="font-display text-3xl font-black md:text-4xl">
                    {t('ligueTitle')}
                  </h2>
                  <p className="mt-4 text-white/75">{t('ligueText')}</p>
                  <Link
                    href="/ligue"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-resa-red transition-colors duration-300 hover:text-white"
                  >
                    {t('discover')}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </article>
            </Reveal>
          </Parallax>

          {/* Pilier 2 : RESA — descend (opposé) */}
          <Parallax speed={0.08} direction="down">
            <Reveal variant="left" delay={120}>
              <article className="group relative h-full overflow-hidden rounded-2xl bg-white p-10 shadow-resa-lg transition-all duration-500 hover:shadow-[0_32px_64px_rgba(10,31,68,.15)] hover:-translate-y-1">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-resa-royal/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-5 h-1 w-12 bg-resa-royal transition-all duration-500 group-hover:w-20" />
                  <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                    {t('resaTitle')}
                  </h2>
                  <p className="mt-4 text-resa-text/70">{t('resaText')}</p>
                  <Link
                    href="/resa"
                    className="mt-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-resa-royal transition-colors duration-300 hover:text-resa-red"
                  >
                    {t('discover')}
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </article>
            </Reveal>
          </Parallax>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="relative overflow-hidden bg-fade-navy py-24 text-white">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-resa-red/10 blur-3xl anim-float" />

        <Parallax speed={0.05} direction="up">
          <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
            <Reveal variant="zoom">
              <h2 className="font-display text-4xl font-black md:text-6xl">
                {t('ctaTitle')}
              </h2>
            </Reveal>
            <Reveal variant="up" delay={120}>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
                {t('ctaText')}
              </p>
            </Reveal>
            <Reveal variant="up" delay={240}>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link
                  href="/inscriptions"
                  className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:bg-red-700 hover:scale-[1.04]"
                >
                  {t('ctaPrimary')}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href="/sponsors"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-white hover:text-resa-navy hover:scale-[1.04]"
                >
                  {t('ctaPartner')}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </Parallax>
      </section>
    </>
  );
}