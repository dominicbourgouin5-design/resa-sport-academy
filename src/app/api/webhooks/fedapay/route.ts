import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  sendCampSuccessEmails,
  sendCampFailureEmails
} from '@/lib/camp-emails';
import {
  getFedaPayTransaction,
  isPaidStatus,
  isFailedStatus
} from '@/lib/payments/fedapay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[FedaPay Webhook] Event:', JSON.stringify(body).slice(0, 300));

    const txId: number | undefined =
      body?.entity?.id ?? body?.data?.id ?? body?.id;

    if (!txId) {
      return NextResponse.json({ ok: true, ignored: 'no_tx_id' });
    }

    // Récupérer l'état réel auprès de FedaPay
    const tx = await getFedaPayTransaction(txId);
    console.log('[FedaPay Webhook] TX status:', tx.status, 'ID:', tx.id);

    const supabase = createAdminClient();

    const { data: reg } = await supabase
      .from('camp_registrations')
      .select('id, payment_status, camp_id')
      .eq('payment_provider_id', String(txId))
      .single();

    if (!reg) {
      return NextResponse.json({ ok: true, ignored: 'no_registration' });
    }

    // ─── CAS SUCCÈS ───
    if (isPaidStatus(tx.status)) {
      // Idempotence : déjà payé → skip total
      if (reg.payment_status === 'paid') {
        return NextResponse.json({ ok: true, ignored: 'already_paid' });
      }

      await supabase
        .from('camp_registrations')
        .update({
          payment_status: 'paid',
          payment_method: tx.mode ?? 'fedapay',
          payment_reference: tx.reference ?? null,
          paid_at: new Date().toISOString()
        })
        .eq('id', reg.id);

      await sendCampSuccessEmails(reg.id);

      return NextResponse.json({ ok: true, action: 'paid' });
    }

    // ─── CAS ÉCHEC ───
    if (isFailedStatus(tx.status)) {
      // Idempotence : déjà marqué failed → skip
      if (reg.payment_status === 'failed') {
        return NextResponse.json({ ok: true, ignored: 'already_failed' });
      }

      await supabase
        .from('camp_registrations')
        .update({ payment_status: 'failed' })
        .eq('id', reg.id);

      const reason = tx.status === 'canceled' ? 'canceled' : 'declined';
      await sendCampFailureEmails(reg.id, reason);

      return NextResponse.json({ ok: true, action: 'failed' });
    }

    // Autres statuts (pending, transferred, etc.) → rien
    return NextResponse.json({ ok: true, ignored: tx.status });
  } catch (err: any) {
    console.error('[FedaPay Webhook] Error:', err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}