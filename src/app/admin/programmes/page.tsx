import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Collapsible from '@/components/admin/Collapsible';
import ProgramsTable from './ProgramsTable';

export default async function AdminProgramsPage() {
  const supabase = await createClient();

  const { data: programs } = await supabase
    .from('training_programs')
    .select('*')
    .order('display_order');

  const list = (programs ?? []) as any[];
  const total = list.length;
  const activeCount = list.filter((p) => p.is_active).length;
  const inactiveCount = total - activeCount;

  return (
    <div className="mx-auto max-w-6xl">

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
            Private Training
          </div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Programmes
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            {total} programme(s) · {activeCount} actif(s)
          </p>
        </div>

        <Link
          href="/admin/programmes/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-resa-red px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700"
        >
          + Nouveau programme
        </Link>
      </div>

      <div className="space-y-4">
        <Collapsible
          title="Programmes actifs"
          subtitle={`${activeCount} programme(s) visible(s) sur le site`}
          icon="⚽"
          accent="navy"
          defaultOpen={true}
          badge={activeCount}
        >
          <ProgramsTable programs={list.filter((p) => p.is_active)} />
        </Collapsible>

        {inactiveCount > 0 && (
          <Collapsible
            title="Programmes inactifs"
            subtitle={`${inactiveCount} programme(s) masqué(s)`}
            icon="⏸️"
            accent="amber"
            defaultOpen={false}
            badge={inactiveCount}
          >
            <ProgramsTable programs={list.filter((p) => !p.is_active)} />
          </Collapsible>
        )}
      </div>
    </div>
  );
}