import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import TeamForm from '../TeamForm';

export default async function EditTeamPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: team } = await supabase
    .from('teams')
    .select(`
      *,
      category:categories(id, code),
      school:schools(id, name)
    `)
    .eq('id', id)
    .single();

  if (!team) notFound();

  return <TeamForm team={team} />;
}