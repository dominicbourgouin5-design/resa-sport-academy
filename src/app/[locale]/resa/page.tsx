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
    {
      key: 'Sport',
      accent: { from: '#0A1F44', to: '#1E3A8A' },
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
          <path d="M12 8l4 2v4l-4 2-4-2v-4z" />
        </svg>
      )
    },
    {
      key: 'Edu',
      accent: { from: '#1E3A8A', to: '#0A1F44' },
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
          <path d="M22 10v6M2 10l10-6 10 6-10 6z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      )
    },
    {
      key: 'Med',
      accent: { from: '#DC2626', to: '#7F1D1D' },
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
             strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-white">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          <path d="M12 8v6M9 11h6" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* ─── HERO ─── */}
      <ResaHero />

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MISSION & VISION — fond blanc                             */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-7xl overflow-hidden px-4 py-24 md:px-6 md:py-32">

        <div
          className="pointer-events-none absolute -right-32 top-1/2 -translate-y-1/2 opacity-[0.05]"
          aria-hidden
        >
          <svg width="500" height="500" viewBox="0 0 500 500" fill="none">
            <circle cx="250" cy="250" r="240" stroke="#0A1F44" strokeWidth="1" />
            <circle cx="250" cy="250" r="190" stroke="#0A1F44" strokeWidth="1" />
            <circle cx="250" cy="250" r="140" stroke="#0A1F44" strokeWidth="1" />
            <circle cx="250" cy="250" r="90"  stroke="#0A1F44" strokeWidth="1" />
            <circle cx="250" cy="250" r="40"  stroke="#0A1F44" strokeWidth="1" />
          </svg>
        </div>

        <div
          className="pointer-events-none absolute -left-32 -top-32 opacity-[0.04]"
          aria-hidden
        >
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
            <circle cx="200" cy="200" r="190" stroke="#1E3A8A" strokeWidth="1" />
            <circle cx="200" cy="200" r="130" stroke="#1E3A8A" strokeWidth="1" />
            <circle cx="200" cy="200" r="70"  stroke="#1E3A8A" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative grid gap-8 md:grid-cols-2 md:gap-10">
          <Reveal variant="right" className="h-full">
            <article className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-resa-navy p-10 text-white shadow-resa-lg md:p-12">
              <div className="absolute inset-0 bg-grid opacity-30" />
              <div className="absolute right-0 top-0 h-40 w-40 bg-halo opacity-60 anim-float" />
              <div className="relative flex flex-1 flex-col">
                <div className="mb-6 h-1 w-12 bg-resa-red" />
                <div className="mb-5 text-[10px] font-black uppercase tracking-[0.25em] text-white/50">
                  01
                </div>
                <h2 className="font-display text-3xl font-black md:text-4xl">
                  {t('missionTitle')}
                </h2>
                <p className="mt-6 flex-1 leading-relaxed text-white/75">
                  {t('missionText')}
                </p>
              </div>
            </article>
          </Reveal>

          <Reveal variant="left" delay={120} className="h-full">
            <article className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-linear-to-br from-white to-resa-gray/70 p-10 shadow-resa-lg md:p-12">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-resa-royal/5" />
              <div className="relative flex flex-1 flex-col">
                <div className="mb-6 h-1 w-12 bg-resa-royal" />
                <div className="mb-5 text-[10px] font-black uppercase tracking-[0.25em] text-resa-text/40">
                  02
                </div>
                <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                  {t('visionTitle')}
                </h2>
                <p className="mt-6 flex-1 leading-relaxed text-resa-text/75">
                  {t('visionText')}
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* VALEURS — fond gris clair                                 */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-resa-gray py-24 md:py-32">

        <div className="pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden>
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="resa-values-dots" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.2" fill="#0A1F44" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#resa-values-dots)" />
          </svg>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 top-0 opacity-[0.06]"
          aria-hidden
        >
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="h-20 w-full">
            <path
              d="M0,60 C240,120 480,0 720,60 C960,120 1200,0 1440,60 L1440,0 L0,0 Z"
              fill="#1E3A8A"
            />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-16 max-w-2xl">
              <div className="mb-4 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black text-resa-navy md:text-5xl">
                {t('valuesTitle')}
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.key} variant="up" delay={i * 100} className="h-full">
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white p-8 shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                  <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${v.accent}`} />
                  <div className="mb-6 text-4xl transition-transform duration-500 group-hover:scale-110">
                    {v.icon}
                  </div>
                  <h3 className="font-display text-xl font-black text-resa-navy transition-colors duration-300 group-hover:text-resa-red">
                    {t(`value${v.key}Title` as any)}
                  </h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-resa-text/65">
                    {t(`value${v.key}Text` as any)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ACTIVITÉS — fond DÉGRADÉ gris → blanc                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-linear-to-b from-resa-gray/60 via-resa-gray/20 to-white py-24 md:py-32">

        <div className="pointer-events-none absolute inset-0 opacity-[0.025]" aria-hidden>
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="resa-activities-lines"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <line x1="0" y1="0" x2="0" y2="20" stroke="#0A1F44" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#resa-activities-lines)" />
          </svg>
        </div>

        <div
          className="pointer-events-none absolute -right-24 -top-24 opacity-[0.05]"
          aria-hidden
        >
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
            <path
              d="M200 40 C300 40 380 100 380 200 C380 300 300 360 200 360 C100 360 20 300 20 200 C20 100 100 40 200 40 Z"
              stroke="#DC2626"
              strokeWidth="1.5"
              strokeDasharray="8 8"
            />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-16 max-w-2xl">
              <div className="mb-4 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black text-resa-navy md:text-5xl">
                {t('activitiesTitle')}
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-8 sm:grid-cols-2">
            {activities.map((a, i) => (
              <Reveal key={a.key} variant="up" delay={i * 120} className="h-full">
                <article className="group relative flex h-full gap-7 overflow-hidden rounded-2xl border border-black/5 bg-white p-8 shadow-resa transition-all duration-500 hover:-translate-y-1 hover:shadow-resa-lg">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-resa-navy to-resa-royal text-3xl text-white shadow-resa transition-transform duration-500 group-hover:scale-105">
                    {a.icon}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="mb-3 font-display text-3xl font-black leading-none text-resa-text/10">
                      {a.num}
                    </div>
                    <h3 className="font-display text-xl font-black text-resa-navy transition-colors duration-300 group-hover:text-resa-red">
                      {t(`activity${a.key}Title` as any)}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-resa-text/65">
                      {t(`activity${a.key}Text` as any)}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* PROGRAMME DE L'ANNÉE — fond navy                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="bg-resa-navy py-24 text-white md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-16 max-w-2xl">
              <div className="mb-4 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black md:text-5xl">
                {t('programTitle')}
              </h2>
              <p className="mt-5 text-base text-white/65 md:text-lg">
                {t('programSubtitle')}
              </p>
            </div>
          </Reveal>

          <div className="relative">
            <div className="absolute left-0 right-0 top-[42px] hidden h-px bg-white/10 md:block" />

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {quarters.map((q, i) => (
                <Reveal key={q.key} variant="up" delay={i * 120} className="h-full">
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${q.accent} ring-4 ring-resa-navy`} />
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                        {q.tag}
                      </div>
                    </div>
                    <div className="mt-8 flex flex-1 flex-col rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                      <div className="font-display text-base font-black text-white">
                        {t(`program${q.key}Title` as any)}
                      </div>
                      <p className="mt-3 flex-1 text-sm text-white/70">
                        {t(`program${q.key}Text` as any)}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ENCADREMENT — fond DÉGRADÉ blanc → gris                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-linear-to-b from-white via-resa-gray/30 to-resa-gray/60 py-24 md:py-32">

        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" aria-hidden>
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="resa-staff-grid" width="56" height="56" patternUnits="userSpaceOnUse">
                <path d="M 56 0 L 0 0 0 56" fill="none" stroke="#0A1F44" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#resa-staff-grid)" />
          </svg>
        </div>

        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-resa-royal/[0.06] blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[400px] w-[400px] rounded-full bg-resa-red/[0.05] blur-3xl" aria-hidden />

        <div className="pointer-events-none absolute right-0 top-1/3 opacity-30" aria-hidden>
          <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
            <line x1="0" y1="0" x2="220" y2="220" stroke="#DC2626" strokeWidth="0.5" opacity="0.3" />
            <line x1="30" y1="0" x2="220" y2="190" stroke="#DC2626" strokeWidth="0.5" opacity="0.2" />
            <line x1="60" y1="0" x2="220" y2="160" stroke="#DC2626" strokeWidth="0.5" opacity="0.15" />
          </svg>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">

          <Reveal variant="right">
            <div className="mb-20 flex flex-wrap items-end justify-between gap-8">
              <div className="max-w-2xl">
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-1 w-14 bg-resa-red" />
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-resa-red">
                    Staff
                  </div>
                </div>
                <h2 className="font-display text-3xl font-black text-resa-navy md:text-5xl">
                  {t('staffTitle')}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-resa-text/65 md:text-lg">
                  {t('staffSubtitle')}
                </p>
              </div>

              <div className="hidden items-baseline gap-3 md:flex">
                <div className="font-display text-6xl font-black leading-none text-resa-navy/10">
                  {String(staff.length).padStart(2, '0')}
                </div>
                <div className="pb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-resa-text/40">
                  Pôles<br />d'expertise
                </div>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-3">
            {staff.map((s, i) => {
              const num = String(i + 1).padStart(2, '0');

              return (
                <Reveal key={s.key} variant="up" delay={i * 140} className="h-full">
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-black/5 bg-white p-8 shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg md:p-9">

                    <div
                      className="absolute inset-x-0 top-0 h-1 transition-all duration-500 group-hover:h-1.5"
                      style={{
                        background: `linear-gradient(90deg, ${s.accent.from}, ${s.accent.to})`
                      }}
                    />

                    <div className="pointer-events-none absolute -right-3 -top-6 select-none font-display text-[120px] font-black leading-none text-resa-navy/[0.035] transition-all duration-500 group-hover:text-resa-navy/[0.06]">
                      {num}
                    </div>

                    <div
                      className="pointer-events-none absolute -right-16 bottom-0 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
                      style={{ background: s.accent.from }}
                    />

                    <div className="relative mb-7">
                      <div
                        className="grid h-16 w-16 place-items-center rounded-2xl shadow-resa transition-all duration-500 group-hover:scale-105 group-hover:rotate-3"
                        style={{
                          background: `linear-gradient(135deg, ${s.accent.from}, ${s.accent.to})`
                        }}
                      >
                        {s.icon}
                      </div>

                      <div className="absolute -bottom-1 left-4 h-1 w-8 rounded-full bg-resa-red/40 transition-all duration-500 group-hover:w-12 group-hover:bg-resa-red" />
                    </div>

                    <div className="relative flex-1">
                      <h3 className="font-display text-xl font-black text-resa-navy md:text-2xl">
                        {t(`staff${s.key}Title` as any)}
                      </h3>
                      <p className="mt-4 text-sm leading-relaxed text-resa-text/65">
                        {t(`staff${s.key}Text` as any)}
                      </p>
                    </div>

                    <div className="relative mt-8 flex items-center gap-2 border-t border-black/5 pt-5">
                      <span className="h-1.5 w-1.5 rounded-full bg-resa-red opacity-40 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="h-px flex-1 bg-black/5 transition-colors duration-500 group-hover:bg-resa-red/20" />
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-resa-text/30">
                        Pôle {num}
                      </span>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* CTA IMMERSIF — fond navy, version resserrée              */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-fade-navy py-20 text-white md:py-28">

        <div className="pointer-events-none absolute left-1/2 top-1/4 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-resa-red/15 blur-3xl anim-float" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-resa-royal/20 blur-3xl anim-float delay-500" />
        <div className="pointer-events-none absolute -right-32 top-0 h-[400px] w-[400px] rounded-full bg-resa-red/10 blur-3xl anim-float" />

        <div className="pointer-events-none absolute inset-0 opacity-[0.05]" aria-hidden>
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="resa-cta-grid" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#FFFFFF" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#resa-cta-grid)" />
          </svg>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-dots opacity-30" />

        <div className="pointer-events-none absolute -right-40 -bottom-40 opacity-[0.08]" aria-hidden>
          <svg width="700" height="700" viewBox="0 0 700 700" fill="none">
            <circle cx="350" cy="350" r="340" stroke="#DC2626" strokeWidth="1" />
            <circle cx="350" cy="350" r="280" stroke="#DC2626" strokeWidth="1" />
            <circle cx="350" cy="350" r="220" stroke="#DC2626" strokeWidth="1" />
            <circle cx="350" cy="350" r="160" stroke="#DC2626" strokeWidth="1" />
          </svg>
        </div>

        <div className="pointer-events-none absolute -left-20 -top-20 opacity-[0.06]" aria-hidden>
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
            <path
              d="M200 30 C320 30 380 120 380 200 C380 300 280 380 180 370 C80 360 20 280 30 180 C40 80 80 30 200 30 Z"
              stroke="#FFFFFF"
              strokeWidth="1"
              strokeDasharray="6 6"
            />
          </svg>
        </div>

        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">

          <Reveal variant="zoom">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-resa-red anim-glow" />
              Prochaine étape
            </div>
          </Reveal>

          <Reveal variant="zoom" delay={80}>
            <h2 className="font-display text-4xl font-black leading-[1.05] md:text-6xl lg:text-7xl">
              {t('joinTitle')}
            </h2>
          </Reveal>

          <Reveal variant="up" delay={180}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
              {t('joinText')}
            </p>
          </Reveal>

          <Reveal variant="up" delay={300}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href={'/inscriptions?mode=school#form' as any}
                scroll={false}
                className="group inline-flex items-center gap-3 rounded-full bg-resa-red px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:bg-red-700 hover:scale-[1.05] hover:shadow-[0_20px_60px_rgba(220,38,38,0.4)]"
              >
                {t('joinSchools')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href={'/inscriptions?mode=individual#form' as any}
                scroll={false}
                className="group inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white backdrop-blur transition-all duration-300 hover:bg-white hover:text-resa-navy hover:scale-[1.05]"
              >
                {t('joinScouting')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href={'/sponsors#devenir-partenaire' as any}
                scroll={false}
                className="group inline-flex items-center gap-3 rounded-full border border-white/25 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white backdrop-blur transition-all duration-300 hover:bg-white hover:text-resa-navy hover:scale-[1.05]"
              >
                {t('joinPartners')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </Reveal>

          <Reveal variant="up" delay={420}>
            <div className="mx-auto mt-12 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-white/20" />
              <div className="h-1.5 w-1.5 rounded-full bg-resa-red" />
              <div className="h-px w-12 bg-white/20" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}