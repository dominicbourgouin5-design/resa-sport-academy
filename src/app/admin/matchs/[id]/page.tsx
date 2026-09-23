import { createClient } from '@/lib/supabase/server';
import { getActiveSeason, getCategories } from '@/lib/queries';
import { notFound } from 'next/navigation';
import MatchForm from '../MatchForm';

export default async function EditMatchPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const season = await getActiveSeason();
  const categories = await getCategories();

  const supabase = await createClient();

  const [matchRes, teamsRes] = await Promise.all([
    supabase.from('matches').select('*').eq('id', id).single(),
    supabase
      .from('teams')
      .select(`
        id, name,
        category:categories(id, code),
        school:schools(id, name)
      `)
      .eq('season_id', season?.id ?? '')
      .eq('is_active', true)
      .order('name')
  ]);

  if (!matchRes.data) notFound();

  return (
    <MatchForm
      match={matchRes.data}
      season={season}
      categories={categories}
      teams={(teamsRes.data ?? []) as any[]}
    />
  );
}