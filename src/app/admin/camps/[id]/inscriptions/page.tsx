export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Collapsible from '@/components/admin/Collapsible';
import CampRegistrationsTable from './CampRegistrationsTable';
import CampRegistrationsRealtime from '@/components/admin/CampRegistrationsRealtime';
import NewCampRegistrationButton from '@/components/admin/NewCampRegistrationButton';

export default async function CampRegistrationsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: camp } = await supabase
    .from('camps')
    .select('id, title_fr, slug, date_start, location, price_fr, price_amount, price_amount_usd')
    .eq('id', id)
    .single();

  if (!camp) notFound();

  const { data: registrations } = await supabase
    .from('camp_registrations')
    .select('*')
    .eq('camp_id', id)
    .order('created_at', { ascending: false })
    .limit(100);

  const list = (registrations ?? []) as any[];

  // ═══════════════════════════════════════════════════════════
  // Nouvelle logique de filtrage (validée)
  // ═══════════════════════════════════════════════════════════
  const isPaid = (r: any) =>
    r.payment_status === 'paid' || !!r.paid_at;

  const isCancelled = (r: any) => r.status === 'cancelled';

  // En attente : statut 'new', non payé, non annulé
  const pending = list.filter((r) =>
    !isPaid(r) &&
    !isCancelled(r) &&
    r.status === 'new'
  );

  // Contacté : statut 'contacted' non payé, OU 'confirmed' non payé
  const contacted = list.filter((r) =>
    !isPaid(r) &&
    !isCancelled(r) &&
    (r.status === 'contacted' || r.status === 'confirmed')
  );

  // Réservé : payé ET statut 'confirmed'
  const reserved = list.filter((r) =>
    isPaid(r) &&
    !isCancelled(r) &&
    r.status === 'confirmed'
  );

  // Annulé
  const cancelled = list.filter((r) => isCancelled(r));

  const total = list.length;

  return (
    <div className="mx-auto max-w-6xl">

      <CampRegistrationsRealtime campId={id} />

      <div className="mb-6 text-[11px] text-resa-text/50">
        <Link href="/admin/camps" className="hover:text-resa-red">
          Camps & Tryouts
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-resa-navy">Inscriptions</span>
      </div>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Inscriptions — {camp.title_fr}
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            {total} inscription(s) · {reserved.length} payée(s)
          </p>
        </div>
        <NewCampRegistrationButton camp={camp} />
      </div>

      {/* Stats rapides */}
      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <StatCard label="En attente" value={pending.length} accent="amber" />
        <StatCard label="Contactés" value={contacted.length} accent="royal" />
        <StatCard label="Réservés" value={reserved.length} accent="emerald" />
        <StatCard label="Annulés" value={cancelled.length} accent="red" />
      </div>

      <div className="space-y-4">
        <Collapsible
          title="En attente"
          subtitle="Nouvelles inscriptions à traiter"
          icon="⏳"
          accent="amber"
          defaultOpen={true}
          badge={pending.length}
        >
          <CampRegistrationsTable key="pending" registrations={pending} camp={camp} />
        </Collapsible>

        {contacted.length > 0 && (
          <Collapsible
            title="Contactés"
            subtitle="En cours de traitement (paiement non finalisé)"
            icon="📞"
            accent="navy"
            defaultOpen={false}
            badge={contacted.length}
          >
            <CampRegistrationsTable key="contacted" registrations={contacted} camp={camp} />
          </Collapsible>
        )}

        {reserved.length > 0 && (
          <Collapsible
            title="Réservés"
            subtitle="Inscriptions confirmées et payées"
            icon="✅"
            accent="navy"
            defaultOpen={false}
            badge={reserved.length}
          >
            <CampRegistrationsTable key="reserved" registrations={reserved} camp={camp} />
          </Collapsible>
        )}

        {cancelled.length > 0 && (
          <Collapsible
            title="Annulés"
            subtitle="Inscriptions sans suite"
            icon="✕"
            accent="amber"
            defaultOpen={false}
            badge={cancelled.length}
          >
            <CampRegistrationsTable key="cancelled" registrations={cancelled} camp={camp} />
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