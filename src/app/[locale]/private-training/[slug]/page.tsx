import { setRequestLocale } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import ParallaxBg from '@/components/ui/ParallaxBg';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import PublicRates from '@/components/ui/PublicRates';
import {
  getTrainingProgramBySlug,
  getTrainingPrograms
} from '@/lib/queries';

export default async function ProgramDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [program, allPrograms] = await Promise.all([
    getTrainingProgramBySlug(slug),
    getTrainingPrograms()
  ]);
  if (!program) notFound();
  const others = allPrograms.filter((p: any) => p.id !== program.id).slice(0, 3);
  return <ProgramDetail program={program} others={others} />;
}

function ProgramDetail({
  program,
  others
}: {
  program: any;
  others: any[];
}) {
  const t = useTranslations('programDetail');
  const locale = useLocale();
  const isFr = locale === 'fr';

  const title       = isFr ? program.title_fr : program.title_en;
  const description = isFr ? program.description_fr : program.description_en;
  const longDesc    = isFr ? program.long_description_fr : program.long_description_en;
  const highlights: string[] =
    (isFr ? program.highlights_fr : program.highlights_en) ?? [];
  const price = isFr ? program.price_fr : program.price_en;

  const heroImage =
    program.image_url ?? `/images/programs/training/${program.slug}.jpg`;
  const bgImage =
    program.cta_image_url ?? `/images/programs/cta-bg.jpg`;
  const accent = program.accent ?? 'from-resa-navy to-resa-royal';

  const hasGroupSize = program.group_size_min && program.group_size_max;
  const groupLabel = hasGroupSize
    ? program.group_size_min === program.group_size_max
      ? String(program.group_size_min)
      : `${program.group_size_min}–${program.group_size_max}`
    : null;

  const hasRates = Array.isArray(program.rates) && program.rates.length > 0;

  // ─── Quick facts ───
  const quickFacts = [
    program.duration_min && {
      icon: '⏱️',
      label: t('duration'),
      value: `${program.duration_min} min`
    },
    groupLabel && {
      icon: '👥',
      label: t('groupSize'),
      value: groupLabel
    },
    price && {
      icon: '💰',
      label: t('price'),
      value: price,
      highlight: true
    },
    {
      icon: '🌍',
      label: t('region'),
      value: program.region === 'both' ? t('regionBoth') : program.region?.toUpperCase()
    }
  ].filter(Boolean) as { icon: string; label: string; value: string; highlight?: boolean }[];

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-resa-navy text-white">
        <div className={`absolute inset-0 bg-linear-to-br ${accent}`} />
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-linear-to-t from-resa-navy via-resa-navy/80 to-resa-navy/50" />
        <div className="absolute inset-0 bg-grid opacity-15" />
        <div className={`pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-linear-to-br ${accent} opacity-20 blur-3xl anim-float`} />

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="mb-6 text-[11px] text-white/50">
            <Link href="/private-training" className="transition hover:text-white">
              {t('backToList')}
            </Link>
            <span className="mx-2">/</span>
            <span className="font-bold text-white">{title}</span>
          </div>

          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-5xl shadow-resa-lg backdrop-blur-md md:h-28 md:w-28 md:text-6xl">
              {program.icon ?? '⚽'}
            </div>

            <div className="flex-1">
              <h1 className="font-display text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
                {title}
              </h1>
              {description && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="h-1 gradient-line" />
      </section>

      {/* ═══ QUICK FACTS ═══ */}
      {quickFacts.length > 0 && (
        <section className="border-b border-black/5 bg-white">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4">
              {quickFacts.map((f, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 py-5 ${
                    i > 0 ? 'md:border-l md:border-black/5 md:pl-6' : ''
                  } ${i % 2 === 1 ? 'pl-4' : ''} ${i < 2 ? 'border-b border-black/5 md:border-b-0' : ''}`}
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-resa-gray text-xl">
                    {f.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/45">
                      {f.label}
                    </div>
                    <div
                      className={`mt-0.5 truncate font-display text-base font-black ${
                        f.highlight ? 'text-resa-red' : 'text-resa-navy'
                      }`}
                    >
                      {f.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ À PROPOS ═══ */}
      {longDesc && (
        <section className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-16">
          <Reveal variant="up">
            <div className="mb-3 h-1 w-12 bg-resa-red" />
            <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
              {t('aboutTitle')}
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-resa-text/80 md:text-base">
              {longDesc.split('\n\n').map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ═══ POINTS FORTS ═══ */}
      {highlights.length > 0 && (
        <section className="bg-resa-gray py-14 md:py-16">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <Reveal variant="up">
              <div className="mb-3 h-1 w-12 bg-resa-royal" />
              <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
                {t('highlightsTitle')}
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {highlights.map((h, i) => (
                  <div
                    key={i}
                    className="group flex items-start gap-3 rounded-xl border border-black/5 bg-white p-5 shadow-resa transition-all duration-300 hover:-translate-y-1 hover:border-resa-royal/20 hover:shadow-resa-lg"
                  >
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-resa-red text-[12px] font-bold text-white transition-transform duration-300 group-hover:scale-110">
                      ✓
                    </span>
                    <span className="text-sm font-medium leading-snug text-resa-text/80">
                      {h}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══ TARIFS DU PROGRAMME ═══ */}
      {hasRates && (
        <section className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-16">
          <Reveal variant="up">
            <PublicRates
              rates={program.rates}
              title={isFr ? 'Tarifs du programme' : 'Program pricing'}
            />
          </Reveal>
        </section>
      )}

      {/* ═══ RÉSERVER (image fixe en fond) ═══ */}
      <ParallaxBg
        image={bgImage}
        overlay="navy-deep"
        className="text-white"
      >
        <div className="mx-auto max-w-4xl px-4 py-24 md:px-6 md:py-32">
          <Reveal variant="up">
            <div className="grid gap-10 md:grid-cols-[1fr_auto] md:items-center">

              <div>
                <div className="mb-4 h-1 w-12 bg-resa-red" />
                <h2 className="font-display text-3xl font-black md:text-5xl">
                  {t('bookTitle')}
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
                  {t('bookText')}
                </p>

                {/* Mini récap */}
                <div className="mt-8 flex flex-wrap gap-3 text-xs">
                  {program.duration_min && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white/90 backdrop-blur">
                      ⏱️ <strong className="font-semibold text-white">{program.duration_min} min</strong>
                    </span>
                  )}
                  {groupLabel && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-white/90 backdrop-blur">
                      👥 <strong className="font-semibold text-white">{groupLabel}</strong>
                    </span>
                  )}
                  {price && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-resa-red/40 bg-resa-red/20 px-4 py-2 text-white backdrop-blur">
                      💰 <strong className="font-semibold text-white">{price}</strong>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 md:w-72">
                <Link
                  href={`/contact?program=${program.slug}` as any}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-resa-red px-6 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:scale-[1.03] hover:bg-red-700"
                >
                  {t('bookCta')}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <Link
                  href="/coaches"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-white backdrop-blur transition-all duration-300 hover:bg-white hover:text-resa-navy"
                >
                  {t('seeCoaches')}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </ParallaxBg>

      {/* ═══ AUTRES PROGRAMMES ═══ */}
      {others.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <Reveal variant="right">
              <div className="mb-10 max-w-2xl">
                <div className="mb-3 h-1 w-14 bg-resa-red" />
                <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
                  {t('othersTitle')}
                </h2>
              </div>
            </Reveal>

            <div className="-mx-3 flex flex-wrap">
              {others.map((p, i) => {
                const oTitle = isFr ? p.title_fr : p.title_en;
                const oDesc  = isFr ? p.description_fr : p.description_en;
                const oImg   = p.image_url ?? `/images/programs/training/${p.slug}.jpg`;
                const oAccent = p.accent ?? 'from-resa-navy to-resa-royal';
                return (
                  <div key={p.id} className="w-full px-3 pb-6 md:w-1/3">
                    <Reveal variant="up" delay={i * 100}>
                      <Link
                        href={`/private-training/${p.slug}` as any}
                        className="group block h-full"
                      >
                        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                          <div className="relative h-40 overflow-hidden">
                            <div className={`absolute inset-0 bg-linear-to-br ${oAccent}`} />
                            <img
                              src={oImg}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-resa-navy/80 via-transparent to-transparent" />
                            <div className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/10 text-2xl backdrop-blur-md">
                              {p.icon ?? '⚽'}
                            </div>
                          </div>

                          <div className="flex flex-1 flex-col p-6">
                            <h3 className="font-display text-base font-black text-resa-navy transition-colors group-hover:text-resa-red">
                              {oTitle}
                            </h3>
                            <p className="mt-2 flex-1 text-sm text-resa-text/65 line-clamp-2">
                              {oDesc}
                            </p>
                            <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-resa-red">
                              {t('seeDetail')}
                              <span className="transition-transform duration-300 group-hover:translate-x-1">
                                →
                              </span>
                            </div>
                          </div>
                        </article>
                      </Link>
                    </Reveal>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══ CTA FINAL ═══ */}
      <section className="relative overflow-hidden bg-resa-navy py-16 text-white md:py-20">
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
            <div className="mt-10">
              <Link
                href={`/contact?program=${program.slug}` as any}
                className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:bg-red-700 hover:scale-[1.03]"
              >
                {t('bookCta')}
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