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

      {/* ─── 3 RAISONS ─── */}
      <section className="bg-resa-gray py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-12 max-w-2xl">
              <div className="mb-3 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                {t('whyTitle')}
              </h2>
              <p className="mt-3 text-base text-resa-text/70">
                {t('whySubtitle')}
              </p>
            </div>
          </Reveal>

          <div className="-mx-3 flex flex-wrap">
            {reasons.map((r, i) => (
              <div key={r.key} className="w-full px-3 pb-6 md:w-1/3">
                <Reveal variant="up" delay={i * 100}>
                  <article className="flex h-full gap-5 rounded-2xl border border-black/5 bg-white p-7 shadow-resa transition-all duration-500 hover:-translate-y-1 hover:shadow-resa-lg">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-resa-navy to-resa-royal text-2xl text-white">
                      {r.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-black text-resa-navy">
                        {t(`why${r.key}Title` as any)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-resa-text/65">
                        {t(`why${r.key}Text` as any)}
                      </p>
                    </div>
                  </article>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7 PROGRAMMES (depuis la DB → page détail) ─── */}
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

        {programs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 p-12 text-center text-resa-text/50">
            {t('programsEmpty')}
          </div>
        ) : (
          <div className="-mx-3 flex flex-wrap">
            {programs.map((p, i) => {
              const title = isFr ? p.title_fr : p.title_en;
              const description = isFr ? p.description_fr : p.description_en;

              return (
                <div key={p.id} className="w-full px-3 pb-6 sm:w-1/2 lg:w-1/3">
                  <Reveal variant="up" delay={i * 80}>
                    <Link
                      href={`/private-training/${p.slug}` as any}
                      className="group block h-full"
                    >
                      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                        <div
                          className={`h-1.5 w-full bg-gradient-to-r ${
                            p.accent ?? 'from-resa-navy to-resa-royal'
                          }`}
                        />

                        <div className="relative flex h-32 items-center justify-center overflow-hidden bg-resa-gray">
                          <div className="absolute inset-0 bg-grid opacity-40" />
                          <div className="pointer-events-none absolute inset-0 bg-halo opacity-30" />
                          <div className="relative text-5xl transition-transform duration-500 group-hover:scale-110">
                            {p.icon ?? '⚽'}
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col p-6">
                          <h3 className="font-display text-lg font-black text-resa-navy transition-colors duration-300 group-hover:text-resa-red">
                            {title}
                          </h3>
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-resa-text/65">
                            {description}
                          </p>
                          <div className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-resa-red transition-all duration-300 group-hover:gap-3">
                            {t('programCta')}
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
        )}
      </section>

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <section className="bg-fade-navy py-16 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-12 max-w-2xl">
              <div className="mb-3 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black md:text-4xl">
                {t('howTitle')}
              </h2>
              <p className="mt-3 text-base text-white/65">
                {t('howSubtitle')}
              </p>
            </div>
          </Reveal>

          <div className="-mx-3 flex flex-wrap">
            {steps.map((s, i) => (
              <div key={s.n} className="w-full px-3 pb-8 sm:w-1/2 lg:w-1/4">
                <Reveal variant="up" delay={i * 100}>
                  <div className="relative">
                    <div className="font-display text-5xl font-black text-white/10">
                      {s.n}
                    </div>
                    <div className="mt-3 font-display text-lg font-black text-white">
                      {t(`how${s.key}Title` as any)}
                    </div>
                    <p className="mt-2 text-sm text-white/65">
                      {t(`how${s.key}Text` as any)}
                    </p>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COACHS VEDETTES (depuis la DB) ─── */}
      {coaches.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
          <Reveal variant="right">
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
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

          <div className="-mx-3 flex flex-wrap">
            {coaches.map((c, i) => {
              const role = isFr ? c.role_fr : c.role_en;
              const initials =
                c.initials ?? c.name?.slice(0, 2).toUpperCase() ?? '';

              return (
                <div key={c.id} className="w-full px-3 pb-6 md:w-1/3">
                  <Reveal variant="up" delay={i * 100}>
                    <Link
                      href={`/coaches/${c.slug}` as any}
                      className="group block h-full"
                    >
                      <article className="flex h-full flex-col items-center gap-4 rounded-2xl border border-black/5 bg-white p-7 text-center shadow-resa transition-all duration-500 hover:-translate-y-1 hover:shadow-resa-lg">
                        {c.photo_url ? (
                          <img
                            src={c.photo_url}
                            alt={c.name}
                            className="h-20 w-20 rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-resa-navy to-resa-royal font-display text-2xl font-black text-white transition-transform duration-500 group-hover:scale-105">
                            {initials}
                          </div>
                        )}
                        {c.flag && <div className="text-3xl">{c.flag}</div>}
                        <div>
                          <div className="font-display text-lg font-black text-resa-navy transition-colors group-hover:text-resa-red">
                            {c.name}
                          </div>
                          {role && (
                            <div className="mt-1 text-xs font-bold uppercase tracking-widest text-resa-text/50">
                              {role}
                            </div>
                          )}
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

      {/* ─── CTA FINAL ─── */}
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
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:scale-[1.04] hover:bg-red-700"
              >
                {t('ctaBook')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/coaches"
                className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.04] hover:bg-white hover:text-resa-navy"
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