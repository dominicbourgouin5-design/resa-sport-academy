import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Collapsible from '@/components/admin/Collapsible';
import CampsTable from './CampsTable';

export default async function AdminCampsPage() {
  const supabase = await createClient();

  const { data: camps } = await supabase
    .from('camps')
    .select('*')
    .order('date_start', { ascending: false });

  const list = (camps ?? []) as any[];
  const today = new Date().toISOString().slice(0, 10);

  const upcoming = list.filter((c) => (c.date_end ?? c.date_start) >= today);
  const past = list.filter((c) => (c.date_end ?? c.date_start) < today);
  const inactive = list.filter((c) => !c.is_active);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
            Événements
          </div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Camps & Tryouts
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            {list.length} événement(s) · {upcoming.length} à venir
          </p>
        </div>

        <Link
          href="/admin/camps/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-resa-red px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700"
        >
          + Nouveau camp / tryout
        </Link>
      </div>

      <div className="space-y-4">
        <Collapsible
          title="À venir"
          subtitle="Camps et tryouts à venir"
          icon="📅"
          accent="emerald"
          defaultOpen={true}
          badge={upcoming.filter((c) => c.is_active).length}
        >
          <CampsTable camps={upcoming.filter((c) => c.is_active)} />
        </Collapsible>

        {inactive.length > 0 && (
          <Collapsible
            title="Inactifs"
            subtitle="Camps masqués du site"
            icon="⏸️"
            accent="amber"
            defaultOpen={false}
            badge={inactive.length}
          >
            <CampsTable camps={inactive} />
          </Collapsible>
        )}

        {past.length > 0 && (
          <Collapsible
            title="Passés"
            subtitle="Historique"
            icon="📁"
            accent="navy"
            defaultOpen={false}
            badge={past.length}
          >
            <CampsTable camps={past} />
          </Collapsible>
        )}
      </div>
    </div>
  );
}