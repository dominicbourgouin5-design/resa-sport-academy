import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import Collapsible from '@/components/admin/Collapsible';
import RegistrationsTable from './RegistrationsTable';
import ListFiltersBar from '@/components/admin/ListFiltersBar';

export const dynamic = 'force-dynamic';

const STATUS_CONFIG: Record<string, {
  label: string;
  subtitle: string;
  accent: 'red' | 'royal' | 'navy' | 'emerald' | 'amber';
  icon: string;
  order: number;
}> = {
  pending:   { label: 'En attente',   subtitle: 'Demandes à traiter',          accent: 'amber',   icon: '⏳', order: 1 },
  reviewing: { label: 'En cours',     subtitle: "Demandes en cours d'examen",   accent: 'royal',   icon: '👀', order: 2 },
  approved:  { label: 'Approuvées',   subtitle: 'Demandes validées',           accent: 'emerald', icon: '✅', order: 3 },
  rejected:  { label: 'Refusées',     subtitle: 'Demandes non retenues',       accent: 'red',     icon: '❌', order: 4 }
};

export default async function AdminRegistrationsPage({
  searchParams
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const { dateFrom, dateTo } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from('registrations').select('*');

  if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`);
  if (dateTo)   query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);

  const { data: registrations } = await query
    .order('created_at', { ascending: false })
    .limit(500);

  const list = (registrations ?? []) as any[];

  const byStatus: Record<string, any[]> = {};
  for (const r of list) {
    const status = r.status ?? 'pending';
    (byStatus[status] ??= []).push(r);
  }

  const total = list.length;
  const pendingCount = byStatus['pending']?.length ?? 0;

  return (
    <div className="mx-auto max-w-6xl">

      <div className="mb-8">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
          Établissements
        </div>
        <h1 className="font-display text-3xl font-black text-resa-navy">
          Inscriptions
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          {total} demande(s) · {pendingCount} en attente de traitement
        </p>
      </div>

      <Suspense fallback={<div className="mb-4 h-[76px] animate-pulse rounded-xl bg-resa-gray/40" />}>
        <ListFiltersBar entity="inscriptions" />
      </Suspense>

      {pendingCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-500 text-white text-sm">
            ⏳
          </span>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-amber-900">
              {pendingCount} demande(s) nécessite(nt) votre attention
            </div>
            <div className="text-[11px] text-amber-700">
              Cliquez sur la section ci-dessous pour les traiter.
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(STATUS_CONFIG)
          .sort((a, b) => a[1].order - b[1].order)
          .map(([status, config]) => {
            const statusList = byStatus[status] ?? [];
            if (statusList.length === 0) return null;

            return (
              <Collapsible
                key={status}
                title={config.label}
                subtitle={config.subtitle}
                icon={config.icon}
                accent={config.accent}
                defaultOpen={status === 'pending'}
                badge={statusList.length}
              >
                <RegistrationsTable
                  registrations={statusList}
                  currentStatus={status as 'pending' | 'reviewing' | 'approved' | 'rejected'}
                />
              </Collapsible>
            );
          })}

        {total === 0 && (
          <div className="rounded-xl border border-black/5 bg-white p-12 text-center shadow-sm">
            <div className="mb-3 text-4xl">📭</div>
            <p className="text-sm text-resa-text/60">
              Aucune inscription reçue pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}