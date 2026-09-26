import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendCampSuccessEmails, sendCampFailureEmails } from '@/lib/camp-emails';
import { sendTrainingSuccessEmail, sendTrainingPaymentFailedEmail } from '@/lib/training-emails';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const eventType: string = body?.event_type;
    const resource = body?.resource;

    console.log('[PayPal Webhook] 🔔 Événement reçu:', eventType, 'ID:', body?.id);

    if (!resource || !eventType) {
      return NextResponse.json({ ok: true, ignored: 'missing_data' });
    }

    // ⚠️ CHECKOUT.ORDER.APPROVED : commande approuvée mais PAS capturée.
    // L'argent n'est pas débité à ce stade — on ignore toujours.
    if (eventType === 'CHECKOUT.ORDER.APPROVED') {
      console.log('[PayPal Webhook] ℹ️ Order approved — en attente de capture réelle');
      return NextResponse.json({ ok: true, ignored: 'order_approved_pending_capture' });
    }

    const supabase = createAdminClient();

    const customId =
      resource?.custom_id ??
      resource?.purchase_units?.[0]?.reference_id ??
      resource?.supplementary_data?.related_ids?.order_id;

    const captureId = resource?.id;

    if (!customId) {
      return NextResponse.json({ ok: true, ignored: 'no_custom_id' });
    }

    // ═══════════════════════════════════════════════════════════
    // 1) SUCCÈS RÉEL : PAYMENT.CAPTURE.COMPLETED UNIQUEMENT
    // ═══════════════════════════════════════════════════════════
    if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      console.log('[PayPal Webhook] ✅ Capture réussie pour:', customId);

      // ─── Camp ───
      const { data: campReg } = await supabase
        .from('camp_registrations')
        .select('id, payment_status')
        .eq('id', customId)
        .maybeSingle();

      if (campReg) {
        if (campReg.payment_status === 'paid') {
          return NextResponse.json({ ok: true, ignored: 'camp_already_paid' });
        }
        await supabase
          .from('camp_registrations')
          .update({
            payment_status: 'paid',
            payment_method: 'paypal',
            payment_reference: captureId ?? null,
            paid_at: new Date().toISOString()
          })
          .eq('id', campReg.id);
        await sendCampSuccessEmails(campReg.id);
        revalidatePath('/admin/camps');
        return NextResponse.json({ ok: true, action: 'camp_paid' });
      }

      // ─── Training ───
      const { data: trainingReq } = await supabase
        .from('training_requests')
        .select('id, payment_status')
        .eq('id', customId)
        .maybeSingle();

      if (trainingReq) {
        if (trainingReq.payment_status === 'paid') {
          return NextResponse.json({ ok: true, ignored: 'training_already_paid' });
        }
        await supabase
          .from('training_requests')
          .update({
            payment_status: 'paid',
            payment_method: 'paypal',
            payment_reference: captureId ?? null,
            paid_at: new Date().toISOString()
          })
          .eq('id', trainingReq.id);
        await sendTrainingSuccessEmail(trainingReq.id);
        revalidatePath('/admin/demandes-training');
        return NextResponse.json({ ok: true, action: 'training_paid' });
      }

      return NextResponse.json({ ok: true, ignored: 'no_match' });
    }

    // ═══════════════════════════════════════════════════════════
    // 2) ÉCHECS ASYNCHRONES : DENIED / REVERSED
    //    (rare : INSTRUMENT_DECLINED n'émet AUCUN webhook)
    // ═══════════════════════════════════════════════════════════
    if (
      eventType === 'PAYMENT.CAPTURE.DENIED' ||
      eventType === 'PAYMENT.CAPTURE.REVERSED'
    ) {
      console.warn('[PayPal Webhook] ⚠️ Capture refusée/annulée:', customId);

      const [campRes, trainRes] = await Promise.all([
        supabase.from('camp_registrations').select('id, payment_status').eq('id', customId).maybeSingle(),
        supabase.from('training_requests').select('id, payment_status').eq('id', customId).maybeSingle()
      ]);

      if (campRes.data && campRes.data.payment_status !== 'paid' && campRes.data.payment_status !== 'failed') {
        await supabase.from('camp_registrations').update({ payment_status: 'failed' }).eq('id', campRes.data.id);
        await sendCampFailureEmails(campRes.data.id, 'declined');
        revalidatePath('/admin/camps');
      }

      if (trainRes.data && trainRes.data.payment_status !== 'paid' && trainRes.data.payment_status !== 'failed') {
        await supabase.from('training_requests').update({ payment_status: 'failed' }).eq('id', trainRes.data.id);
        await sendTrainingPaymentFailedEmail(trainRes.data.id, 'declined');
        revalidatePath('/admin/demandes-training');
      }

      return NextResponse.json({ ok: true, action: 'marked_failed' });
    }

    return NextResponse.json({ ok: true, ignored: eventType });
  } catch (err: any) {
    console.error('[PayPal Webhook] ❌ Erreur:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}