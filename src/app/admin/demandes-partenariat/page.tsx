export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createAdminClient } from '@/lib/supabase/admin';
import Collapsible from '@/components/admin/Collapsible';
import PartnerRequestsTable from './PartnerRequestsTable';

const STATUS_CONFIG: Record<string, {
  label: string;
  subtitle: string;
  accent: 'red' | 'royal' | 'navy' | 'emerald' | 'amber';
  icon: string;
  order: number;
}> = {
  pending:   { label: 'Nouvelles demandes',   subtitle: 'À traiter en priorité',              accent: 'amber',   icon: '⏳', order: 1 },
  contacted: { label: 'En cours de contact',  subtitle: 'Premier échange effectué',           accent: 'royal',   icon: '📞', order: 2 },
  validated: { label: 'Validées',             subtitle: 'Partenariat officiel validé',        accent: 'emerald', icon: '✅', order: 3 },
  suspended: { label: 'En suspens',           subtitle: 'Dossier temporairement en attente',  accent: 'navy',    icon: '⏸️', order: 4 },
  rejected:  { label: 'Refusées',             subtitle: 'Sans suite',                          accent: 'red',     icon: '❌', order: 5 }
};

export default async function AdminPartnerRequestsPage() {
  const supabase = createAdminClient();

  const { data: requests, error, count } = await supabase
    .from('sponsor_requests')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  console.log('[Admin Partner Requests] DEBUG:', {
    hasError: !!error,
    errorMessage: error?.message,
    count: count,
    dataLength: requests?.length,
    firstItem: requests?.[0]?.company_name
  });

  if (error) {
    console.error('[Admin Partner Requests] Supabase error:', error);
  }

  const list = (requests ?? []) as any[];

  // Group by status
  const byStatus: Record<string, any[]> = {};
  for (const r of list) {
    const s = r.status ?? 'pending';
    (byStatus[s] ??= []).push(r);
  }

  const total = list.length;
  const pendingCount = byStatus['pending']?.length ?? 0;

  return (
    <div className="mx-auto max-w-6xl">

      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
          Contenu
        </div>
        <h1 className="font-display text-3xl font-black text-resa-navy">
          Demandes de partenariat
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          {total} demande(s) · {pendingCount} nouvelle(s)
        </p>
      </div>

      {/* Alerte pending */}
      {pendingCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-500 text-white text-sm">
            ⏳
          </span>
          <div className="flex-1">
            <div className="text-[13px] font-bold text-amber-900">
              {pendingCount} demande(s) en attente de traitement
            </div>
            <div className="text-[11px] text-amber-700">
              Cliquez sur la section ci-dessous pour les traiter.
            </div>
          </div>
        </div>
      )}

      {/* Collapsibles par statut */}
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
                <PartnerRequestsTable
                  requests={statusList}
                  currentStatus={status}
                />
              </Collapsible>
            );
          })}

        {total === 0 && (
          <div className="rounded-xl border border-black/5 bg-white p-12 text-center shadow-sm">
            <div className="mb-3 text-4xl">📭</div>
            <p className="text-sm text-resa-text/60">
              Aucune demande de partenariat pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}