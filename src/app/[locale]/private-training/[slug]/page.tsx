import { setRequestLocale } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
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

  const hasGroupSize =
    program.group_size_min && program.group_size_max;

  // Cascade image : image_url DB → image locale → gradient
  const heroImage = program.image_url ?? `/images/programs/training/${program.slug}.jpg`;
  const accent = program.accent ?? 'from-resa-navy to-resa-royal';

  return (
    <>
      {/* ─── HERO avec image en fond ─── */}
      <section className="relative overflow-hidden bg-resa-navy text-white">
        {/* Fallback gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />

        {/* Image en fond */}
        <img
          src={heroImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />

        {/* Overlay gradient navy pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-t from-resa-navy via-resa-navy/80 to-resa-navy/50" />
        <div className="absolute inset-0 bg-grid opacity-15" />

        {/* Halo décoratif */}
        <div className={`pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-3xl anim-float`} />

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          {/* Breadcrumb */}
          <div className="mb-6 text-[11px] text-white/50">
            <Link href="/private-training" className="transition hover:text-white">
              {t('backToList')}
            </Link>
            <span className="mx-2">/</span>
            <span className="font-bold text-white">{title}</span>
          </div>

          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            {/* Icône badge */}
            <div
              className={`grid h-24 w-24 shrink-0 place-items-center rounded-2xl border border-white/15 bg-white/10 text-5xl shadow-resa-lg backdrop-blur-md md:h-28 md:w-28 md:text-6xl`}
            >
              {program.icon ?? '⚽'}
            </div>

            {/* Titre + description */}
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

      {/* ─── DÉTAILS ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-8">
            {longDesc && (
              <Reveal variant="right">
                <article>
                  <div className="mb-4 h-1 w-12 bg-resa-red" />
                  <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
                    {t('aboutTitle')}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-resa-text/80">
                    {longDesc.split('\n\n').map((p: string, i: number) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </article>
              </Reveal>
            )}

            {highlights.length > 0 && (
              <Reveal variant="right" delay={100}>
                <article>
                  <div className="mb-4 h-1 w-12 bg-resa-royal" />
                  <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
                    {t('highlightsTitle')}
                  </h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {highlights.map((h, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-xl border border-black/5 bg-white p-4 shadow-resa"
                      >
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-resa-red text-[10px] font-bold text-white">
                          ✓
                        </span>
                        <span className="text-sm text-resa-text/80">{h}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            )}
          </div>

          <aside className="space-y-6">
            <Reveal variant="left">
              <article className="rounded-2xl border border-black/5 bg-white p-6 shadow-resa">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-resa-red">
                  {t('detailsTitle')}
                </h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {program.duration_min && (
                    <li className="flex items-center justify-between">
                      <span className="text-resa-text/60">⏱️ {t('duration')}</span>
                      <span className="font-bold text-resa-navy">
                        {program.duration_min} min
                      </span>
                    </li>
                  )}
                  {hasGroupSize && (
                    <li className="flex items-center justify-between">
                      <span className="text-resa-text/60">👥 {t('groupSize')}</span>
                      <span className="font-bold text-resa-navy">
                        {program.group_size_min === program.group_size_max
                          ? program.group_size_min
                          : `${program.group_size_min}–${program.group_size_max}`}
                      </span>
                    </li>
                  )}
                  {price && (
                    <li className="flex items-center justify-between">
                      <span className="text-resa-text/60">💰 {t('price')}</span>
                      <span className="font-bold text-resa-red">{price}</span>
                    </li>
                  )}
                  <li className="flex items-center justify-between">
                    <span className="text-resa-text/60">🌍 {t('region')}</span>
                    <span className="font-bold text-resa-navy uppercase">
                      {program.region === 'both' ? t('regionBoth') : program.region}
                    </span>
                  </li>
                </ul>
              </article>
            </Reveal>

            <Reveal variant="left" delay={100}>
              <article className="rounded-2xl bg-resa-navy p-6 text-white shadow-resa-lg">
                <h3 className="font-display text-xl font-black">
                  {t('bookTitle')}
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {t('bookText')}
                </p>
                <Link
                  href={`/contact?program=${program.slug}` as any}
                  className="group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-resa-red px-5 py-3 text-xs font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.03] hover:bg-red-700"
                >
                  {t('bookCta')}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <Link
                  href="/coaches"
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-wide text-white transition-all duration-300 hover:bg-white/10"
                >
                  {t('seeCoaches')}
                </Link>
              </article>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* ─── AUTRES PROGRAMMES ─── */}
      {others.length > 0 && (
        <section className="bg-resa-gray py-16 md:py-20">
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
                          {/* Image header */}
                          <div className="relative h-40 overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-br ${oAccent}`} />
                            <img
                              src={oImg}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-resa-navy/80 via-transparent to-transparent" />
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