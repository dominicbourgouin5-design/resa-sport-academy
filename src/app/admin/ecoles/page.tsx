import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Collapsible from '@/components/admin/Collapsible';
import SchoolsTable from './SchoolsTable';

export default async function AdminSchoolsPage() {
  const supabase = await createClient();

  const { data: schools } = await supabase
    .from('schools')
    .select(`
      id, slug, name, city, district,
      contact_name, contact_phone, contact_email,
      is_active,
      teams:teams(count)
    `)
    .order('name');

  const list = (schools ?? []) as any[];

  const total = list.length;
  const activeCount = list.filter((s) => s.is_active).length;
  const inactiveCount = total - activeCount;

  return (
    <div className="mx-auto max-w-6xl">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
            Établissements
          </div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Écoles
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            {total} école(s) enregistrée(s) · {activeCount} active(s)
          </p>
        </div>

        <Link
          href="/admin/ecoles/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-resa-red px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700"
        >
          + Nouvelle école
        </Link>
      </div>

      {/* Collapsibles par statut */}
      <div className="space-y-4">
        <Collapsible
          title="Écoles actives"
          subtitle={`${activeCount} établissement(s) engagé(s) dans la saison`}
          icon="🏫"
          accent="navy"
          defaultOpen={true}
          badge={activeCount}
        >
          <SchoolsTable schools={list.filter((s) => s.is_active)} />
        </Collapsible>

        {inactiveCount > 0 && (
          <Collapsible
            title="Écoles inactives"
            subtitle={`${inactiveCount} établissement(s) désactivé(s)`}
            icon="⏸️"
            accent="amber"
            defaultOpen={false}
            badge={inactiveCount}
          >
            <SchoolsTable schools={list.filter((s) => !s.is_active)} />
          </Collapsible>
        )}
      </div>
    </div>
  );
}