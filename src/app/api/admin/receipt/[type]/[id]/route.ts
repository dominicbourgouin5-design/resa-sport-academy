import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateReceiptPDF } from '@/lib/pdf/receipt';
import { getCurrentProfile } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  // ═══ Auth ═══
  const profile = await getCurrentProfile();
  if (!profile || !['admin', 'league_manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  }

  const { type, id } = await params;
  const supabase = createAdminClient();

  try {
    if (type === 'camp') {
      const { data: reg } = await supabase
        .from('camp_registrations')
        .select('*, camp:camps(title_fr, date_start, location, price_amount)')
        .eq('id', id)
        .single();

      if (!reg) {
        return NextResponse.json({ error: 'Inscription introuvable' }, { status: 404 });
      }

      const camp = reg.camp as any;
      const pdf = await generateReceiptPDF({
        type: 'camp',
        reference: reg.payment_reference ?? `RESA-${reg.id.slice(0, 8).toUpperCase()}`,
        date: reg.paid_at ?? new Date().toISOString(),
        amount: Number(reg.payment_amount ?? camp?.price_amount ?? 0),
        currency: reg.payment_currency ?? 'XOF',
        method: reg.payment_method ?? undefined,
        clientName: reg.parent_name,
        clientEmail: reg.parent_email,
        clientPhone: reg.parent_phone ?? undefined,
        campTitle: camp?.title_fr ?? 'Camp RESA',
        campDate: camp?.date_start ?? undefined,
        campLocation: camp?.location ?? undefined,
        playerName: reg.player_name,
        playerAge: reg.player_age ?? undefined
      });

      return new NextResponse(Buffer.from(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="recu-camp-${id.slice(0, 8)}.pdf"`
        }
      });
    }

    if (type === 'training') {
      const { data: req } = await supabase
        .from('training_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (!req) {
        return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
      }

      const pdf = await generateReceiptPDF({
        type: 'training',
        reference: req.payment_reference ?? `RESA-${req.id.slice(0, 8).toUpperCase()}`,
        date: req.paid_at ?? new Date().toISOString(),
        amount: Number(req.payment_amount ?? 0),
        currency: req.payment_currency ?? 'XOF',
        method: req.payment_method ?? undefined,
        clientName: req.parent_name,
        clientEmail: req.parent_email,
        clientPhone: req.parent_phone ?? undefined,
        programTitle: req.program_title ?? undefined,
        playerName: req.player_name ?? undefined,
        playerAge: req.player_age ?? undefined,
        coach: req.preferred_coach ?? undefined,
        availability: req.availability ?? undefined
      });

      return new NextResponse(Buffer.from(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="recu-training-${id.slice(0, 8)}.pdf"`
        }
      });
    }

    return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
  } catch (err: any) {
    console.error('[Admin Receipt] Error:', err);
    return NextResponse.json({ error: err.message ?? 'Erreur' }, { status: 500 });
  }
}