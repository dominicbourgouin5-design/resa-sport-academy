import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import MediaManager from './MediaManager';

export default async function CoachMediaPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: coach } = await supabase
    .from('coaches')
    .select('id, name, slug')
    .eq('id', id)
    .single();

  if (!coach) notFound();

  const { data: media } = await supabase
    .from('coach_media')
    .select('*')
    .eq('coach_id', id)
    .order('display_order');

  return (
    <MediaManager coach={coach} media={(media ?? []) as any[]} />
  );
}