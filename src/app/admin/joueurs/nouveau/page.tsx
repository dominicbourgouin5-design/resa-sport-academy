import { createClient } from '@/lib/supabase/server';
import { getActiveSeason } from '@/lib/queries';
import PlayerForm from '../PlayerForm';

export default async function NewPlayerPage({
  searchParams
}: {
  searchParams: Promise<{ team?: string }>;
}) {
  const { team } = await searchParams;
  const season = await getActiveSeason();

  const supabase = await createClient();
  const { data: teams } = await supabase
    .from('teams')
    .select(`
      id,
      category:categories(id, code, sort_order),
      school:schools(id, name)
    `)
    .eq('season_id', season?.id ?? '')
    .eq('is_active', true)
    .order('name');

  return (
    <PlayerForm
      teams={(teams ?? []) as any[]}
      preselectedTeamId={team}
    />
  );
}