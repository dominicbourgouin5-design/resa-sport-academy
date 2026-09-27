import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Collapsible from '@/components/admin/Collapsible';
import PlayersView from './PlayersView';
import ListFiltersBar from '@/components/admin/ListFiltersBar';

export const dynamic = 'force-dynamic';

export default async function AdminPlayersPage({
  searchParams
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const { dateFrom, dateTo } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('players')
    .select(`
      id, first_name, last_initial, birth_date, jersey_number, position, photo_url, created_at,
      team:teams!inner(
        id, name,
        category:categories(id, code, sort_order),
        school:schools(id, name, slug)
      )
    `);

  if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`);
  if (dateTo)   query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);

  const { data: players } = await query
    .order('jersey_number', { ascending: true })
    .limit(500);

  const list = (players ?? []) as any[];

  const byCat: Record<string, any[]> = {};
  for (const p of list) {
    const code = (p.team as any)?.category?.code ?? 'Autres';
    (byCat[code] ??= []).push(p);
  }

  const CAT_ORDER = ['U7', 'U9', 'U11', 'Autres'];
  const CAT_LABELS: Record<string, string> = {
    U7: 'U7 — Moins de 7 ans',
    U9: 'U9 — Moins de 9 ans',
    U11: 'U11 — Moins de 11 ans',
    Autres: 'Sans catégorie'
  };
  const CAT_ACCENTS: Record<string, 'red' | 'royal' | 'navy' | 'amber'> = {
    U7: 'royal', U9: 'red', U11: 'navy', Autres: 'amber'
  };
  const CAT_ICONS: Record<string, string> = {
    U7: '🟦', U9: '🟥', U11: '⬛', Autres: '⚪'
  };

  return (
    <div className="mx-auto max-w-6xl">

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
            Compétition
          </div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Joueurs
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            {list.length} joueur(s) enregistré(s)
          </p>
        </div>

        <Link
          href="/admin/joueurs/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-resa-red px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700"
        >
          + Nouveau joueur
        </Link>
      </div>

      <Suspense fallback={<div className="mb-4 h-[76px] animate-pulse rounded-xl bg-resa-gray/40" />}>
        <ListFiltersBar entity="joueurs" />
      </Suspense>

      <div className="space-y-4">
        {CAT_ORDER.map((code) => {
          const catList = byCat[code] ?? [];
          if (catList.length === 0) return null;

          return (
            <Collapsible
              key={code}
              title={CAT_LABELS[code]}
              subtitle={`${catList.length} joueur(s)`}
              icon={CAT_ICONS[code]}
              accent={CAT_ACCENTS[code]}
              defaultOpen={code === 'U7'}
              badge={catList.length}
            >
              <PlayersView players={catList} />
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}