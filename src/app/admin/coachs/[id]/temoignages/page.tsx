import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import TestimonialsManager from './TestimonialsManager';

export default async function CoachTestimonialsPage({
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

  const { data: testimonials } = await supabase
    .from('coach_testimonials')
    .select('*')
    .eq('coach_id', id)
    .order('is_featured', { ascending: false })
    .order('display_order');

  return (
    <TestimonialsManager
      coach={coach}
      testimonials={(testimonials ?? []) as any[]}
    />
  );
}