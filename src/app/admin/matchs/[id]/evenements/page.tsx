import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import EventsEditor from './EventsEditor';

export default async function MatchEventsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Match + équipes + écoles
  const { data: match } = await supabase
    .from('matches')
    .select(`
      id, match_date, home_score, away_score, status,
      category:categories(id, code),
      home_team:teams!matches_home_team_id_fkey(
        id, name,
        school:schools(id, name)
      ),
      away_team:teams!matches_away_team_id_fkey(
        id, name,
        school:schools(id, name)
      )
    `)
    .eq('id', id)
    .single();

  if (!match) notFound();

  // Joueurs des 2 équipes
  const { data: players } = await supabase
    .from('players')
    .select('id, first_name, last_initial, jersey_number, position, team_id')
    .in('team_id', [
      (match.home_team as any)?.id,
      (match.away_team as any)?.id
    ])
    .order('jersey_number');

  // Événements existants
  const { data: events } = await supabase
    .from('match_events')
    .select('*')
    .eq('match_id', id);

  return (
    <EventsEditor
      match={match}
      players={(players ?? []) as any[]}
      events={(events ?? []) as any[]}
    />
  );
}