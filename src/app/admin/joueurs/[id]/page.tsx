import { createClient } from '@/lib/supabase/server';
import { getActiveSeason } from '@/lib/queries';
import { notFound } from 'next/navigation';
import PlayerForm from '../PlayerForm';

export default async function EditPlayerPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const season = await getActiveSeason();

  const supabase = await createClient();

  const [playerRes, teamsRes] = await Promise.all([
    supabase.from('players').select('*').eq('id', id).single(),
    supabase
      .from('teams')
      .select(`
        id,
        category:categories(id, code, sort_order),
        school:schools(id, name)
      `)
      .eq('season_id', season?.id ?? '')
      .eq('is_active', true)
      .order('name')
  ]);

  if (!playerRes.data) notFound();

  return (
    <PlayerForm
      player={playerRes.data}
      teams={(teamsRes.data ?? []) as any[]}
    />
  );
}