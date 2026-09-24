import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CampForm from '../CampForm';

export default async function EditCampPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: camp } = await supabase
    .from('camps')
    .select('*')
    .eq('id', id)
    .single();

  if (!camp) notFound();
  return <CampForm camp={camp} />;
}