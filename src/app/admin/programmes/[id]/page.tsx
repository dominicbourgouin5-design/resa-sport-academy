import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProgramForm from '../ProgramForm';

export default async function EditProgramPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: program } = await supabase
    .from('training_programs')
    .select('*')
    .eq('id', id)
    .single();

  if (!program) notFound();

  return <ProgramForm program={program} />;
}