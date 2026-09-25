import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  sendCampSuccessEmails,
  sendCampFailureEmails
} from '@/lib/camp-emails';
import {
  sendTrainingSuccessEmail,
  sendTrainingPaymentFailedEmail
} from '@/lib/training-emails';
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

    // ═══════════════════════════════════════════════════════════
    // 1) Chercher un CAMP
    // ═══════════════════════════════════════════════════════════
    const { data: campReg } = await supabase
      .from('camp_registrations')
      .select('id, payment_status, camp_id')
      .eq('payment_provider_id', String(txId))
      .maybeSingle();

    if (campReg) {
      if (isPaidStatus(tx.status)) {
        if (campReg.payment_status === 'paid') {
          return NextResponse.json({ ok: true, ignored: 'camp_already_paid' });
        }

        await supabase
          .from('camp_registrations')
          .update({
            payment_status: 'paid',
            payment_method: tx.mode ?? 'fedapay',
            payment_reference: tx.reference ?? null,
            paid_at: new Date().toISOString()
          })
          .eq('id', campReg.id);

        await sendCampSuccessEmails(campReg.id);
        revalidatePath('/admin/camps');
        revalidatePath('/admin/camps/' + campReg.camp_id + '/inscriptions');
        return NextResponse.json({ ok: true, action: 'camp_paid' });
      }

      if (isFailedStatus(tx.status)) {
        if (campReg.payment_status === 'failed') {
          return NextResponse.json({ ok: true, ignored: 'camp_already_failed' });
        }

        await supabase
          .from('camp_registrations')
          .update({ payment_status: 'failed' })
          .eq('id', campReg.id);

        const reason = tx.status === 'canceled' ? 'canceled' : 'declined';
        await sendCampFailureEmails(campReg.id, reason);
        revalidatePath('/admin/camps');
        revalidatePath('/admin/camps/' + campReg.camp_id + '/inscriptions');
        return NextResponse.json({ ok: true, action: 'camp_failed' });
      }

      return NextResponse.json({ ok: true, ignored: `camp_${tx.status}` });
    }

    // ═══════════════════════════════════════════════════════════
    // 2) Chercher un TRAINING — par provider_id puis par metadata
    // ═══════════════════════════════════════════════════════════
    let trainingReq: { id: string; payment_status: string } | null = null;

    // 2a) Lookup classique par payment_provider_id
    const { data: byProvider } = await supabase
      .from('training_requests')
      .select('id, payment_status')
      .eq('payment_provider_id', String(txId))
      .maybeSingle();

    trainingReq = byProvider ?? null;

    // 2b) Fallback : metadata.training_request_id envoyé par FedaPay
    if (!trainingReq) {
      const metaId =
        body?.entity?.metadata?.training_request_id ??
        body?.data?.metadata?.training_request_id ??
        body?.metadata?.training_request_id;

      if (metaId) {
        const { data: byMeta } = await supabase
          .from('training_requests')
          .select('id, payment_status')
          .eq('id', metaId)
          .maybeSingle();

        trainingReq = byMeta ?? null;
        if (trainingReq) {
          console.log('[FedaPay Webhook] Training matched by metadata:', metaId);
        }
      }
    }

    if (trainingReq) {
      if (isPaidStatus(tx.status)) {
        if (trainingReq.payment_status === 'paid') {
          return NextResponse.json({ ok: true, ignored: 'training_already_paid' });
        }

        await supabase
          .from('training_requests')
          .update({
            payment_status: 'paid',
            payment_reference: tx.reference ?? null,
            paid_at: new Date().toISOString()
          })
          .eq('id', trainingReq.id);

        await sendTrainingSuccessEmail(trainingReq.id);
        revalidatePath('/admin/demandes-training');
        return NextResponse.json({ ok: true, action: 'training_paid' });
      }

      if (isFailedStatus(tx.status)) {
        if (trainingReq.payment_status === 'failed') {
          return NextResponse.json({ ok: true, ignored: 'training_already_failed' });
        }

        await supabase
          .from('training_requests')
          .update({ payment_status: 'failed' })
          .eq('id', trainingReq.id);

        const reason = tx.status === 'canceled' ? 'canceled' : 'declined';
        await sendTrainingPaymentFailedEmail(trainingReq.id, reason);
        revalidatePath('/admin/demandes-training');
        return NextResponse.json({ ok: true, action: 'training_failed' });
      }

      return NextResponse.json({ ok: true, ignored: `training_${tx.status}` });
    }

    // Aucune correspondance
    return NextResponse.json({ ok: true, ignored: 'no_match' });
  } catch (err: any) {
    console.error('[FedaPay Webhook] Error:', err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}