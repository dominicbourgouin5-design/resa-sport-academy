import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import {
  getSchoolBySlug, getActiveSeason, getCategories,
  getStandings, getMatches, getSchoolPlayers
} from '@/lib/queries';

export default async function SchoolPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const school = await getSchoolBySlug(slug);
  if (!school) notFound();

  const season = await getActiveSeason();
  const categories = await getCategories();

  const standingsArr = season
    ? await Promise.all(categories.map((c: any) => getStandings(season.id, c.id)))
    : [];

  const allMatches = season ? await getMatches({ seasonId: season.id }) : [];
  const players = season ? await getSchoolPlayers(school.id, season.id) : [];

  const schoolMatches = allMatches.filter((m: any) =>
    m.home_team?.school?.id === school.id ||
    m.away_team?.school?.id === school.id
  );

  const standingByCat: Record<string, any> = {};
  categories.forEach((c: any, i: number) => {
    const s = standingsArr[i]?.find((st: any) => st.team?.school?.id === school.id);
    if (s) standingByCat[c.id] = s;
  });

  return (
    <SchoolContent
      school={school}
      categories={categories}
      standingByCat={standingByCat}
      matches={schoolMatches}
      players={players}
      locale={locale}
    />
  );
}

function SchoolContent({
  school, categories, standingByCat, matches, players, locale
}: any) {
  const t = useTranslations('schools');
  const isFr = locale === 'fr';

  const teams = [...(school.teams ?? [])].sort(
    (a: any, b: any) => (a.category?.sort_order ?? 0) - (b.category?.sort_order ?? 0)
  );

  const totalPlayers = players.length;
  const playedMatches = matches.filter((m: any) => m.status === 'played');
  const totalGoals = playedMatches.reduce((acc: number, m: any) => {
    const isHome = m.home_team?.school?.id === school.id;
    const isAway = m.away_team?.school?.id === school.id;
    if (isHome) acc += m.home_score ?? 0;
    if (isAway) acc += m.away_score ?? 0;
    return acc;
  }, 0);

  const now = new Date();
  const lastMatches = [...playedMatches]
    .sort((a: any, b: any) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
    .slice(0, 5);
  const nextMatches = matches
    .filter((m: any) => m.status === 'scheduled' && new Date(m.match_date) > now)
    .sort((a: any, b: any) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
    .slice(0, 5);

  const playersByCat: Record<string, any[]> = {};
  for (const p of players) {
    const code = p.team?.category?.code;
    if (!code) continue;
    (playersByCat[code] ??= []).push(p);
  }

  const stats = [
    { value: teams.length,         label: t('statsTeams'),   icon: '🛡️' },
    { value: totalPlayers,         label: t('statsPlayers'), icon: '👥' },
    { value: playedMatches.length, label: t('statsMatches'), icon: '⚽' },
    { value: totalGoals,           label: t('statsGoals'),   icon: '🥅' }
  ];

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-resa-navy text-white">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-halo" />
        <div className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-resa-red/10 blur-3xl anim-float" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <Link
            href="/ecoles"
            className="group mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            {t('backToList')}
          </Link>

          <div className="flex flex-wrap items-start gap-6">


          {school.logo_url ? (
            <img
              src={school.logo_url}
              alt={school.name}
              className="h-20 w-20 shrink-0 rounded-2xl border border-white/10 bg-white object-cover shadow-resa-lg anim-zoom-in md:h-24 md:w-24"
            />
          ) : (
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-resa-red to-red-800 font-display text-3xl font-black text-white shadow-resa-lg anim-zoom-in md:h-24 md:w-24 md:text-4xl">
              {school.name.charAt(0).toUpperCase()}
            </div>
          )}

            <div className="flex-1 anim-fade-up">
              <h1 className="font-display text-3xl font-black leading-tight tracking-tight md:text-5xl">
                {school.name}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {school.city && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80 backdrop-blur">
                    📍 {school.city}
                  </span>
                )}
                {school.district && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-white/80 backdrop-blur">
                    {school.district}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-resa-red/40 bg-resa-red/10 px-3 py-1 font-bold uppercase tracking-wider text-white">
                  ● {teams.length} {t('statsTeams')}
                </span>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-white/75 md:text-base">
                {school.description_fr}
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative border-t border-white/10 bg-resa-navy-deep/70 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-wrap px-4 py-5 md:px-6">
            {stats.map((s, i) => (
              <div key={i} className="w-1/2 sm:w-1/4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-lg backdrop-blur">
                    {s.icon}
                  </div>
                  <div>
                    <div className="font-display text-2xl font-black leading-none">
                      {s.value}
                    </div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                      {s.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-1 gradient-line" />
      </section>

      {/* ─── CLASSEMENT PAR CATÉGORIE ─── */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <Reveal variant="right">
          <div className="mb-8 max-w-2xl">
            <div className="mb-3 h-1 w-14 bg-resa-red" />
            <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
              {t('standingsTitle')}
            </h2>
          </div>
        </Reveal>

        <div className="-mx-3 flex flex-wrap">
          {categories.map((c: any, idx: number) => {
            const st = standingByCat[c.id];
            const team = teams.find((tm: any) => tm.category?.id === c.id);

            return (
              <div key={c.id} className="w-full px-3 pb-6 md:w-1/3">
                <Reveal variant="up" delay={idx * 100}>
                  <article className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-6 shadow-resa transition-all duration-300 hover:-translate-y-1 hover:shadow-resa-lg">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="font-display text-4xl font-black text-resa-navy transition-colors duration-300 group-hover:text-resa-red">
                        {c.code}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
                        {c.school_levels?.join(' · ')}
                      </div>
                    </div>

                    {st ? (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <MiniStat label={t('positionShort')} value={`#${st.rank}`} accent />
                          <MiniStat label={t('pointsLabel')} value={st.points} />
                          <MiniStat label="J" value={st.played} />
                        </div>
                        <div className="mt-4 flex items-center gap-3 border-t border-black/5 pt-4 text-[11px] font-bold uppercase tracking-widest text-resa-text/50">
                          <span className="text-emerald-600">{t('win')} {st.won}</span>
                          <span className="text-amber-600">{t('draw')} {st.drawn}</span>
                          <span className="text-red-600">{t('loss')} {st.lost}</span>
                          <span className="ml-auto text-resa-navy">
                            {st.goal_diff > 0 ? '+' : ''}{st.goal_diff}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs italic text-resa-text/40">—</p>
                    )}

                    {team?.coach_name && (
                      <div className="mt-4 flex items-center gap-2 border-t border-black/5 pt-4 text-xs text-resa-text/60">
                        <span className="text-resa-red">👤</span>
                        <span className="font-bold">{t('coach')} :</span>
                        {team.coach_name}
                      </div>
                    )}
                  </article>
                </Reveal>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── EFFECTIF ─── */}
      <section className="bg-resa-gray py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <Reveal variant="right">
            <div className="mb-8 max-w-2xl">
              <div className="mb-3 h-1 w-14 bg-resa-royal" />
              <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
                {t('rosterTitle')}
              </h2>
              <p className="mt-2 text-sm text-resa-text/60">
                {t('rosterSubtitle')}
              </p>
            </div>
          </Reveal>

          <div className="space-y-6">
            {categories.map((c: any) => {
              const list = playersByCat[c.code] ?? [];
              return (
                <div key={c.id}>
                  <div className="mb-3 flex items-center gap-3">
                    <div className="font-display text-xl font-black text-resa-navy">
                      {c.code}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest text-resa-text/50">
                      {list.length} {isFr ? 'joueurs' : 'players'}
                    </div>
                    <div className="h-px flex-1 bg-black/5" />
                  </div>

                  {list.length === 0 ? (
                    <p className="text-xs italic text-resa-text/40">
                      {t('noPlayers')}
                    </p>
                  ) : (
                    <div className="-mx-2 flex flex-wrap">
                      {list.map((p: any) => (
                        <div key={p.id} className="w-1/2 px-2 pb-3 sm:w-1/3 lg:w-1/5">
                          <div className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-3 transition hover:border-resa-navy/20 hover:shadow-resa">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-resa-navy font-display text-xs font-black text-white">
                              {p.jersey_number ?? '—'}
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-resa-navy">
                                {p.first_name} {p.last_initial}
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
                                {p.position === 'GK' && t('positionGK')}
                                {p.position === 'DF' && t('positionDF')}
                                {p.position === 'MF' && t('positionMF')}
                                {p.position === 'FW' && t('positionFW')}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── MATCHS ─── */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="-mx-3 flex flex-wrap">
          <div className="w-full px-3 pb-8 lg:w-1/2 lg:pb-0">
            <Reveal variant="right">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-1 w-10 bg-resa-red" />
                <h3 className="font-display text-xl font-black text-resa-navy">
                  {t('lastMatches')}
                </h3>
              </div>
            </Reveal>

            {lastMatches.length === 0 ? (
              <p className="text-xs italic text-resa-text/40">{t('noMatches')}</p>
            ) : (
              <div className="space-y-2">
                {lastMatches.map((m: any) => (
                  <MatchRow key={m.id} match={m} schoolId={school.id} t={t} isFr={isFr} />
                ))}
              </div>
            )}
          </div>

          <div className="w-full px-3 lg:w-1/2">
            <Reveal variant="left" delay={120}>
              <div className="mb-6 flex items-center gap-3">
                <div className="h-1 w-10 bg-resa-royal" />
                <h3 className="font-display text-xl font-black text-resa-navy">
                  {t('nextMatches')}
                </h3>
              </div>
            </Reveal>

            {nextMatches.length === 0 ? (
              <p className="text-xs italic text-resa-text/40">{t('noMatches')}</p>
            ) : (
              <div className="space-y-2">
                {nextMatches.map((m: any) => (
                  <MatchRow key={m.id} match={m} schoolId={school.id} t={t} isFr={isFr} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section className="bg-resa-navy py-12 text-white md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="mb-3 h-1 w-12 bg-resa-red" />
              <h3 className="font-display text-2xl font-black">{t('contact')}</h3>
            </div>

            <div className="grid gap-4 md:col-span-2 md:grid-cols-3">
                {school.contact_name && (
                  <ContactItem label={t('refererLabel')} value={school.contact_name} />
                )}
                {school.contact_phone && (
                  <ContactItem label={t('phoneLabel')} value={school.contact_phone} href={`tel:${school.contact_phone}`} />
                )}
                {school.contact_email && (
                  <ContactItem label={t('emailLabel')} value={school.contact_email} href={`mailto:${school.contact_email}`} />
                )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ─── Composants utilitaires ─────────────────────────────────

function MiniStat({ label, value, accent = false }: { label: string; value: any; accent?: boolean }) {
  return (
    <div className="text-center">
      <div className={`font-display text-xl font-black ${accent ? 'text-resa-red' : 'text-resa-navy'}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-resa-text/40">
        {label}
      </div>
    </div>
  );
}

function MatchRow({
  match, schoolId, t, isFr
}: {
  match: any; schoolId: string; t: any; isFr: boolean;
}) {
  const isHome = match.home_team?.school?.id === schoolId;
  const opponent = isHome ? match.away_team?.school?.name : match.home_team?.school?.name;
  const myScore = isHome ? match.home_score : match.away_score;
  const oppScore = isHome ? match.away_score : match.home_score;

  const isPlayed = match.status === 'played';
  const outcome = isPlayed
    ? myScore > oppScore ? 'win' : myScore < oppScore ? 'loss' : 'draw'
    : null;

  const dateStr = new Date(match.match_date).toLocaleDateString(
    isFr ? 'fr-FR' : 'en-GB',
    { day: '2-digit', month: 'short' }
  );

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-black/5 bg-white p-3 transition hover:border-resa-navy/20 hover:shadow-resa">
      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-display text-xs font-black text-white ${
        outcome === 'win' ? 'bg-emerald-500' :
        outcome === 'loss' ? 'bg-red-500' :
        outcome === 'draw' ? 'bg-amber-500' : 'bg-resa-gray'
      } ${!outcome ? 'text-resa-text/40' : ''}`}>
        {outcome === 'win' ? t('win') :
         outcome === 'loss' ? t('loss') :
         outcome === 'draw' ? t('draw') : '—'}
      </div>

      <div className="w-16 shrink-0">
        <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
          {dateStr}
        </div>
        <div className="text-[10px] font-bold text-resa-red">
          {match.category?.code}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-resa-navy">
          {opponent}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
          {isHome ? t('home') : t('away')}
        </div>
      </div>

      <div className="shrink-0 text-right">
        {isPlayed ? (
          <div className="font-display text-lg font-black text-resa-navy">
            {myScore} - {oppScore}
          </div>
        ) : (
          <div className="font-display text-xs font-black text-resa-text/40">
            {new Date(match.match_date).toLocaleTimeString(isFr ? 'fr-FR' : 'en-GB', {
              hour: '2-digit', minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ContactItem({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <>
      <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-white">
        {value}
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className="rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">
        {content}
      </a>
    );
  }
  return <div className="rounded-xl border border-white/10 bg-white/5 p-4">{content}</div>;
}