import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Collapsible from '@/components/admin/Collapsible';
import SponsorsTable from './SponsorsTable';

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

export default async function AdminSponsorsPage() {
  const supabase = await createClient();

  const { data: sponsors } = await supabase
    .from('sponsors')
    .select('*')
    .order('tier')
    .order('sort_order');

  const list = (sponsors ?? []) as any[];

  // Groupes par tier
  const byTier: Record<string, any[]> = {};
  for (const s of list) {
    const tier = s.tier ?? 'official';
    (byTier[tier] ??= []).push(s);
  }

  const total = list.length;
  const activeCount = list.filter((s) => s.is_active).length;

  return (
    <div className="mx-auto max-w-6xl">

      {/* Header */}
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

      {/* Collapsibles par tier */}
      <div className="space-y-4">
        {Object.entries(TIER_CONFIG)
          .sort((a, b) => a[1].order - b[1].order)
          .map(([tier, config]) => {
            const list = byTier[tier] ?? [];
            if (list.length === 0) return null;

            return (
              <Collapsible
                key={tier}
                title={config.label}
                subtitle={config.subtitle}
                icon={config.icon}
                accent={config.accent}
                defaultOpen={tier === 'platinum' || tier === 'gold'}
                badge={list.length}
              >
                <SponsorsTable sponsors={list} tier={tier} />
              </Collapsible>
            );
          })}

        {/* Section sponsors non classés (au cas où) */}
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