import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import ResaHero from './ResaHero';

export default async function ResaPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ResaContent />;
}

function ResaContent() {
  const t = useTranslations('resa');

  const values = [
    { key: 'Respect',    icon: '🤝', accent: 'from-resa-navy to-resa-royal' },
    { key: 'Discipline', icon: '⏱️', accent: 'from-resa-royal to-resa-navy' },
    { key: 'Team',       icon: '👥', accent: 'from-resa-red to-red-800' },
    { key: 'Excellence', icon: '🏆', accent: 'from-amber-500 to-amber-700' }
  ];

  const activities = [
    { key: 'Academy',  icon: '⚽', num: '01' },
    { key: 'League',   icon: '🏟️', num: '02' },
    { key: 'Scouting', icon: '🔍', num: '03' },
    { key: 'Training', icon: '🎓', num: '04' }
  ];

  const quarters = [
    { key: 'Q1', tag: 'Saison', accent: 'bg-resa-royal' },
    { key: 'Q2', tag: 'Préparation', accent: 'bg-resa-red' },
    { key: 'Q3', tag: 'Compétition', accent: 'bg-resa-navy' },
    { key: 'Q4', tag: 'Finales', accent: 'bg-amber-500' }
  ];

  const staff = [
    { key: 'Sport', icon: '⚽' },
    { key: 'Edu',   icon: '📚' },
    { key: 'Med',   icon: '🩺' }
  ];

  return (
    <>
       {/* ─── HERO ─── */}
      <ResaHero />

      {/* ─── MISSION & VISION ─── */}
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
                  {t('visionTitle')}
                </h2>
                <p className="mt-4 leading-relaxed text-resa-text/75">
                  {t('visionText')}
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ─── VALEURS ─── */}
      <section className="bg-resa-gray py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-12 max-w-2xl">
              <div className="mb-3 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                {t('valuesTitle')}
              </h2>
            </div>
          </Reveal>

          <div className="-mx-3 flex flex-wrap">
            {values.map((v, i) => (
              <div key={v.key} className="w-full px-3 pb-6 sm:w-1/2 lg:w-1/4">
                <Reveal variant="up" delay={i * 100}>
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white p-7 shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${v.accent}`} />
                    <div className="mb-5 text-4xl transition-transform duration-500 group-hover:scale-110">
                      {v.icon}
                    </div>
                    <h3 className="font-display text-xl font-black text-resa-navy transition-colors duration-300 group-hover:text-resa-red">
                      {t(`value${v.key}Title` as any)}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-resa-text/65">
                      {t(`value${v.key}Text` as any)}
                    </p>
                  </article>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ACTIVITÉS ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <Reveal variant="right">
          <div className="mb-12 max-w-2xl">
            <div className="mb-3 h-1 w-14 bg-resa-red" />
            <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
              {t('activitiesTitle')}
            </h2>
          </div>
        </Reveal>

        <div className="-mx-3 flex flex-wrap">
          {activities.map((a, i) => (
            <div key={a.key} className="w-full px-3 pb-6 sm:w-1/2">
              <Reveal variant="up" delay={i * 120}>
                <article className="group relative flex h-full gap-6 overflow-hidden rounded-2xl border border-black/5 bg-white p-7 shadow-resa transition-all duration-500 hover:-translate-y-1 hover:shadow-resa-lg">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-resa-navy to-resa-royal text-3xl text-white shadow-resa transition-transform duration-500 group-hover:scale-105">
                    {a.icon}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 font-display text-3xl font-black leading-none text-resa-text/10">
                      {a.num}
                    </div>
                    <h3 className="font-display text-xl font-black text-resa-navy transition-colors duration-300 group-hover:text-resa-red">
                      {t(`activity${a.key}Title` as any)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-resa-text/65">
                      {t(`activity${a.key}Text` as any)}
                    </p>
                  </div>
                </article>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PROGRAMME DE L'ANNÉE (timeline) ─── */}
      <section className="bg-resa-navy py-16 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-12 max-w-2xl">
              <div className="mb-3 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black md:text-4xl">
                {t('programTitle')}
              </h2>
              <p className="mt-3 text-base text-white/65">
                {t('programSubtitle')}
              </p>
            </div>
          </Reveal>

          <div className="relative">
            {/* Ligne horizontale (desktop) */}
            <div className="absolute left-0 right-0 top-[42px] hidden h-px bg-white/10 md:block" />

            <div className="-mx-3 flex flex-wrap">
              {quarters.map((q, i) => (
                <div key={q.key} className="w-full px-3 pb-8 sm:w-1/2 lg:w-1/4">
                  <Reveal variant="up" delay={i * 120}>
                    <div className="relative">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${q.accent} ring-4 ring-resa-navy`} />
                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                          {q.tag}
                        </div>
                      </div>
                      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                        <div className="font-display text-base font-black text-white">
                          {t(`program${q.key}Title` as any)}
                        </div>
                        <p className="mt-2 text-sm text-white/70">
                          {t(`program${q.key}Text` as any)}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── ENCADREMENT ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <Reveal variant="right">
          <div className="mb-12 max-w-2xl">
            <div className="mb-3 h-1 w-14 bg-resa-royal" />
            <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
              {t('staffTitle')}
            </h2>
            <p className="mt-3 text-base text-resa-text/65">
              {t('staffSubtitle')}
            </p>
          </div>
        </Reveal>

        <div className="-mx-3 flex flex-wrap">
          {staff.map((s, i) => (
            <div key={s.key} className="w-full px-3 pb-6 md:w-1/3">
              <Reveal variant="up" delay={i * 120}>
                <article className="group flex h-full flex-col rounded-2xl border border-black/5 bg-white p-7 shadow-resa transition-all duration-500 hover:-translate-y-1 hover:shadow-resa-lg">
                  <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-resa-gray text-2xl">
                    {s.icon}
                  </div>
                  <h3 className="font-display text-lg font-black text-resa-navy">
                    {t(`staff${s.key}Title` as any)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-resa-text/65">
                    {t(`staff${s.key}Text` as any)}
                  </p>
                </article>
              </Reveal>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative overflow-hidden bg-fade-navy py-16 text-white md:py-20">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-resa-red/10 blur-3xl anim-float" />

        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
          <Reveal variant="zoom">
            <h2 className="font-display text-3xl font-black md:text-5xl">
              {t('joinTitle')}
            </h2>
          </Reveal>
          <Reveal variant="up" delay={120}>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/70 md:text-lg">
              {t('joinText')}
            </p>
          </Reveal>
          <Reveal variant="up" delay={240}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/inscriptions"
                className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:bg-red-700 hover:scale-[1.03]"
              >
                {t('joinSchools')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/inscriptions"
                className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white backdrop-blur transition-all duration-300 hover:bg-white hover:text-resa-navy hover:scale-[1.03]"
              >
                {t('joinScouting')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/sponsors"
                className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white backdrop-blur transition-all duration-300 hover:bg-white hover:text-resa-navy hover:scale-[1.03]"
              >
                {t('joinPartners')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}