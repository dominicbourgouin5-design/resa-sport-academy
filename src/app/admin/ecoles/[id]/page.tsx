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

  return <SchoolForm school={school} />;
}