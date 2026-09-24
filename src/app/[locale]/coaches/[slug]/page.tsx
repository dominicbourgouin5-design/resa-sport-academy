import { setRequestLocale } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import { getCoachBySlug } from '@/lib/queries';

export default async function CoachProfilePage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const coach = await getCoachBySlug(slug);
  if (!coach) notFound();
  return <CoachProfile coach={coach} />;
}

function CoachProfile({ coach }: { coach: any }) {
  const t = useTranslations('coachProfile');
  const locale = useLocale();
  const isFr = locale === 'fr';

  const role        = isFr ? coach.role_fr : coach.role_en;
  const specialties = (isFr ? coach.specialties_fr : coach.specialties_en) ?? [];
  const bioLong     = isFr ? coach.bio_long_fr : coach.bio_long_en;
  const bioShort    = isFr ? coach.bio_short_fr : coach.bio_short_en;
  const philosophy  = isFr ? coach.philosophy_fr : coach.philosophy_en;
  const nationality = isFr ? coach.nationality_fr : coach.nationality_en;
  const career: any[] = Array.isArray(coach.career) ? coach.career : [];

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-resa-navy text-white">
        <div className="absolute inset-0">
          {coach.cover_url ? (
            <img src={coach.cover_url} alt="" className="h-full w-full object-cover opacity-40" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-resa-navy via-resa-navy-deep to-black" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-resa-navy via-resa-navy/70 to-resa-navy/40" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-resa-red/10 blur-3xl anim-float" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          {/* Breadcrumb */}
          <div className="mb-6 text-[11px] text-white/50">
            <Link href="/coaches" className="transition hover:text-white">
              {t('backToList')}
            </Link>
            <span className="mx-2">/</span>
            <span className="font-bold text-white">{coach.name}</span>
          </div>

          <div className="flex flex-col items-center gap-8 md:flex-row md:items-end">
            {/* Photo */}
            <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full border-4 border-white/10 bg-gradient-to-br from-resa-navy to-resa-royal shadow-resa-lg md:h-48 md:w-48">
              {coach.photo_url ? (
                <img src={coach.photo_url} alt={coach.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center font-display text-6xl font-black text-white">
                  {coach.initials ?? coach.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Identité */}
            <div className="flex-1 text-center md:text-left">
              {coach.is_featured && (
                <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                  ★ {t('founderBadge')}
                </span>
              )}
              <h1 className="font-display text-4xl font-black leading-tight md:text-5xl">
                {coach.name}
              </h1>
              {role && (
                <div className="mt-2 text-sm font-bold uppercase tracking-widest text-resa-red">
                  {role}
                </div>
              )}
              <div className="mt-3 flex flex-wrap justify-center gap-4 text-sm text-white/70 md:justify-start">
                {coach.location && <span>📍 {coach.location}</span>}
                {coach.experience_years && (
                  <span>⏱️ {coach.experience_years} {t('experienceYears')}</span>
                )}
                {nationality && <span>🌍 {nationality}</span>}
              </div>

              {/* Spécialités */}
              {specialties.length > 0 && (
                <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                  {specialties.map((s: string) => (
                    <span
                      key={s}
                      className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/80 backdrop-blur"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                <Link
                  href={`/contact?coach=${coach.slug}` as any}
                  className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:scale-[1.03] hover:bg-red-700"
                >
                  {t('bookCta')}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 gradient-line" />
      </section>

      {/* ─── BIO + INFOS ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          {/* Colonne principale */}
          <div className="space-y-8">
            {(bioLong || bioShort) && (
              <Reveal variant="right">
                <article>
                  <div className="mb-4 h-1 w-12 bg-resa-red" />
                  <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
                    {t('aboutTitle')}
                  </h2>
                  <div className="mt-4 space-y-4 text-base leading-relaxed text-resa-text/80">
                    {(bioLong || bioShort).split('\n\n').map((p: string, i: number) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </article>
              </Reveal>
            )}

            {philosophy && (
              <Reveal variant="right" delay={100}>
                <article>
                  <div className="mb-4 h-1 w-12 bg-resa-royal" />
                  <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
                    {t('philosophyTitle')}
                  </h2>
                  <blockquote className="mt-4 border-l-4 border-resa-red bg-resa-gray p-6 text-base italic leading-relaxed text-resa-text/80">
                    {philosophy}
                  </blockquote>
                </article>
              </Reveal>
            )}

            {career.length > 0 && (
              <Reveal variant="right" delay={200}>
                <article>
                  <div className="mb-4 h-1 w-12 bg-resa-red" />
                  <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
                    {t('careerTitle')}
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {career.map((c, i) => (
                      <li
                        key={i}
                        className="flex gap-4 rounded-xl border border-black/5 bg-white p-4 shadow-resa"
                      >
                        <div className="w-28 shrink-0 text-xs font-bold uppercase tracking-widest text-resa-red">
                          {c.period}
                        </div>
                        <div>
                          <div className="font-display text-base font-black text-resa-navy">
                            {isFr ? c.role_fr : c.role_en}
                          </div>
                          {c.club && (
                            <div className="text-sm text-resa-text/60">{c.club}</div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            )}
          </div>

          {/* Sidebar */}
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
                <h3 className="font-display text-xl font-black">
                  {t('bookTitle')}
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  {t('bookText')}
                </p>
                <Link
                  href={`/contact?coach=${coach.slug}` as any}
                  className="group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-resa-red px-5 py-3 text-xs font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.03] hover:bg-red-700"
                >
                  {t('bookCta')}
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </article>
            </Reveal>
          </aside>
        </div>
      </section>
    </>
  );
}