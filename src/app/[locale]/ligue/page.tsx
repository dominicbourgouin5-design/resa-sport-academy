import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import { getGlobalStats } from '@/lib/queries';
import LigueHero from './LigueHero';
import { StatsGrid } from './AnimatedStats';

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
    { value: Number(stats.schools)    || 0, label: t('statSchools') },
    { value: Number(stats.teams)      || 0, label: t('statTeams') },
    { value: Number(stats.matches)    || 0, label: t('statMatches') },
    { value: Number(stats.players)    || 0, label: t('statPlayers') },
    { value: Number(stats.categories) || 0, label: t('statCategories') }
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
      badge: 'bg-resa-royal/10 text-resa-royal'
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
      badge: 'bg-resa-red/10 text-resa-red'
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
      badge: 'bg-resa-navy/10 text-resa-navy'
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
      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <LigueHero />

      {/* ═══════════════════════════════════════════════════════════
          CHIFFRES CLÉS — Navy immersif avec compteurs animés
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-linear-to-br from-resa-navy via-resa-navy to-resa-navy-deep py-16 text-white md:py-20">
        {/* Dots pattern */}
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-15" />

        {/* Cercles concentriques décoratifs */}
        <svg
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[180%] w-[180%] -translate-x-1/2 -translate-y-1/2 opacity-[0.05]"
        >
          <circle cx="50%" cy="50%" r="20%" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="50%" cy="50%" r="32%" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="50%" cy="50%" r="44%" fill="none" stroke="white" strokeWidth="0.5" />
        </svg>

        {/* Halo rouge subtil */}
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-resa-red/15 blur-3xl anim-float" />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <StatsGrid items={statItems} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          LES 3 CATÉGORIES EN DÉTAIL — Terrain SVG vertical
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-linear-to-br from-resa-gray/60 via-white to-resa-gray/40 py-24 md:py-32">

        {/* Terrain de foot vertical */}
        <svg
          aria-hidden
          viewBox="0 0 400 600"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 h-full w-full text-resa-navy/[0.06]"
        >
          <rect x="20" y="20" width="360" height="560" rx="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <line x1="20" y1="300" x2="380" y2="300" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="200" cy="300" r="55" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="200" cy="300" r="3" fill="currentColor" />
          <rect x="100" y="20" width="200" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="140" y="20" width="120" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 155 100 A 45 45 0 0 0 245 100" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="100" y="500" width="200" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="140" y="550" width="120" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 155 500 A 45 45 0 0 1 245 500" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 20 40 A 20 20 0 0 0 40 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 360 20 A 20 20 0 0 1 380 40" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 20 560 A 20 20 0 0 1 40 580" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M 360 580 A 20 20 0 0 0 380 560" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>

        {/* Halos radiaux */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(45% 40% at 12% 15%, rgba(30,58,138,0.08) 0%, transparent 65%), radial-gradient(40% 35% at 92% 88%, rgba(220,38,38,0.06) 0%, transparent 65%)'
          }}
        />

        {/* Voile blanc central */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 60% at 50% 45%, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.4) 55%, transparent 80%)'
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-14 max-w-2xl">
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
                <article className="group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-resa-lg transition-shadow duration-500 hover:shadow-[0_32px_64px_-12px_rgba(10,31,68,0.18)]">
                  <div className="grid gap-0 lg:grid-cols-[320px_1fr]">

                    {/* Bloc gauche — Catégorie */}
                    <div className="relative overflow-hidden bg-resa-navy p-8 text-white lg:p-10">
                      <div className="absolute inset-0 bg-grid opacity-40" />
                      <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${c.accent}`} />

                      {/* Halo qui pulse au survol */}
                      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/0 blur-3xl transition-all duration-700 group-hover:bg-white/10" />

                      <div className="relative">
                        <div className="font-display text-7xl font-black leading-none transition-transform duration-500 group-hover:scale-105 md:text-8xl">
                          {c.code}
                        </div>
                        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/85 backdrop-blur">
                          {c.age} ans
                        </div>
                        <div className="mt-2 text-sm font-bold uppercase tracking-widest text-white/50">
                          {c.grades}
                        </div>

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

                    {/* Bloc droit — Détails */}
                    <div className="p-8 lg:p-10">
                      <p className="mb-8 text-sm leading-relaxed text-resa-text/70 md:text-base">
                        {c.philosophy}
                      </p>

                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <Spec icon="⏱️" label={t('categoryDuration')} value={c.duration} />
                        <Spec icon="📏" label={t('categoryField')}    value={c.field} />
                        <Spec icon="⚽" label={t('categoryBall')}     value={c.ball} />
                        <Spec icon="👥" label={t('categorySquad')}    value={c.squad} />
                      </div>

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
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DÉROULEMENT D'UNE SAISON — Navy + cercles + timeline
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-fade-navy py-24 text-white md:py-32">
        {/* Cercles concentriques dashed */}
        <svg
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
        >
          <circle cx="50%" cy="50%" r="18%" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 10" />
          <circle cx="50%" cy="50%" r="30%" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 10" />
          <circle cx="50%" cy="50%" r="42%" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 10" />
          <circle cx="50%" cy="50%" r="55%" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 10" />
        </svg>

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-14 max-w-2xl">
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
            {/* Ligne de connexion */}
            <div className="absolute left-4 top-6 bottom-0 w-px bg-white/10 md:left-0 md:right-0 md:top-8 md:bottom-auto md:h-px md:w-auto" />

            {/* Ligne animée par-dessus (plus visible) */}
            <div className="absolute left-4 top-6 bottom-0 w-px bg-linear-to-b from-resa-red via-resa-royal to-amber-500 opacity-40 md:left-0 md:right-0 md:top-8 md:bottom-auto md:h-px md:w-auto md:bg-linear-to-r" />

            <div className="grid gap-6 md:grid-cols-5">
              {phases.map((p, i) => (
                <Reveal key={p.n} variant="up" delay={i * 100} className="h-full">
                  <div className="group relative">
                    <div className="flex items-center gap-3 md:block">
                      <div className={`h-4 w-4 shrink-0 rounded-full ${p.accent} ring-4 ring-resa-navy transition-transform duration-500 group-hover:scale-125`} />
                      <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 md:mt-3">
                        {p.period}
                      </div>
                    </div>
                    <div className="mt-3 md:mt-5">
                      <div className="font-display text-base font-black text-white transition-colors duration-300 group-hover:text-resa-red">
                        {p.title}
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-white/65">
                        {p.text}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          RÈGLEMENT — Clair + dots + cartes numérotées
      ═══════════════════════════════════════════════════════════ */}
      <section
        id="reglement"
        className="relative scroll-mt-24 overflow-hidden bg-white py-24 md:py-32"
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
          <div className="h-full w-full bg-dots" />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 50% at 50% 40%, rgba(30,58,138,0.05) 0%, transparent 70%)'
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-14 max-w-2xl">
              <div className="mb-3 h-1 w-14 bg-resa-royal" />
              <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
                {t('rules')}
              </h2>
              <p className="mt-3 text-base text-resa-text/70">
                {t('rulesSubtitle')}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-8">
            {rules.map((r, i) => (
              <Reveal key={i} variant="up" delay={i * 80} className="h-full">
                <article className="group relative h-full rounded-2xl border border-black/5 bg-linear-to-br from-white to-resa-gray/60 p-7 shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                  {/* Halo au survol */}
                  <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-resa-royal/0 blur-2xl transition-all duration-500 group-hover:bg-resa-royal/10" />

                  <div className="relative mb-4 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-linear-to-br from-resa-navy to-resa-royal font-display text-xs font-black text-white shadow-resa transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-resa-navy">
                      {r.title}
                    </div>
                  </div>
                  <p className="relative text-sm leading-relaxed text-resa-text/75">
                    {r.text}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA FINAL IMMERSIF
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-linear-to-b from-resa-navy via-resa-navy to-resa-navy-deep py-28 text-white md:py-40">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <svg
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
        >
          <circle cx="50%" cy="50%" r="22%" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="50%" cy="50%" r="36%" fill="none" stroke="white" strokeWidth="0.5" />
          <circle cx="50%" cy="50%" r="50%" fill="none" stroke="white" strokeWidth="0.5" />
        </svg>
        <div className="pointer-events-none absolute -top-32 left-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-resa-red/15 blur-3xl anim-float" />
        <div
          className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-resa-royal/25 blur-3xl anim-float"
          style={{ animationDelay: '1.5s' }}
        />

        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
          <Reveal variant="up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-resa-red anim-glow" />
              {t('statSchools').split(' ')[0] === 'Écoles' ? 'Inscriptions ouvertes' : 'Open registration'}
            </span>
          </Reveal>

          <Reveal variant="zoom" delay={80}>
            <h2 className="mt-6 font-display text-4xl font-black md:text-6xl">
              {t('joinTitle')}
            </h2>
          </Reveal>

          <Reveal variant="up" delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/75">
              {t('joinText')}
            </p>
          </Reveal>

          <Reveal variant="up" delay={240}>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <Link
                href="/inscriptions#form"
                className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:scale-[1.04] hover:bg-red-700"
              >
                {t('joinCta')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/competition"
                className="group inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-8 py-4 text-sm font-bold uppercase tracking-wide text-white backdrop-blur-sm transition-all duration-300 hover:scale-[1.04] hover:bg-white hover:text-resa-navy"
              >
                {t('statTeams').split(' ')[0] === 'Équipes' ? 'Voir les classements' : 'View standings'}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

// ─── Composant Spec ─────────────────────────────────────────
function Spec({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="group/spec rounded-xl border border-black/5 bg-resa-gray p-3 transition-all duration-300 hover:-translate-y-1 hover:border-resa-navy/10 hover:bg-white hover:shadow-resa">
      <div className="text-lg transition-transform duration-300 group-hover/spec:scale-110">
        {icon}
      </div>
      <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
        {label}
      </div>
      <div className="mt-0.5 font-display text-sm font-black text-resa-navy">
        {value}
      </div>
    </div>
  );
}