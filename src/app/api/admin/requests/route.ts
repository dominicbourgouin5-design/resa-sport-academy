import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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

  if (type !== 'training' && type !== 'camp') {
    return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  }
  if (type === 'camp' && !campId) {
    return NextResponse.json({ error: 'campId requis' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const table = type === 'camp' ? 'camp_registrations' : 'training_requests';

  let query: any = supabase
    .from(table)
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (type === 'camp' && campId) {
    query = query.eq('camp_id', campId);
  }

  if (section === 'pending') {
    if (type === 'camp') {
      query = query.eq('status', 'new').neq('payment_status', 'paid').is('paid_at', null);
    } else {
      query = query.eq('status', 'pending').neq('payment_status', 'paid').is('paid_at', null);
    }
  } else if (section === 'contacted') {
    if (type === 'camp') {
      query = query
        .or(`status.eq.contacted,and(status.eq.confirmed,payment_status.neq.paid)`)
        .is('paid_at', null);
    } else {
      query = query
        .or(`status.eq.contacted,and(status.eq.booked,payment_status.neq.paid)`)
        .is('paid_at', null);
    }
  } else if (section === 'reserved') {
    if (type === 'camp') {
      query = query.eq('status', 'confirmed').eq('payment_status', 'paid');
    } else {
      query = query.eq('status', 'booked').eq('payment_status', 'paid');
    }
  } else if (section === 'cancelled') {
    query = query.eq('status', 'cancelled');
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [], total: count ?? 0 });
}