import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import SponsorForm from '../SponsorForm';

export default async function EditSponsorPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: sponsor } = await supabase
    .from('sponsors')
    .select('*')
    .eq('id', id)
    .single();

  if (!sponsor) notFound();

  return <SponsorForm sponsor={sponsor} />;
}