import { setRequestLocale } from 'next-intl/server';
import { getCategories } from '@/lib/queries';
import InscriptionForm from './InscriptionForm';

export default async function InscriptionsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const categories = await getCategories();
  return <InscriptionForm categories={categories} />;
}