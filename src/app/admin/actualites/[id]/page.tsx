import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import NewsForm from '../NewsForm';

export default async function EditNewsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .single();

  if (!article) notFound();

  return <NewsForm article={article} />;
}