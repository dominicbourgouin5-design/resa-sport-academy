import { setRequestLocale } from 'next-intl/server';
import { getCategories } from '@/lib/queries';
import InscriptionForm from './InscriptionForm';

export default async function InscriptionsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { locale } = await params;
  const { mode } = await searchParams;
  setRequestLocale(locale);

  const categories = await getCategories();
  const initialMode = mode === 'individual' ? 'individual' : 'school';

  return <InscriptionForm categories={categories} initialMode={initialMode} />;
}