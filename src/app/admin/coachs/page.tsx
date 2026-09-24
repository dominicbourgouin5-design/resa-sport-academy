import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Collapsible from '@/components/admin/Collapsible';
import CoachesTable from './CoachesTable';

export default async function AdminCoachesPage() {
  const supabase = await createClient();

  const { data: coaches } = await supabase
    .from('coaches')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('display_order');

  const list = (coaches ?? []) as any[];
  const total = list.length;
  const activeCount = list.filter((c) => c.is_active).length;
  const inactiveCount = total - activeCount;
  const featuredCount = list.filter((c) => c.is_featured).length;

  return (
    <div className="mx-auto max-w-6xl">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
            Équipe technique
          </div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Coachs
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            {total} coach(s) · {activeCount} actif(s) · {featuredCount} en vedette
          </p>
        </div>

        <Link
          href="/admin/coachs/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-resa-red px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700"
        >
          + Nouveau coach
        </Link>
      </div>

      {/* Collapsibles */}
      <div className="space-y-4">
        <Collapsible
          title="Coachs actifs"
          subtitle={`${activeCount} coach(s) visible(s) sur le site`}
          icon="👥"
          accent="navy"
          defaultOpen={true}
          badge={activeCount}
        >
          <CoachesTable coaches={list.filter((c) => c.is_active)} />
        </Collapsible>

        {inactiveCount > 0 && (
          <Collapsible
            title="Coachs inactifs"
            subtitle={`${inactiveCount} coach(s) masqué(s)`}
            icon="⏸️"
            accent="amber"
            defaultOpen={false}
            badge={inactiveCount}
          >
            <CoachesTable coaches={list.filter((c) => !c.is_active)} />
          </Collapsible>
        )}
      </div>
    </div>
  );
}