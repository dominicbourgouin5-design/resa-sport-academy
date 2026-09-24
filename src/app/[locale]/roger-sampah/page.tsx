import { setRequestLocale } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import PlayerPathway from '@/components/ui/PlayerPathway';
import {
  getCoachBySlug,
  getCoachTestimonials,
  getCoachMedia,
  getTrainingPrograms
} from '@/lib/queries';

export default async function RogerSampahPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const coach = await getCoachBySlug('roger-sampah');
  if (!coach) notFound();

  const [testimonials, media, programs] = await Promise.all([
    getCoachTestimonials(coach.id),
    getCoachMedia(coach.id),
    getTrainingPrograms()
  ]);

  return (
    <RogerContent
      coach={coach}
      testimonials={testimonials}
      media={media}
      programs={programs.slice(0, 3)}
    />
  );
}

function RogerContent({
  coach,
  testimonials,
  media,
  programs
}: {
  coach: any;
  testimonials: any[];
  media: any[];
  programs: any[];
}) {
  const t = useTranslations('roger');
  const locale = useLocale();
  const isFr = locale === 'fr';

  const role        = isFr ? coach.role_fr : coach.role_en;
  const bioLong     = isFr ? coach.bio_long_fr : coach.bio_long_en;
  const bioShort    = isFr ? coach.bio_short_fr : coach.bio_short_en;
  const philosophy  = isFr ? coach.philosophy_fr : coach.philosophy_en;
  const specialties: string[] = (isFr ? coach.specialties_fr : coach.specialties_en) ?? [];
  const career: any[] = Array.isArray(coach.career) ? coach.career : [];

  // Pathway steps (repris du site)
  const pathwaySteps = [
    { n: '01', icon: '🌱', title: t('pathwayLearnTitle'),      text: t('pathwayLearnText') },
    { n: '02', icon: '⚽', title: t('pathwayDevelopTitle'),    text: t('pathwayDevelopText') },
    { n: '03', icon: '🏆', title: t('pathwayCompeteTitle'),    text: t('pathwayCompeteText') },
    { n: '04', icon: '🔍', title: t('pathwayIdentifiedTitle'), text: t('pathwayIdentifiedText') },
    { n: '05', icon: '🚀', title: t('pathwayNextTitle'),       text: t('pathwayNextText') }
  ];

  return (
    <>
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-resa-navy text-white">
        <div className="absolute inset-0">
          {coach.cover_url ? (
            <img
              src={coach.cover_url}
              alt=""
              className="h-full w-full object-cover opacity-40"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-resa-navy via-resa-navy-deep to-black" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-resa-navy via-resa-navy/80 to-resa-navy/40" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-resa-red/15 blur-3xl anim-float" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          {/* Breadcrumb */}
          <div className="mb-6 text-[11px] text-white/50">
            <Link href="/coaches" className="transition hover:text-white">
              {t('allCoaches')}
            </Link>
            <span className="mx-2">/</span>
            <span className="font-bold text-white">Roger Sampah</span>
          </div>

          <div className="flex flex-col items-center gap-10 md:flex-row md:items-end md:gap-12">
            {/* Photo */}
            <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-full border-4 border-white/10 bg-gradient-to-br from-resa-navy to-resa-royal shadow-resa-lg md:h-56 md:w-56">
              {coach.photo_url ? (
                <img
                  src={coach.photo_url}
                  alt={coach.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full w-full place-items-center font-display text-6xl font-black text-white md:text-7xl">
                  {coach.initials ?? 'RS'}
                </div>
              )}
            </div>

            {/* Identité */}
            <div className="flex-1 text-center md:text-left">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                ★ {t('founderBadge')}
              </span>

              <h1 className="font-display text-5xl font-black leading-none tracking-tight md:text-6xl lg:text-7xl">
                {coach.name}
              </h1>

              {role && (
                <div className="mt-3 text-sm font-bold uppercase tracking-widest text-resa-red md:text-base">
                  {role}
                </div>
              )}

              <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-white/70 md:justify-start">
                {coach.location && <span>📍 {coach.location}</span>}
                {coach.experience_years && (
                  <span>⏱️ {coach.experience_years} {t('experienceYears')}</span>
                )}
              </div>

              {/* Spécialités */}
              {specialties.length > 0 && (
                <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                  {specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/85 backdrop-blur"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
                <Link
                  href={'/contact?program=1-on-1&coach=roger-sampah' as any}
                  className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:scale-[1.03] hover:bg-red-700"
                >
                  {t('bookSession')}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href="#media"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white backdrop-blur transition-all duration-300 hover:scale-[1.03] hover:bg-white hover:text-resa-navy"
                >
                  {t('seeMedia')}
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 gradient-line" />
      </section>

      {/* ═══════════ CITATION / PHILOSOPHIE ═══════════ */}
      {philosophy && (
        <section className="bg-resa-gray py-14 md:py-20">
          <div className="mx-auto max-w-4xl px-4 md:px-6">
            <Reveal variant="zoom">
              <div className="relative">
                <div className="absolute -left-2 -top-4 font-display text-8xl font-black leading-none text-resa-red/15 md:-left-6 md:-top-6 md:text-9xl">
                  &ldquo;
                </div>
                <blockquote className="relative border-l-4 border-resa-red bg-white p-8 text-xl italic leading-relaxed text-resa-text/85 shadow-resa-lg md:p-12 md:text-2xl">
                  {philosophy}
                  <footer className="mt-6 text-sm font-bold uppercase not-italic tracking-widest text-resa-navy">
                    — Roger Sampah
                  </footer>
                </blockquote>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══════════ BIO ═══════════ */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          {/* Bio */}
          <Reveal variant="right">
            <article>
              <div className="mb-3 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                {t('bioTitle')}
              </h2>
              <div className="prose-article mt-6">
                {(bioLong || bioShort || '').split('\n\n').map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </article>
          </Reveal>

          {/* Sidebar infos */}
          <aside className="space-y-6">
            {coach.certifications?.length > 0 && (
              <Reveal variant="left">
                <article className="rounded-2xl border border-black/5 bg-white p-6 shadow-resa">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-resa-red">
                    {t('certificationsTitle')}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {coach.certifications.map((c: string) => (
                      <li key={c} className="flex gap-2 text-sm text-resa-text/80">
                        <span className="text-resa-red">✓</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            )}

            {coach.languages?.length > 0 && (
              <Reveal variant="left" delay={100}>
                <article className="rounded-2xl border border-black/5 bg-white p-6 shadow-resa">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-resa-red">
                    {t('languagesTitle')}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {coach.languages.map((l: string) => (
                      <span
                        key={l}
                        className="rounded-full bg-resa-gray px-3 py-1 text-xs font-bold text-resa-text/70"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                </article>
              </Reveal>
            )}

            <Reveal variant="left" delay={200}>
              <article className="rounded-2xl bg-resa-navy p-6 text-white shadow-resa-lg">
                <h3 className="font-display text-xl font-black">{t('bookTitle')}</h3>
                <p className="mt-2 text-sm text-white/70">{t('bookText')}</p>
                <Link
                  href={'/contact?program=1-on-1&coach=roger-sampah' as any}
                  className="group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-resa-red px-5 py-3 text-xs font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.03] hover:bg-red-700"
                >
                  {t('bookSession')}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </article>
            </Reveal>
          </aside>
        </div>
      </section>

      {/* ═══════════ PARCOURS (timeline) ═══════════ */}
      {career.length > 0 && (
        <section className="bg-fade-navy py-16 text-white md:py-20">
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            <Reveal variant="right">
              <div className="mb-12 max-w-2xl">
                <div className="mb-3 h-1 w-14 bg-resa-red" />
                <h2 className="font-display text-3xl font-black md:text-4xl">
                  {t('careerTitle')}
                </h2>
              </div>
            </Reveal>

            <ol className="relative space-y-6 border-l-2 border-white/10 pl-8 md:space-y-8">
              {career.map((c, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[41px] top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-resa-red bg-resa-navy text-[10px] font-black text-white">
                    {i + 1}
                  </span>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-resa-red">
                      {c.period}
                    </div>
                    <div className="mt-1 font-display text-xl font-black text-white">
                      {isFr ? c.role_fr : c.role_en}
                    </div>
                    {c.club && (
                      <div className="mt-1 text-sm text-white/60">{c.club}</div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ═══════════ PROGRAMMES SIGNATURE ═══════════ */}
      {programs.length > 0 && (
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
            {programs.map((p, i) => {
              const title = isFr ? p.title_fr : p.title_en;
              const description = isFr ? p.description_fr : p.description_en;
              return (
                <div key={p.id} className="w-full px-3 pb-6 md:w-1/3">
                  <Reveal variant="up" delay={i * 100}>
                    <Link
                      href={`/private-training/${p.slug}` as any}
                      className="group block h-full"
                    >
                      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                        <div
                          className={`h-1.5 w-full bg-gradient-to-r ${
                            p.accent ?? 'from-resa-navy to-resa-royal'
                          }`}
                        />
                        <div className="flex flex-1 flex-col p-6">
                          <div className="mb-3 text-4xl">{p.icon ?? '⚽'}</div>
                          <h3 className="font-display text-lg font-black text-resa-navy transition-colors group-hover:text-resa-red">
                            {title}
                          </h3>
                          <p className="mt-2 flex-1 text-sm text-resa-text/65 line-clamp-2">
                            {description}
                          </p>
                          <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-resa-red">
                            {t('seeProgram')}
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
        </section>
      )}

      {/* ═══════════ PLAYER PATHWAY ═══════════ */}
      <section className="bg-resa-gray py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-12 max-w-2xl">
              <div className="mb-3 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                {t('pathwayTitle')}
              </h2>
              <p className="mt-3 text-base text-resa-text/70">
                {t('pathwaySubtitle')}
              </p>
            </div>
          </Reveal>

          <div className="rounded-3xl bg-fade-navy p-8 text-white shadow-resa-lg md:p-12">
            <PlayerPathway steps={pathwaySteps} />
          </div>
        </div>
      </section>

      {/* ═══════════ TÉMOIGNAGES ═══════════ */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <Reveal variant="right">
            <div className="mb-12 max-w-2xl">
              <div className="mb-3 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                {t('testimonialsTitle')}
              </h2>
              <p className="mt-3 text-base text-resa-text/70">
                {t('testimonialsSubtitle')}
              </p>
            </div>
          </Reveal>

          <div className="-mx-3 flex flex-wrap">
            {testimonials.map((tm, i) => {
              const role = isFr ? tm.author_role_fr : tm.author_role_en;
              const content = isFr ? tm.content_fr : (tm.content_en || tm.content_fr);
              return (
                <div
                  key={tm.id}
                  className="w-full px-3 pb-6 sm:w-1/2 lg:w-1/3"
                >
                  <Reveal variant="up" delay={i * 100}>
                    <article className="relative flex h-full flex-col rounded-2xl border border-black/5 bg-white p-7 shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                      {/* Étoiles */}
                      {tm.rating && (
                        <div className="mb-4 flex gap-0.5 text-amber-500">
                          {Array.from({ length: tm.rating }).map((_, k) => (
                            <span key={k}>★</span>
                          ))}
                        </div>
                      )}

                      <blockquote className="flex-1 text-sm leading-relaxed text-resa-text/80">
                        &ldquo;{content}&rdquo;
                      </blockquote>

                      <div className="mt-5 flex items-center gap-3 border-t border-black/5 pt-5">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-resa-navy to-resa-royal font-display text-sm font-black text-white">
                          {tm.author_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-resa-navy">
                            {tm.author_name}
                          </div>
                          {role && (
                            <div className="truncate text-[10px] uppercase tracking-wider text-resa-text/50">
                              {role}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════ MÉDIAS (photos + vidéos) ═══════════ */}
      {media.length > 0 && (
        <section id="media" className="bg-resa-gray py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <Reveal variant="right">
              <div className="mb-12 max-w-2xl">
                <div className="mb-3 h-1 w-14 bg-resa-red" />
                <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                  {t('mediaTitle')}
                </h2>
                <p className="mt-3 text-base text-resa-text/70">
                  {t('mediaSubtitle')}
                </p>
              </div>
            </Reveal>

            <div className="grid gap-5 md:grid-cols-3">
              {media.map((m, i) => {
                const caption = isFr ? m.caption_fr : (m.caption_en || m.caption_fr);
                const isVideo = m.media_type === 'video';
                return (
                  <Reveal key={m.id} variant="up" delay={i * 80}>
                    <article className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                      <div className="relative aspect-[4/3] overflow-hidden bg-resa-navy">
                        {isVideo ? (
                          <div className="grid h-full w-full place-items-center">
                            <div className="relative h-full w-full">
                              {m.thumbnail_url ? (
                                <img
                                  src={m.thumbnail_url}
                                  alt={caption ?? ''}
                                  className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
                                />
                              ) : (
                                <div className="h-full w-full bg-gradient-to-br from-resa-navy to-resa-royal" />
                              )}
                              {/* Play button */}
                              <div className="absolute inset-0 grid place-items-center">
                                <div className="grid h-14 w-14 place-items-center rounded-full bg-resa-red text-2xl text-white shadow-resa-lg transition-transform duration-500 group-hover:scale-110">
                                  ▶
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={m.url}
                            alt={caption ?? ''}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        )}

                        {/* Badge type */}
                        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
                          {isVideo ? '🎥 Vidéo' : '📷 Photo'}
                        </div>
                      </div>

                      {caption && (
                        <div className="p-4">
                          <p className="text-sm font-semibold text-resa-navy">
                            {caption}
                          </p>
                        </div>
                      )}
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="relative overflow-hidden bg-resa-navy py-20 text-white md:py-28">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-resa-red/15 blur-3xl anim-float" />

        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
          <Reveal variant="zoom">
            <h2 className="font-display text-4xl font-black md:text-6xl">
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
                href={'/contact?program=1-on-1&coach=roger-sampah' as any}
                className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:scale-[1.04] hover:bg-red-700"
              >
                {t('bookSession')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/coaches"
                className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.04] hover:bg-white hover:text-resa-navy"
              >
                {t('seeAllCoaches')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}