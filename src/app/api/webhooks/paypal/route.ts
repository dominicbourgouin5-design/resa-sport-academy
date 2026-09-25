import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { sendCampSuccessEmails, sendCampFailureEmails } from '@/lib/camp-emails';
import { sendTrainingSuccessEmail, sendTrainingPaymentFailedEmail } from '@/lib/training-emails';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[PayPal Webhook] Event:', body.event_type);

    const eventType = body.event_type;
    const resource = body.resource;
    const supabase = createAdminClient();

    // ═══ Succès ═══
    if (
      eventType === 'PAYMENT.CAPTURE.COMPLETED' ||
      eventType === 'CHECKOUT.ORDER.APPROVED'
    ) {
      const customId = resource?.custom_id ?? resource?.purchase_units?.[0]?.reference_id;
      const captureId = resource?.id;

      if (!customId) {
        return NextResponse.json({ ok: true, ignored: 'no_custom_id' });
      }

      const [campRes, trainRes] = await Promise.all([
        supabase.from('camp_registrations').select('id, payment_status').eq('id', customId).maybeSingle(),
        supabase.from('training_requests').select('id, payment_status').eq('id', customId).maybeSingle()
      ]);

      if (campRes.data && campRes.data.payment_status !== 'paid') {
        await supabase.from('camp_registrations').update({
          payment_status: 'paid',
          payment_method: 'paypal',
          payment_reference: captureId ?? null,
          paid_at: new Date().toISOString()
        }).eq('id', campRes.data.id);
        await sendCampSuccessEmails(campRes.data.id);
        revalidatePath('/admin/camps');
        return NextResponse.json({ ok: true, action: 'camp_paid' });
      }

      if (trainRes.data && trainRes.data.payment_status !== 'paid') {
        await supabase.from('training_requests').update({
          payment_status: 'paid',
          payment_method: 'paypal',
          payment_reference: captureId ?? null,
          paid_at: new Date().toISOString()
        }).eq('id', trainRes.data.id);
        await sendTrainingSuccessEmail(trainRes.data.id);
        revalidatePath('/admin/demandes-training');
        return NextResponse.json({ ok: true, action: 'training_paid' });
      }
    }

    // ═══ Échec / Remboursement ═══
    if (
      eventType === 'PAYMENT.CAPTURE.DENIED' ||
      eventType === 'PAYMENT.CAPTURE.DECLINED' ||
      eventType === 'PAYMENT.CAPTURE.REFUNDED' ||
      eventType === 'CHECKOUT.ORDER.DECLINED'
    ) {
      const customId = resource?.custom_id ?? resource?.purchase_units?.[0]?.reference_id;
      if (!customId) {
        return NextResponse.json({ ok: true, ignored: 'no_custom_id' });
      }

      const [campRes, trainRes] = await Promise.all([
        supabase.from('camp_registrations').select('id, payment_status').eq('id', customId).maybeSingle(),
        supabase.from('training_requests').select('id, payment_status').eq('id', customId).maybeSingle()
      ]);

      if (campRes.data && campRes.data.payment_status !== 'failed') {
        await supabase.from('camp_registrations').update({ payment_status: 'failed' }).eq('id', campRes.data.id);
        await sendCampFailureEmails(campRes.data.id, 'declined');
        revalidatePath('/admin/camps');
      }

      if (trainRes.data && trainRes.data.payment_status !== 'failed') {
        await supabase.from('training_requests').update({ payment_status: 'failed' }).eq('id', trainRes.data.id);
        await sendTrainingPaymentFailedEmail(trainRes.data.id, 'declined');
        revalidatePath('/admin/demandes-training');
      }

      return NextResponse.json({ ok: true, action: 'failed' });
    }

    return NextResponse.json({ ok: true, ignored: eventType });
  } catch (err: any) {
    console.error('[PayPal Webhook] Error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}