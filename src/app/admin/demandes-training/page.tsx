export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@/lib/supabase/server';
import RequestsListManager from '@/components/admin/RequestsListManager';
import NewTrainingRequestButton from '@/components/admin/NewTrainingRequestButton';

export default async function AdminTrainingRequestsPage() {
  const supabase = await createClient();

  const { data: programsData } = await supabase
    .from('training_programs')
    .select('slug, title_fr, display_order')
    .eq('is_active', true)
    .order('display_order');

  const programs = (programsData ?? []) as { slug: string; title_fr: string }[];

  const [pendingRes, contactedRes, reservedRes, cancelledRes] = await Promise.all([
    supabase.from('training_requests').select('id', { count: 'exact', head: true })
      .eq('status', 'pending').neq('payment_status', 'paid').is('paid_at', null),
    supabase.from('training_requests').select('id', { count: 'exact', head: true })
      .or(`status.eq.contacted,and(status.eq.booked,payment_status.neq.paid)`).is('paid_at', null),
    supabase.from('training_requests').select('id', { count: 'exact', head: true })
      .eq('status', 'booked').eq('payment_status', 'paid'),
    supabase.from('training_requests').select('id', { count: 'exact', head: true })
      .eq('status', 'cancelled')
  ]);

  const initialCounts = {
    pending: pendingRes.count ?? 0,
    contacted: contactedRes.count ?? 0,
    reserved: reservedRes.count ?? 0,
    cancelled: cancelledRes.count ?? 0
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
            Private Training
          </div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Demandes de réservation
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            {initialCounts.pending + initialCounts.contacted + initialCounts.reserved + initialCounts.cancelled} demande(s)
          </p>
        </div>
        <NewTrainingRequestButton programs={programs} />
      </div>

      <RequestsListManager type="training" initialCounts={initialCounts} />
    </div>
  );
}