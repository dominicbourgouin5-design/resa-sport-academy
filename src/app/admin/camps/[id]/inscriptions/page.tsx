export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import RequestsListManager from '@/components/admin/RequestsListManager';
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

  const [pendingRes, contactedRes, reservedRes, cancelledRes] = await Promise.all([
    supabase.from('camp_registrations').select('id', { count: 'exact', head: true })
      .eq('camp_id', id).eq('status', 'new').neq('payment_status', 'paid').is('paid_at', null),
    supabase.from('camp_registrations').select('id', { count: 'exact', head: true })
      .eq('camp_id', id).or(`status.eq.contacted,and(status.eq.confirmed,payment_status.neq.paid)`).is('paid_at', null),
    supabase.from('camp_registrations').select('id', { count: 'exact', head: true })
      .eq('camp_id', id).eq('status', 'confirmed').eq('payment_status', 'paid'),
    supabase.from('camp_registrations').select('id', { count: 'exact', head: true })
      .eq('camp_id', id).eq('status', 'cancelled')
  ]);

  const initialCounts = {
    pending: pendingRes.count ?? 0,
    contacted: contactedRes.count ?? 0,
    reserved: reservedRes.count ?? 0,
    cancelled: cancelledRes.count ?? 0
  };

  return (
    <div className="mx-auto max-w-6xl">
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
            {initialCounts.pending + initialCounts.contacted + initialCounts.reserved + initialCounts.cancelled} inscription(s)
          </p>
        </div>
        <NewCampRegistrationButton camp={camp} />
      </div>

      <RequestsListManager type="camp" campId={id} camp={camp} initialCounts={initialCounts} />
    </div>
  );
}