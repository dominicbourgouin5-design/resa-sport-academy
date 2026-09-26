export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CampRegistrationsTable from './CampRegistrationsTable';
import CampRegistrationsRealtime from '@/components/admin/CampRegistrationsRealtime';

export default async function CampRegistrationsPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: camp } = await supabase
    .from('camps')
    .select('id, title_fr, slug, date_start, location, price_fr, price_amount')
    .eq('id', id)
    .single();

  if (!camp) notFound();

  const { data: registrations } = await supabase
    .from('camp_registrations')
    .select('*')
    .eq('camp_id', id)
    .order('created_at', { ascending: false });

  const list = (registrations ?? []) as any[];

  return (
    <div className="mx-auto max-w-6xl">

      {/* ⚡ Auto-refresh temps réel */}
      <CampRegistrationsRealtime campId={id} />

      <div className="mb-6 text-[11px] text-resa-text/50">
        <Link href="/admin/camps" className="hover:text-resa-red">
          Camps & Tryouts
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-resa-navy">Inscriptions</span>
      </div>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-resa-navy">
          Inscriptions — {camp.title_fr}
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          {list.length} inscription(s) · {list.filter((r) => r.payment_status === 'paid').length} payée(s)
        </p>
      </div>

      <CampRegistrationsTable registrations={list} camp={camp} />
    </div>
  );
}