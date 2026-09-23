'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import CompetitionHero from './CompetitionHero';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

type Tab = 'standings' | 'calendar' | 'results' | 'stats';
type StatTab = 'scorers' | 'assists' | 'mvp' | 'discipline';

function formatDate(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    weekday: 'short', day: '2-digit', month: 'short'
  });
}
function formatTime(dateStr: string, locale: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    hour: '2-digit', minute: '2-digit'
  });
}
function statusLabel(status: string, t: any) {
  const map: Record<string, string> = {
    played: t('statusPlayed'),
    scheduled: t('statusScheduled'),
    postponed: t('statusPostponed'),
    cancelled: t('statusCancelled'),
    forfeit_home: t('statusForfeit'),
    forfeit_away: t('statusForfeit')
  };
  return map[status] ?? status;
}

export default function CompetitionTabs({
  season, categories, matches,
  standingsByCategory, scorersByCategory, assistsByCategory,
  mvpByCategory, disciplineByCategory
}: any) {
  const t = useTranslations('competition');
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>('standings');
  const [statTab, setStatTab] = useState<StatTab>('scorers');
  const [catCode, setCatCode] = useState<string>(categories[0]?.code ?? 'U7');

  const activeCat = categories.find((c: any) => c.code === catCode);
  const standings = activeCat ? (standingsByCategory[activeCat.id] ?? []) : [];
  const scorers = activeCat ? (scorersByCategory[activeCat.id] ?? []) : [];
  const assists = activeCat ? (assistsByCategory[activeCat.id] ?? []) : [];
  const mvps = activeCat ? (mvpByCategory[activeCat.id] ?? []) : [];
  const discipline = activeCat ? (disciplineByCategory[activeCat.id] ?? []) : [];

  const catMatches = matches.filter((m: any) => m.category?.code === catCode);
  const upcoming = catMatches.filter(
    (m: any) => new Date(m.match_date) > new Date() && m.status === 'scheduled'
  );
  const played = [...catMatches]
    .filter((m: any) => m.status === 'played')
    .sort((a: any, b: any) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());

  const tabLabel = (k: Tab) =>
    k === 'standings' ? t('tabsStandings') :
    k === 'calendar' ? t('tabsCalendar') :
    k === 'results' ? t('tabsResults') : t('tabsStats');

  const statTabLabel = (k: StatTab) =>
    k === 'scorers' ? t('statsScorers') :
    k === 'assists' ? t('statsAssists') :
    k === 'mvp' ? t('statsMVP') : t('statsDiscipline');

  return (
    <>
      {/* HERO */}
      <CompetitionHero seasonName={season.name_fr} />

      {/* FILTRES */}
      <section className="sticky top-[72px] z-30 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div className="flex gap-2">
            {categories.map((c: any) => (
              <button
                key={c.id}
                onClick={() => setCatCode(c.code)}
                className={cn(
                  'rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300',
                  catCode === c.code
                    ? 'bg-resa-navy text-white shadow-resa'
                    : 'border border-black/10 bg-white text-resa-text/60 hover:border-resa-navy/30 hover:text-resa-navy'
                )}
              >
                {c.code}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 rounded-full border border-black/5 bg-resa-gray p-1">
            {(['standings', 'calendar', 'results', 'stats'] as Tab[]).map((key) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  'rounded-full px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 md:px-4 md:text-xs',
                  tab === key
                    ? 'bg-resa-red text-white shadow-resa'
                    : 'text-resa-text/60 hover:text-resa-navy'
                )}
              >
                {tabLabel(key)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CONTENU */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">

        {/* ─── CLASSEMENTS ─── */}
        {tab === 'standings' && (
          <div className="anim-fade-in">
            {standings.length === 0 ? (
              <p className="text-center text-resa-text/60">{t('noStandings')}</p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/5 bg-resa-gray text-[10px] font-bold uppercase tracking-widest text-resa-text/60">
                      <th className="px-3 py-3 text-left md:px-5">{t('position')}</th>
                      <th className="px-3 py-3 text-left md:px-5">{t('team')}</th>
                      <th className="px-2 py-3 text-center">{t('played')}</th>
                      <th className="hidden px-2 py-3 text-center sm:table-cell">{t('won')}</th>
                      <th className="hidden px-2 py-3 text-center sm:table-cell">{t('drawn')}</th>
                      <th className="hidden px-2 py-3 text-center sm:table-cell">{t('lost')}</th>
                      <th className="hidden px-2 py-3 text-center md:table-cell">{t('goalsFor')}</th>
                      <th className="hidden px-2 py-3 text-center md:table-cell">{t('goalsAgainst')}</th>
                      <th className="px-2 py-3 text-center">{t('goalDiff')}</th>
                      <th className="px-3 py-3 text-center font-black md:px-5">{t('points')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((s: any, i: number) => (
                      <tr key={s.id} className={cn(
                        'border-b border-black/5 transition-colors last:border-0 hover:bg-resa-gray/60',
                        i < 3 && 'bg-resa-royal/5'
                      )}>
                        <td className="px-3 py-4 md:px-5">
                          <span className={cn(
                            'grid h-7 w-7 place-items-center rounded-full text-xs font-black',
                            i === 0 && 'bg-resa-gold text-white',
                            i === 1 && 'bg-gray-400 text-white',
                            i === 2 && 'bg-amber-700 text-white',
                            i > 2 && 'bg-resa-gray text-resa-text/60'
                          )}>
                            {s.rank}
                          </span>
                        </td>
                        <td className="px-3 py-4 font-semibold text-resa-navy md:px-5">
                          <Link href={`/ecoles/${s.team?.school?.slug}`} className="hover:text-resa-red">
                            {s.team?.school?.name ?? s.team?.name}
                          </Link>
                        </td>
                        <td className="px-2 py-4 text-center">{s.played}</td>
                        <td className="hidden px-2 py-4 text-center sm:table-cell">{s.won}</td>
                        <td className="hidden px-2 py-4 text-center sm:table-cell">{s.drawn}</td>
                        <td className="hidden px-2 py-4 text-center sm:table-cell">{s.lost}</td>
                        <td className="hidden px-2 py-4 text-center md:table-cell">{s.goals_for}</td>
                        <td className="hidden px-2 py-4 text-center md:table-cell">{s.goals_against}</td>
                        <td className="px-2 py-4 text-center">{s.goal_diff > 0 ? `+${s.goal_diff}` : s.goal_diff}</td>
                        <td className="px-3 py-4 text-center font-display text-lg font-black text-resa-navy md:px-5">
                          {s.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ─── CALENDRIER ─── */}
        {tab === 'calendar' && (
          <div className="anim-fade-in space-y-4">
            {upcoming.length === 0 ? (
              <p className="text-center text-resa-text/60">{t('noUpcoming')}</p>
            ) : (
              upcoming.map((m: any) => <MatchCard key={m.id} match={m} locale={locale} t={t} />)
            )}
          </div>
        )}

        {/* ─── RÉSULTATS ─── */}
        {tab === 'results' && (
          <div className="anim-fade-in space-y-4">
            {played.length === 0 ? (
              <p className="text-center text-resa-text/60">{t('noMatches')}</p>
            ) : (
              played.map((m: any) => <MatchCard key={m.id} match={m} locale={locale} t={t} />)
            )}
          </div>
        )}

        {/* ─── STATISTIQUES ─── */}
        {tab === 'stats' && (
          <div className="anim-fade-in">
            <div className="mb-8 flex flex-wrap gap-2 border-b border-black/5 pb-4">
              {(['scorers', 'assists', 'mvp', 'discipline'] as StatTab[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setStatTab(k)}
                  className={cn(
                    'rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300',
                    statTab === k
                      ? 'bg-resa-navy text-white'
                      : 'border border-black/10 bg-white text-resa-text/60 hover:border-resa-navy/30 hover:text-resa-navy'
                  )}
                >
                  {statTabLabel(k)}
                </button>
              ))}
            </div>

            {statTab === 'scorers' && (
              <StatsTable
                rows={scorers}
                metricLabel={t('goals')}
                metricKey="goals"
                t={t}
                accent="red"
              />
            )}

            {statTab === 'assists' && (
              <StatsTable
                rows={assists}
                metricLabel={t('assists')}
                metricKey="assists"
                t={t}
                accent="royal"
              />
            )}

            {statTab === 'mvp' && (
              <StatsTable
                rows={mvps}
                metricLabel={t('mvpCount')}
                metricKey="mvp"
                t={t}
                accent="gold"
              />
            )}

            {statTab === 'discipline' && (
              <DisciplineTable rows={discipline} t={t} />
            )}
          </div>
        )}
      </section>
    </>
  );
}

// ─── Tableau générique pour statistiques ────────────────────
function StatsTable({
  rows, metricLabel, metricKey, t, accent
}: {
  rows: any[]; metricLabel: string; metricKey: string; t: any;
  accent: 'red' | 'royal' | 'gold';
}) {
  const accentClass =
    accent === 'red' ? 'bg-resa-red' :
    accent === 'royal' ? 'bg-resa-royal' : 'bg-resa-gold';

  if (rows.length === 0) {
    return <p className="text-center text-resa-text/60">{t('noStats')}</p>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/5 bg-resa-gray text-[10px] font-bold uppercase tracking-widest text-resa-text/60">
            <th className="px-3 py-3 text-left md:px-5">{t('position')}</th>
            <th className="px-3 py-3 text-left md:px-5">{t('player')}</th>
            <th className="hidden px-3 py-3 text-left md:table-cell md:px-5">{t('club')}</th>
            <th className="px-3 py-3 text-center font-black md:px-5">{metricLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.player_id} className={cn(
              'border-b border-black/5 transition-colors last:border-0 hover:bg-resa-gray/60',
              i < 3 && 'bg-resa-royal/5'
            )}>
              <td className="px-3 py-4 md:px-5">
                <span className={cn(
                  'grid h-7 w-7 place-items-center rounded-full text-xs font-black',
                  i === 0 && 'bg-resa-gold text-white',
                  i === 1 && 'bg-gray-400 text-white',
                  i === 2 && 'bg-amber-700 text-white',
                  i > 2 && 'bg-resa-gray text-resa-text/60'
                )}>
                  {i + 1}
                </span>
              </td>
              <td className="px-3 py-4 md:px-5">
                <div className="font-semibold text-resa-navy">
                  {r.first_name} {r.last_initial}
                </div>
                <div className="text-[11px] text-resa-text/50 md:hidden">
                  {r.school?.name}
                </div>
              </td>
              <td className="hidden px-3 py-4 text-resa-text/70 md:table-cell md:px-5">
                <Link href={`/ecoles/${r.school?.slug}`} className="hover:text-resa-red">
                  {r.school?.name}
                </Link>
              </td>
              <td className="px-3 py-4 text-center md:px-5">
                <span className={cn(
                  'inline-flex min-w-[2.5rem] items-center justify-center rounded-full px-3 py-1 font-display text-sm font-black text-white',
                  accentClass
                )}>
                  {r[metricKey]}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tableau discipline ─────────────────────────────────────
function DisciplineTable({ rows, t }: { rows: any[]; t: any }) {
  if (rows.length === 0) {
    return <p className="text-center text-resa-text/60">{t('noStats')}</p>;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/5 bg-resa-gray text-[10px] font-bold uppercase tracking-widest text-resa-text/60">
            <th className="px-3 py-3 text-left md:px-5">{t('player')}</th>
            <th className="hidden px-3 py-3 text-left md:table-cell md:px-5">{t('club')}</th>
            <th className="px-3 py-3 text-center">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 w-2.5 rounded-sm bg-amber-400" />
                {t('yellowCards')}
              </span>
            </th>
            <th className="px-3 py-3 text-center">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 w-2.5 rounded-sm bg-red-500" />
                {t('redCards')}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any) => (
            <tr key={r.player_id} className="border-b border-black/5 last:border-0 hover:bg-resa-gray/60">
              <td className="px-3 py-4 md:px-5">
                <div className="font-semibold text-resa-navy">
                  {r.first_name} {r.last_initial}
                </div>
                <div className="text-[11px] text-resa-text/50 md:hidden">{r.school?.name}</div>
              </td>
              <td className="hidden px-3 py-4 text-resa-text/70 md:table-cell md:px-5">
                {r.school?.name}
              </td>
              <td className="px-3 py-4 text-center">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 font-black text-white text-xs">
                  {r.yellow}
                </span>
              </td>
              <td className="px-3 py-4 text-center">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500 font-black text-white text-xs">
                  {r.red}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── MatchCard ──────────────────────────────────────────────
function MatchCard({ match, locale, t }: { match: any; locale: string; t: any }) {
  const home = match.home_team?.school?.name ?? match.home_team?.name;
  const away = match.away_team?.school?.name ?? match.away_team?.name;
  const played = match.status === 'played';

  return (
    <article className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-300 hover:shadow-resa-lg">
      <div className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-resa-navy px-3 py-1.5 font-display text-xs font-black uppercase tracking-widest text-white">
            {match.category?.code}
          </div>
          <div className="text-xs font-semibold uppercase tracking-widest text-resa-text/50">
            {formatDate(match.match_date, locale)} · {formatTime(match.match_date, locale)}
          </div>
        </div>
        <span className={cn(
          'rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
          played ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
        )}>
          {statusLabel(match.status, t)}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-black/5 bg-resa-gray/40 px-5 py-4">
        <div className="text-right font-semibold text-resa-navy">{home}</div>
        <div className="min-w-[80px] text-center font-display text-2xl font-black text-resa-navy">
          {played ? `${match.home_score} - ${match.away_score}` : t('vs')}
        </div>
        <div className="text-left font-semibold text-resa-navy">{away}</div>
      </div>
      {match.venue && (
        <div className="border-t border-black/5 px-5 py-2 text-[11px] uppercase tracking-widest text-resa-text/40">
          📍 {match.venue}
        </div>
      )}
    </article>
  );
}