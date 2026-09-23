import { createClient } from '@/lib/supabase/server';
import { getActiveSeason, getCategories } from '@/lib/queries';
import MatchForm from '../MatchForm';

export default async function NewMatchPage() {
  const season = await getActiveSeason();
  const categories = await getCategories();

  const supabase = await createClient();
  const { data: teams } = await supabase
    .from('teams')
    .select(`
      id, name,
      category:categories(id, code),
      school:schools(id, name)
    `)
    .eq('season_id', season?.id ?? '')
    .eq('is_active', true)
    .order('name');

  return (
    <MatchForm
      season={season}
      categories={categories}
      teams={(teams ?? []) as any[]}
    />
  );
}