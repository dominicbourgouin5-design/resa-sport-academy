import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ═══ Helper : construit une query filtrée par section ═══
function applySectionFilter(query: any, type: string, section: string) {
  if (section === 'pending') {
    if (type === 'camp') {
      return query.eq('status', 'new').neq('payment_status', 'paid').is('paid_at', null);
    }
    return query.eq('status', 'pending').neq('payment_status', 'paid').is('paid_at', null);
  }
  if (section === 'contacted') {
    if (type === 'camp') {
      return query
        .or(`status.eq.contacted,and(status.eq.confirmed,payment_status.neq.paid)`)
        .is('paid_at', null);
    }
    return query
      .or(`status.eq.contacted,and(status.eq.booked,payment_status.neq.paid)`)
      .is('paid_at', null);
  }
  if (section === 'reserved') {
    if (type === 'camp') {
      return query.eq('status', 'confirmed').eq('payment_status', 'paid');
    }
    return query.eq('status', 'booked').eq('payment_status', 'paid');
  }
  if (section === 'cancelled') {
    return query.eq('status', 'cancelled');
  }
  return query;
}

// ═══ Helper : applique les filtres date + campId ═══
function applyDateFilters(
  query: any,
  dateFrom: string | null,
  dateTo: string | null,
  campId: string | null,
  type: string
) {
  let q = query;
  if (type === 'camp' && campId) {
    q = q.eq('camp_id', campId);
  }
  if (dateFrom) {
    q = q.gte('created_at', `${dateFrom}T00:00:00.000Z`);
  }
  if (dateTo) {
    q = q.lte('created_at', `${dateTo}T23:59:59.999Z`);
  }
  return q;
}

export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !['admin', 'league_manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const campId = searchParams.get('campId');
  const section = searchParams.get('section') ?? 'pending';
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 100);
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  if (type !== 'training' && type !== 'camp') {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  }
  if (type === 'camp' && !campId) {
    return NextResponse.json({ error: 'campId requis' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const table = type === 'camp' ? 'camp_registrations' : 'training_requests';

  // ═══ 1. Liste paginée de la section active ═══
  let listQuery: any = supabase
    .from(table)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  listQuery = applyDateFilters(listQuery, dateFrom, dateTo, campId, type);
  listQuery = applySectionFilter(listQuery, type, section);

  const { data, error, count } = await listQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ═══ 2. Counts des 4 sections (avec filtres date) ═══
  const sections: Array<'pending' | 'contacted' | 'reserved' | 'cancelled'> = [
    'pending', 'contacted', 'reserved', 'cancelled'
  ];

  const countsEntries = await Promise.all(
    sections.map(async (s) => {
      let q: any = supabase.from(table).select('id', { count: 'exact', head: true });
      q = applyDateFilters(q, dateFrom, dateTo, campId, type);
      q = applySectionFilter(q, type, s);
      const { count: c } = await q;
      return [s, c ?? 0] as const;
    })
  );

  const counts = Object.fromEntries(countsEntries);

  return NextResponse.json({
    data: data ?? [],
    total: count ?? 0,
    counts
  });
}