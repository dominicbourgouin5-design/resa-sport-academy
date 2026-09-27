import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// ═══ Helper CSV : échappe une valeur pour Excel FR (séparateur ;) ═══
function csvCell(v: any): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  // Si contient ; " \n ou retour chariot → on entoure de guillemets
  if (s.includes(';') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(values: any[]): string {
  return values.map(csvCell).join(';');
}

// Format date FR : 27/09/2026 14:32
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hh}:${mm}`;
  } catch {
    return '';
  }
}

const STATUS_LABELS_TRAINING: Record<string, string> = {
  pending: 'En attente',
  contacted: 'Contacté',
  booked: 'Réservé',
  cancelled: 'Annulé'
};

const STATUS_LABELS_CAMP: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  confirmed: 'Confirmé',
  cancelled: 'Annulé'
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échoué',
  refunded: 'Remboursé',
  cancelled: 'Annulé',
  none: '—'
};

export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !['admin', 'league_manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const campId = searchParams.get('campId');
  const section = searchParams.get('section') ?? 'all';
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

  // ═══ On récupère TOUT (pas de .range()) ═══
  let query: any = supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false });

  if (type === 'camp' && campId) {
    query = query.eq('camp_id', campId);
  }

  // Filtre période
  if (dateFrom) {
    query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`);
  }
  if (dateTo) {
    query = query.lte('created_at', `${dateTo}T23:59:59.999Z`);
  }

  // Filtre section
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
  // section === 'all' → pas de filtre section

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows: any[] = data ?? [];

  // ═══ En-têtes ═══
  const headers = [
    'ID',
    'Date création',
    'Statut',
    'Statut paiement',
    'Montant',
    'Devise',
    'Méthode paiement',
    'Date paiement',
    'Référence paiement',
    'Parent — Nom',
    'Parent — Email',
    'Parent — Téléphone',
    'Parent — Pays',
    'Joueur — Nom',
    'Joueur — Âge',
    type === 'camp' ? 'Camp' : 'Programme',
    'Notes parent',
    'Notes admin'
  ];

  // ═══ Lignes ═══
  const lines: string[] = [];
  lines.push(csvRow(headers));

  for (const r of rows) {
    const statusLabel = type === 'camp'
      ? (STATUS_LABELS_CAMP[r.status] ?? r.status ?? '')
      : (STATUS_LABELS_TRAINING[r.status] ?? r.status ?? '');

    const paymentLabel = PAYMENT_LABELS[r.payment_status] ?? r.payment_status ?? '';

    lines.push(csvRow([
      r.id,
      fmtDate(r.created_at),
      statusLabel,
      paymentLabel,
      r.payment_amount ?? '',
      r.payment_currency ?? '',
      r.payment_method ?? '',
      fmtDate(r.paid_at),
      r.payment_reference ?? '',
      r.parent_name ?? '',
      r.parent_email ?? '',
      r.parent_phone ?? '',
      r.parent_country ?? '',
      r.player_name ?? '',
      r.player_age ?? '',
      type === 'camp' ? r.camp_id : (r.program_title ?? ''),
      r.notes ?? '',
      r.admin_notes ?? ''
    ]));
  }

  // ═══ BOM UTF-8 (pour Excel FR) ═══
  const csv = '\uFEFF' + lines.join('\r\n');

  const filename = `resa-${type}-${section}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}