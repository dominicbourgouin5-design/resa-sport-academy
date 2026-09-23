import { setRequestLocale } from 'next-intl/server';
import { getSchools } from '@/lib/queries';
import SchoolsList from './SchoolsList';

export default async function SchoolsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const schools = await getSchools();
  return <SchoolsList schools={schools} />;
}