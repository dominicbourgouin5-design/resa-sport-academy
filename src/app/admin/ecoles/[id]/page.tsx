import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import SchoolForm from '../SchoolForm';

export default async function EditSchoolPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('id', id)
    .single();

  if (!school) notFound();

  // Saison active + comptage forfaits actuels de cette école
  const { data: season } = await supabase
    .from('seasons')
    .select('id, name_fr')
    .eq('is_active', true)
    .maybeSingle();

  let forfeitCount = 0;
  if (season) {
    const { data: teams } = await supabase
      .from('teams')
      .select('id')
      .eq('school_id', school.id)
      .eq('season_id', season.id);

    const teamIds = (teams ?? []).map((t: any) => t.id);

    if (teamIds.length > 0) {
      const { count } = await supabase
        .from('matches')
        .select('id', { count: 'exact', head: true })
        .eq('season_id', season.id)
        .in('status', ['forfeit_home', 'forfeit_away'])
        .or(
          teamIds
            .flatMap((tid) => [`home_team_id.eq.${tid}`, `away_team_id.eq.${tid}`])
            .join(',')
        );

      forfeitCount = count ?? 0;
    }
  }

  return (
    <SchoolForm
      school={school}
      activeSeason={season ? { id: season.id, name: season.name_fr } : null}
      forfeitCount={forfeitCount}
    />
  );
}