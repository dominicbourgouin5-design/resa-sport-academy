import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import { getGlobalStats } from '@/lib/queries';

export default async function LiguePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const stats = await getGlobalStats();
  return <LigueContent stats={stats} />;
}

function LigueContent({ stats }: { stats: any }) {
  const t = useTranslations('ligue');

    // Chiffres clés — DYNAMIQUES
  const statItems = [
    { value: stats.schools,    label: t('statSchools') },
    { value: stats.teams,      label: t('statTeams') },
    { value: stats.matches,    label: t('statMatches') },
    { value: `${stats.players}`, label: t('statPlayers') },
    { value: stats.categories, label: t('statCategories') }
  ];

  // 3 catégories détaillées
  const categories = [
    {
      code: 'U7',
      age: '5 – 7',
      grades: 'CP · CE1',
      format: t('u7Format'),
      duration: t('u7Duration'),
      field: t('u7Field'),
      ball: t('u7Ball'),
      squad: t('u7Squad'),
      philosophy: t('catU7'),
      objectives: [t('u7Obj1'), t('u7Obj2'), t('u7Obj3')],
      accent: 'from-resa-royal to-resa-navy',
      bg: 'bg-resa-royal/5'
    },
    {
      code: 'U9',
      age: '8 – 9',
      grades: 'CE2 · CM1',
      format: t('u9Format'),
      duration: t('u9Duration'),
      field: t('u9Field'),
      ball: t('u9Ball'),
      squad: t('u9Squad'),
      philosophy: t('catU9'),
      objectives: [t('u9Obj1'), t('u9Obj2'), t('u9Obj3')],
      accent: 'from-resa-red to-red-800',
      bg: 'bg-resa-red/5'
    },
    {
      code: 'U11',
      age: '10 – 11',
      grades: 'CM2',
      format: t('u11Format'),
      duration: t('u11Duration'),
      field: t('u11Field'),
      ball: t('u11Ball'),
      squad: t('u11Squad'),
      philosophy: t('catU11'),
      objectives: [t('u11Obj1'), t('u11Obj2'), t('u11Obj3')],
      accent: 'from-resa-navy to-resa-navy-deep',
      bg: 'bg-resa-navy/5'
    }
  ];

  // 5 phases de saison
  const phases = [
    { n: 1, title: t('phase1Title'), period: t('phase1Period'), text: t('phase1Text'), accent: 'bg-resa-royal' },
    { n: 2, title: t('phase2Title'), period: t('phase2Period'), text: t('phase2Text'), accent: 'bg-resa-red' },
    { n: 3, title: t('phase3Title'), period: t('phase3Period'), text: t('phase3Text'), accent: 'bg-resa-navy' },
    { n: 4, title: t('phase4Title'), period: t('phase4Period'), text: t('phase4Text'), accent: 'bg-resa-red' },
    { n: 5, title: t('phase5Title'), period: t('phase5Period'), text: t('phase5Text'), accent: 'bg-amber-500' }
  ];

  // Règlement
  const rules = [
    { title: t('rulePoints'),   text: t('rulePointsText') },
    { title: t('ruleFormat'),   text: t('ruleFormatText') },
    { title: t('ruleTiebreak'), text: t('ruleTiebreakText') },
    { title: t('ruleForfeit'),  text: t('ruleForfeitText') },
    { title: t('rulePostpone'), text: t('rulePostponeText') }
  ];

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-resa-navy text-white">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-halo" />
        <div className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-resa-red/10 blur-3xl anim-float" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="max-w-3xl">
            <span className="mb-3 inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/85 backdrop-blur anim-fade-up">
              {t('season')}
            </span>
            <h1 className="font-display text-4xl font-black leading-[1.02] tracking-tight md:text-6xl anim-fade-up delay-100">
              {t('title')}
            </h1>
            <p className="mt-4 text-base text-white/75 md:text-lg anim-fade-up delay-200">
              {t('subtitle')}
            </p>
            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white/80 backdrop-blur anim-fade-up delay-300">
              ⚽ {t('seasonText')}
            </div>
          </div>
        </div>
        <div className="h-1 gradient-line" />
      </section>

      {/* ─── CHIFFRES CLÉS ─── */}
      <section className="border-b border-black/5 bg-resa-gray">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
          <div className="-mx-2 flex flex-wrap">
            {statItems.map((s, i) => (
                <div key={s.label} className="w-1/2 px-2 pb-4 sm:w-1/3 md:w-1/5 md:pb-0">
                <Reveal variant="up" delay={i * 100}>
                  <div className="text-center">
                    <div className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                      {s.value}
                    </div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                      {s.label}
                    </div>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LES 3 CATÉGORIES EN DÉTAIL ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <Reveal variant="right">
          <div className="mb-12 max-w-2xl">
            <div className="mb-3 h-1 w-14 bg-resa-red" />
            <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
              {t('categoriesTitle')}
            </h2>
            <p className="mt-3 text-base text-resa-text/70">
              {t('categoriesSubtitle')}
            </p>
          </div>
        </Reveal>

        <div className="space-y-8">
          {categories.map((c, idx) => (
            <Reveal key={c.code} variant="up" delay={idx * 100}>
              <article className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-resa-lg">
                <div className="grid gap-0 lg:grid-cols-[320px_1fr]">

                  {/* Bloc gauche - Catégorie */}
                  <div className={`relative overflow-hidden bg-resa-navy p-8 text-white lg:p-10`}>
                    <div className="absolute inset-0 bg-grid opacity-40" />
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${c.accent}`} />
                    <div className="relative">
                      <div className="font-display text-7xl font-black leading-none md:text-8xl">
                        {c.code}
                      </div>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/85 backdrop-blur">
                        {c.age} ans
                      </div>
                      <div className="mt-2 text-sm font-bold uppercase tracking-widest text-white/50">
                        {c.grades}
                      </div>

                      {/* Format phare */}
                      <div className="mt-8 border-t border-white/10 pt-6">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                          {t('categoryFormat')}
                        </div>
                        <div className="mt-1 font-display text-2xl font-black">
                          {c.format}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bloc droit - Détails */}
                  <div className="p-8 lg:p-10">
                    <p className="mb-8 text-sm leading-relaxed text-resa-text/70 md:text-base">
                      {c.philosophy}
                    </p>

                    {/* Grille specs */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <Spec icon="⏱️" label={t('categoryDuration')} value={c.duration} />
                      <Spec icon="📏" label={t('categoryField')}    value={c.field} />
                      <Spec icon="⚽" label={t('categoryBall')}     value={c.ball} />
                      <Spec icon="👥" label={t('categorySquad')}    value={c.squad} />
                    </div>

                    {/* Objectifs */}
                    <div className="mt-8 border-t border-black/5 pt-6">
                      <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-resa-red">
                        {t('categoryObjectives')}
                      </div>
                      <ul className="grid gap-3 sm:grid-cols-3">
                        {c.objectives.map((o, i) => (
                          <li key={i} className="flex gap-3 text-sm text-resa-text/75">
                            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-resa-red text-[10px] font-bold text-white">
                              ✓
                            </span>
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─── DÉROULEMENT D'UNE SAISON ─── */}
      <section className="bg-resa-navy py-16 text-white md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-12 max-w-2xl">
              <div className="mb-3 h-1 w-14 bg-resa-red" />
              <h2 className="font-display text-3xl font-black md:text-4xl">
                {t('seasonTitle')}
              </h2>
              <p className="mt-3 text-base text-white/65">
                {t('seasonSubtitle')}
              </p>
            </div>
          </Reveal>

          {/* Timeline horizontale */}
          <div className="relative">
            <div className="absolute left-4 top-6 bottom-0 w-px bg-white/10 md:left-0 md:right-0 md:top-8 md:bottom-auto md:h-px md:w-auto" />

            <div className="-mx-3 flex flex-wrap">
              {phases.map((p, i) => (
                <div key={p.n} className="w-full px-3 pb-8 md:w-1/5">
                  <Reveal variant="up" delay={i * 100}>
                    <div className="relative">
                      <div className="flex items-center gap-3 md:block">
                        <div className={`h-4 w-4 shrink-0 rounded-full ${p.accent} ring-4 ring-resa-navy`} />
                        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 md:mt-3">
                          {p.period}
                        </div>
                      </div>
                      <div className="mt-3 md:mt-5">
                        <div className="font-display text-base font-black text-white">
                          {p.title}
                        </div>
                        <p className="mt-2 text-sm text-white/65">
                          {p.text}
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

      {/* ─── RÈGLEMENT ─── */}
      <section id="reglement" className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <Reveal variant="right">
          <div className="mb-12 max-w-2xl">
            <div className="mb-3 h-1 w-14 bg-resa-royal" />
            <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
              {t('rules')}
            </h2>
            <p className="mt-3 text-base text-resa-text/70">
              {t('rulesSubtitle')}
            </p>
          </div>
        </Reveal>

        <div className="-mx-3 flex flex-wrap">
          {rules.map((r, i) => (
            <div key={i} className="w-full px-3 pb-6 md:w-1/2 lg:w-1/3">
              <Reveal variant="up" delay={i * 80}>
                <article className="h-full rounded-2xl border border-black/5 bg-white p-6 shadow-resa transition-all duration-300 hover:-translate-y-1 hover:shadow-resa-lg">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-resa-navy/5 font-display text-xs font-black text-resa-navy">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-resa-navy">
                      {r.title}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-resa-text/75">
                    {r.text}
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
        <div className="relative mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="font-display text-3xl font-black md:text-5xl">
            {t('joinTitle')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/75 md:text-lg">
            {t('joinText')}
          </p>
          <div className="mt-8">
            <Link
              href="/inscriptions"
              className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:bg-red-700 hover:scale-[1.04]"
            >
              {t('joinCta')}
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Composant Spec ─────────────────────────────────────────
function Spec({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/5 bg-resa-gray p-3">
      <div className="text-lg">{icon}</div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
        {label}
      </div>
      <div className="mt-0.5 font-display text-sm font-black text-resa-navy">
        {value}
      </div>
    </div>
  );
}