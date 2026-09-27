import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Collapsible from '@/components/admin/Collapsible';
import SponsorsTable from './SponsorsTable';
import ListFiltersBar from '@/components/admin/ListFiltersBar';

export const dynamic = 'force-dynamic';

const TIER_CONFIG: Record<string, {
  label: string;
  subtitle: string;
  accent: 'red' | 'royal' | 'navy' | 'emerald' | 'amber';
  icon: string;
  order: number;
}> = {
  platinum: { label: 'Platinum', subtitle: 'Partenaires principaux',    accent: 'navy',    icon: '💎', order: 1 },
  gold:     { label: 'Gold',     subtitle: 'Partenaires majeurs',       accent: 'amber',   icon: '🥇', order: 2 },
  silver:   { label: 'Silver',   subtitle: 'Partenaires officiels',     accent: 'royal',   icon: '🥈', order: 3 },
  official: { label: 'Officiel', subtitle: 'Partenaires de la Ligue',   accent: 'emerald', icon: '🤝', order: 4 }
};

export default async function AdminSponsorsPage({
  searchParams
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const { dateFrom, dateTo } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from('sponsors').select('*');

  if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`);
  if (dateTo)   query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);

  const { data: sponsors } = await query
    .order('tier')
    .order('sort_order')
    .limit(500);

  const list = (sponsors ?? []) as any[];

  const byTier: Record<string, any[]> = {};
  for (const s of list) {
    const tier = s.tier ?? 'official';
    (byTier[tier] ??= []).push(s);
  }

  const total = list.length;
  const activeCount = list.filter((s) => s.is_active).length;

  return (
    <div className="mx-auto max-w-6xl">

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
            Contenu
          </div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Sponsors & Partenaires
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            {total} partenaire(s) · {activeCount} actif(s)
          </p>
        </div>

        <Link
          href="/admin/sponsors/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-resa-red px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700"
        >
          + Nouveau partenaire
        </Link>
      </div>

      <Suspense fallback={<div className="mb-4 h-[76px] animate-pulse rounded-xl bg-resa-gray/40" />}>
        <ListFiltersBar entity="sponsors" />
      </Suspense>

      <div className="space-y-4">
        {Object.entries(TIER_CONFIG)
          .sort((a, b) => a[1].order - b[1].order)
          .map(([tier, config]) => {
            const tierList = byTier[tier] ?? [];
            if (tierList.length === 0) return null;

            return (
              <Collapsible
                key={tier}
                title={config.label}
                subtitle={config.subtitle}
                icon={config.icon}
                accent={config.accent}
                defaultOpen={tier === 'platinum' || tier === 'gold'}
                badge={tierList.length}
              >
                <SponsorsTable sponsors={tierList} tier={tier} />
              </Collapsible>
            );
          })}

        {byTier['other']?.length > 0 && (
          <Collapsible
            title="Autres"
            subtitle="Sponsors sans niveau défini"
            icon="❓"
            accent="red"
            defaultOpen={false}
            badge={byTier['other'].length}
          >
            <SponsorsTable sponsors={byTier['other']} tier="other" />
          </Collapsible>
        )}
      </div>
    </div>
  );
}