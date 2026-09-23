import { createClient } from '@/lib/supabase/server';
import { getActiveSeason } from '@/lib/queries';
import Link from 'next/link';
import Collapsible from '@/components/admin/Collapsible';
import TeamsTable from './TeamsTable';

export default async function AdminTeamsPage() {
  const supabase = await createClient();
  const season = await getActiveSeason();

  const { data: teams } = await supabase
    .from('teams')
    .select(`
      id, name, group_name, coach_name, is_active,
      category:categories(id, code, sort_order),
      school:schools(id, name, slug)
    `)
    .eq('season_id', season?.id ?? '')
    .order('name');

   // Groupes par catégorie
  const byCat: Record<string, any[]> = {};
  for (const t of (teams ?? []) as any[]) {
    const code = t.category?.code ?? 'Autres';
    (byCat[code] ??= []).push(t);
  }

  const catOrder = ['U7', 'U9', 'U11', 'Autres'];
  const catLabels: Record<string, string> = {
    U7: 'U7 — Moins de 7 ans',
    U9: 'U9 — Moins de 9 ans',
    U11: 'U11 — Moins de 11 ans',
    Autres: 'Équipes sans catégorie'
  };
  const catIcons: Record<string, string> = {
    U7: '🟦',
    U9: '🟥',
    U11: '⬛',
    Autres: '⚪'
  };
  const catAccents: Record<string, 'red' | 'royal' | 'navy' | 'emerald' | 'amber'> = {
    U7: 'royal',
    U9: 'red',
    U11: 'navy',
    Autres: 'amber'
  };

  const total = teams?.length ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
            Saison {season?.name_fr ?? '2027'}
          </div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Équipes
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            {total} équipe(s) engagée(s) dans la saison
          </p>
        </div>
      </div>

      {/* Sections par catégorie */}
      <div className="space-y-4">
        {catOrder.map((code) => {
          const list = byCat[code] ?? [];
          if (list.length === 0) return null;

          return (
            <Collapsible
              key={code}
              title={catLabels[code]}
              subtitle={`${list.length} équipe(s)`}
              icon={catIcons[code]}
              accent={catAccents[code]}
              defaultOpen={code === 'U7'}
              badge={list.length}
            >
              <TeamsTable teams={list} />
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}