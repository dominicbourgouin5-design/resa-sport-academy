import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/auth';
import { EXPORT_CONFIG, buildCsv } from '@/lib/export-columns';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile || !['admin', 'league_manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { entity } = await params;
  const config = EXPORT_CONFIG[entity];
  if (!config) {
    return NextResponse.json({ error: 'Entité invalide' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');

  const supabase = createAdminClient();

  const dateColumn = config.dateColumn ?? 'created_at';

  let query: any = supabase
    .from(config.table)
    .select(config.select ?? '*');

  if (config.orderBy) {
    query = query.order(config.orderBy.column, {
      ascending: config.orderBy.ascending ?? false
    });
  }

  if (dateFrom) {
    query = query.gte(dateColumn, `${dateFrom}T00:00:00.000Z`);
  }
  if (dateTo) {
    query = query.lte(dateColumn, `${dateTo}T23:59:59.999Z`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = buildCsv(config, data ?? []);

  const filename = `resa-${entity}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}