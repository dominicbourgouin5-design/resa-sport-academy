export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import { createClient } from '@/lib/supabase/server';
import Collapsible from '@/components/admin/Collapsible';
import TrainingRequestsTable from './TrainingRequestsTable';
import TrainingRequestsRealtime from '@/components/admin/TrainingRequestsRealtime';


export default async function AdminTrainingRequestsPage() {
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from('training_requests')
    .select('*')
    .order('created_at', { ascending: false });

  const list = (requests ?? []) as any[];
  const total       = list.length;
  const pending     = list.filter((r) => r.status === 'pending');
  const contacted   = list.filter((r) => r.status === 'contacted');
  const booked      = list.filter((r) => r.status === 'booked');
  const cancelled   = list.filter((r) => r.status === 'cancelled');

  return (
    <div className="mx-auto max-w-6xl">

      {/* Realtime auto-refresh */}
      <TrainingRequestsRealtime />

      {/* Header */}

      <div className="mb-8">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
          Private Training
        </div>
        <h1 className="font-display text-3xl font-black text-resa-navy">
          Demandes de réservation
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          {total} demande(s) · {pending.length} en attente · {booked.length} réservée(s)
        </p>
      </div>

      {/* Stats rapides */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <StatCard label="En attente"   value={pending.length}   accent="amber" />
        <StatCard label="Contactées"   value={contacted.length} accent="royal" />
        <StatCard label="Réservées"    value={booked.length}    accent="emerald" />
        <StatCard label="Annulées"     value={cancelled.length} accent="red" />
      </div>

      {/* Collapsibles */}
      <div className="space-y-4">
        <Collapsible
          title="En attente"
          subtitle="Nouvelles demandes à traiter"
          icon="⏳"
          accent="amber"
          defaultOpen={true}
          badge={pending.length}
        >
          <TrainingRequestsTable requests={pending} />
        </Collapsible>

        {contacted.length > 0 && (
          <Collapsible
            title="Contactées"
            subtitle="Demandes en cours de traitement"
            icon="📞"
            accent="navy"
            defaultOpen={false}
            badge={contacted.length}
          >
            <TrainingRequestsTable requests={contacted} />
          </Collapsible>
        )}

        {booked.length > 0 && (
          <Collapsible
            title="Réservées"
            subtitle="Séances confirmées"
            icon="✅"
            accent="navy"
            defaultOpen={false}
            badge={booked.length}
          >
            <TrainingRequestsTable requests={booked} />
          </Collapsible>
        )}

        {cancelled.length > 0 && (
          <Collapsible
            title="Annulées"
            subtitle="Demandes sans suite"
            icon="✕"
            accent="amber"
            defaultOpen={false}
            badge={cancelled.length}
          >
            <TrainingRequestsTable requests={cancelled} />
          </Collapsible>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent
}: {
  label: string;
  value: number;
  accent: 'amber' | 'royal' | 'emerald' | 'red';
}) {
  const colors = {
    amber:   'from-amber-500/10 border-amber-200',
    royal:   'from-resa-royal/10 border-resa-royal/20',
    emerald: 'from-emerald-500/10 border-emerald-200',
    red:     'from-resa-red/10 border-resa-red/20'
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br ${colors[accent]} to-transparent p-4`}>
      <div className="font-display text-3xl font-black text-resa-navy">
        {value}
      </div>
      <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
        {label}
      </div>
    </div>
  );
}