import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import HeroSlideshow from '@/components/ui/HeroSlideshow';
import HeroContent from '@/components/ui/HeroContent';
import PlayerPathway from '@/components/ui/PlayerPathway';
import EcosystemCta from '@/components/ui/EcosystemCta';
import ParallaxVideo from '@/components/ui/ParallaxVideo';
import { getGlobalStats, getNews, getSponsors } from '@/lib/queries';

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [stats, news, sponsors] = await Promise.all([
    getGlobalStats(),
    getNews(3),
    getSponsors()
  ]);

  return (
    <HomeContent
      stats={stats}
      news={news}
      sponsors={sponsors}
      locale={locale}
    />
  );
}

function HomeContent({
  stats,
  news,
  sponsors,
  locale
}: {
  stats: any;
  news: any[];
  sponsors: any[];
  locale: string;
}) {
  const t = useTranslations('universe');
  const isFr = locale === 'fr';

  const statItems = [
    { value: `${stats.schools}+`, label: isFr ? 'Écoles' : 'Schools' },
    { value: stats.teams, label: isFr ? 'Équipes' : 'Teams' },
    { value: stats.players, label: isFr ? 'Joueurs' : 'Players' },
    { value: '2', label: isFr ? 'Continents' : 'Continents' }
  ];

  // ─── 3 grandes portes ───
  const portes = [
    {
      key: 'academy',
      href: '/academy',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-6 10 6-10 6z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
      accent: 'from-resa-royal to-resa-navy',
      titleKey: 'porteAcademyTitle',
      textKey: 'porteAcademyText',
      ctaKey: 'porteAcademyCta'
    },
    {
      key: 'league',
      href: '/ligue',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0z" />
        </svg>
      ),
      accent: 'from-resa-red to-red-800',
      titleKey: 'porteLeagueTitle',
      textKey: 'porteLeagueText',
      ctaKey: 'porteLeagueCta'
    },
    {
      key: 'training',
      href: '/private-training',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      accent: 'from-resa-navy to-resa-navy-deep',
      titleKey: 'porteTrainingTitle',
      textKey: 'porteTrainingText',
      ctaKey: 'porteTrainingCta'
    }
  ];

  // ─── Player Pathway (traductions passées au client component) ───
  const pathwaySteps = [
    { n: '01', icon: '🌱', title: t('pathwayLearnTitle'), text: t('pathwayLearnText') },
    { n: '02', icon: '⚽', title: t('pathwayDevelopTitle'), text: t('pathwayDevelopText') },
    { n: '03', icon: '🏆', title: t('pathwayCompeteTitle'), text: t('pathwayCompeteText') },
    { n: '04', icon: '🔍', title: t('pathwayIdentifiedTitle'), text: t('pathwayIdentifiedText') },
    { n: '05', icon: '🚀', title: t('pathwayNextTitle'), text: t('pathwayNextText') }
  ];

  // ─── 2 régions ───
  const regions = [
    {
      key: 'usa',
      flag: '🇺🇸',
      titleKey: 'regionsUsaTitle',
      textKey: 'regionsUsaText',
      href: '/academy',
      accent: 'from-blue-600 to-blue-800'
    },
    {
      key: 'africa',
      flag: '🇨🇮',
      titleKey: 'regionsAfricaTitle',
      textKey: 'regionsAfricaText',
      href: '/ligue',
      accent: 'from-emerald-600 to-emerald-800'
    }
  ];

  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden bg-resa-navy text-white">
        <HeroSlideshow />

        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(10,31,68,.97) 0%, rgba(10,31,68,.85) 40%, rgba(10,31,68,.4) 75%, rgba(10,31,68,.2) 100%)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-resa-navy/80 via-transparent to-resa-navy/40" />
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="pointer-events-none absolute right-[-15%] top-[-25%] h-[420px] w-[420px] rounded-full bg-resa-red/15 blur-3xl anim-float" />
        <div className="pointer-events-none absolute bottom-[-15%] left-[-15%] h-[360px] w-[360px] rounded-full bg-resa-royal/25 blur-3xl anim-float delay-500" />

        {/* Contenu hero avec parallaxe + fade */}
        <HeroContent stats={stats} isFr={isFr} />

        {/* Bandeau de stats (statique, sous le hero) */}
        <div className="relative border-t border-white/10 bg-resa-navy-deep/70 backdrop-blur">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px md:grid-cols-4 md:px-6">
            {statItems.map((s, i) => (
              <Reveal
                key={i}
                variant="up"
                delay={i * 100}
                className="border-white/10 px-5 py-4 first:md:border-l-0 md:border-l"
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

      {/* ═══════════════ LES 3 PORTES ═══════════════ */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <Reveal variant="right">
          <div className="mb-14 max-w-3xl">
            <div className="mb-4 h-1 w-14 bg-resa-red" />
            <h2 className="font-display text-4xl font-black text-resa-navy md:text-5xl">
              {t('portesTitle')}
            </h2>
            <p className="mt-4 text-lg text-resa-text/70">
              {t('portesSubtitle')}
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {portes.map((p, i) => (
            <Reveal key={p.key} variant="up" delay={i * 120}>
              <Link href={p.href as any} className="group block h-full">
                <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                  <div className={`h-1.5 w-full bg-gradient-to-r ${p.accent}`} />

                  <div className="relative flex h-40 items-center justify-center overflow-hidden bg-resa-gray">
                    <div className="absolute inset-0 bg-grid opacity-40" />
                    <div className="pointer-events-none absolute inset-0 bg-halo opacity-40" />
                    <div className="relative h-20 w-20 text-resa-navy transition-transform duration-500 group-hover:scale-110 group-hover:text-resa-red">
                      {p.icon}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-8">
                    <h3 className="font-display text-2xl font-black text-resa-navy transition-colors duration-300 group-hover:text-resa-red">
                      {t(p.titleKey as any)}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-resa-text/70">
                      {t(p.textKey as any)}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-resa-royal transition-colors duration-300 group-hover:text-resa-red">
                      {t(p.ctaKey as any)}
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════ PLAYER PATHWAY ═══════════════ */}
      <section className="bg-fade-navy py-20 text-white md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-14 max-w-2xl">
              <div className="mb-4 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-4xl font-black md:text-5xl">
                {t('pathwayTitle')}
              </h2>
              <p className="mt-4 text-lg text-white/65">
                {t('pathwaySubtitle')}
              </p>
            </div>
          </Reveal>

          <PlayerPathway steps={pathwaySteps} />
        </div>
      </section>

      {/* ═══════════════ PARALLAX VIDÉO ═══════════════ */}
      <ParallaxVideo />

      {/* ═══════════════ 2 RÉGIONS ═══════════════ */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
        <Reveal variant="right">
          <div className="mb-14 max-w-3xl">
            <div className="mb-4 h-1 w-14 bg-resa-red" />
            <h2 className="font-display text-4xl font-black text-resa-navy md:text-5xl">
              {t('regionsTitle')}
            </h2>
            <p className="mt-4 text-lg text-resa-text/70">
              {t('regionsSubtitle')}
            </p>
          </div>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          {regions.map((r, i) => (
            <Reveal key={r.key} variant="up" delay={i * 120}>
              <Link href={r.href as any} className="group block h-full">
                <article className={`relative flex h-full items-center gap-6 overflow-hidden rounded-3xl bg-gradient-to-br ${r.accent} p-8 text-white shadow-resa-lg transition-all duration-500 hover:-translate-y-2 md:p-10`}>
                  <div className="absolute inset-0 bg-grid opacity-20" />
                  <div className="absolute right-0 top-0 h-40 w-40 bg-halo opacity-40" />

                  <div className="relative text-6xl md:text-7xl">{r.flag}</div>
                  <div className="relative min-w-0 flex-1">
                    <h3 className="font-display text-2xl font-black md:text-3xl">
                      {t(r.titleKey as any)}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/80 md:text-base">
                      {t(r.textKey as any)}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                      {isFr ? 'Découvrir' : 'Discover'}
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════ ACTUALITÉS ═══════════════ */}
      {news.length > 0 && (
        <section className="bg-resa-gray py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <Reveal variant="right">
              <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="mb-4 h-1 w-14 bg-resa-red" />
                  <h2 className="font-display text-4xl font-black text-resa-navy md:text-5xl">
                    {t('newsTitle')}
                  </h2>
                  <p className="mt-4 text-lg text-resa-text/70">
                    {t('newsSubtitle')}
                  </p>
                </div>
                <Link
                  href="/actualites"
                  className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-resa-red transition hover:text-resa-navy"
                >
                  {t('newsSeeAll')}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-3">
              {news.slice(0, 3).map((n, i) => (
                <Reveal key={n.id} variant="up" delay={i * 120}>
                  <Link href={`/actualites/${n.slug}` as any} className="group block h-full">
                    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-resa-navy to-resa-royal">
                        <div className="absolute inset-0 bg-grid opacity-40" />
                        <div className="absolute bottom-3 left-3 rounded-full bg-resa-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                          {n.published_at
                            ? new Date(n.published_at).toLocaleDateString(
                                isFr ? 'fr-FR' : 'en-GB',
                                { day: '2-digit', month: 'short' }
                              )
                            : ''}
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="font-display text-base font-bold leading-tight text-resa-navy transition-colors group-hover:text-resa-red line-clamp-2">
                          {isFr ? n.title_fr : n.title_en || n.title_fr}
                        </h3>
                        <p className="mt-3 flex-1 text-sm text-resa-text/65 line-clamp-2">
                          {isFr ? n.excerpt_fr : n.excerpt_en || n.excerpt_fr}
                        </p>
                      </div>
                    </article>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ CTA FINAL (avec image de fond parallaxe) ═══════════════ */}
      <EcosystemCta isFr={isFr} />
    </>
  );
}