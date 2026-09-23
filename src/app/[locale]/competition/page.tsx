import { setRequestLocale } from 'next-intl/server';
import {
  getActiveSeason, getCategories, getMatches, getStandings,
  getTopScorers, getTopAssists, getTopPlayers, getDiscipline
} from '@/lib/queries';
import CompetitionTabs from './CompetitionTabs';

export default async function CompetitionPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const season = await getActiveSeason();
  if (!season) return <div className="p-10 text-center">Saison introuvable</div>;

  const categories = await getCategories();
  const matches = await getMatches({ seasonId: season.id });

  const standingsByCategory: Record<string, any[]> = {};
  const scorersByCategory: Record<string, any[]> = {};
  const assistsByCategory: Record<string, any[]> = {};
  const mvpByCategory: Record<string, any[]> = {};
  const disciplineByCategory: Record<string, any[]> = {};

  for (const cat of categories) {
    standingsByCategory[cat.id] = await getStandings(season.id, cat.id);
    scorersByCategory[cat.id] = await getTopScorers(season.id, cat.id);
    assistsByCategory[cat.id] = await getTopAssists(season.id, cat.id);
    mvpByCategory[cat.id] = await getTopPlayers(season.id, cat.id);
    disciplineByCategory[cat.id] = await getDiscipline(season.id, cat.id);
  }

  return (
    <CompetitionTabs
      season={season}
      categories={categories}
      matches={matches}
      standingsByCategory={standingsByCategory}
      scorersByCategory={scorersByCategory}
      assistsByCategory={assistsByCategory}
      mvpByCategory={mvpByCategory}
      disciplineByCategory={disciplineByCategory}
    />
  );
}