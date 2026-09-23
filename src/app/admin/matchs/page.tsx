import { createClient } from '@/lib/supabase/server';
import { getActiveSeason } from '@/lib/queries';
import Link from 'next/link';
import Collapsible from '@/components/admin/Collapsible';
import MatchesTable from './MatchesTable';

export default async function AdminMatchesPage() {
  const supabase = await createClient();
  const season = await getActiveSeason();

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id, match_date, venue, status, home_score, away_score,
      category:categories(id, code, sort_order),
      home_team:teams!matches_home_team_id_fkey(
        id, name,
        school:schools(id, name)
      ),
      away_team:teams!matches_away_team_id_fkey(
        id, name,
        school:schools(id, name)
      )
    `)
    .eq('season_id', season?.id ?? '')
    .order('match_date', { ascending: true });

  const list = (matches ?? []) as any[];

  const upcoming = list.filter((m) => m.status === 'scheduled');
  const played = list.filter((m) => m.status === 'played');
  const others = list.filter((m) => !['scheduled', 'played'].includes(m.status));

  return (
    <div className="mx-auto max-w-6xl">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
            Compétition
          </div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Matchs & scores
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            {list.length} match(s) au calendrier · {played.length} joué(s)
          </p>
        </div>

        <Link
          href="/admin/matchs/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-resa-red px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700"
        >
          + Nouveau match
        </Link>
      </div>

      {/* Collapsibles */}
      <div className="space-y-4">
        <Collapsible
          title="Matchs à venir"
          subtitle="Rencontres programmées"
          icon="📅"
          accent="amber"
          defaultOpen={true}
          badge={upcoming.length}
        >
          <MatchesTable matches={upcoming} />
        </Collapsible>

        <Collapsible
          title="Résultats & matchs joués"
          subtitle="Scores enregistrés"
          icon="✅"
          accent="emerald"
          defaultOpen={false}
          badge={played.length}
        >
          <MatchesTable matches={played} />
        </Collapsible>

        {others.length > 0 && (
          <Collapsible
            title="Matchs reportés / annulés"
            subtitle="Autres statuts"
            icon="⏸️"
            accent="navy"
            defaultOpen={false}
            badge={others.length}
          >
            <MatchesTable matches={others} />
          </Collapsible>
        )}
      </div>
    </div>
  );
}