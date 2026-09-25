import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/lib/payments/paypal';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { sendCampSuccessEmails, sendCampFailureEmails } from '@/lib/camp-emails';
import { sendTrainingSuccessEmail, sendTrainingPaymentFailedEmail } from '@/lib/training-emails';

export async function POST(req: NextRequest) {
  try {
    const { orderId, type, id } = await req.json();

    if (!orderId || !type || !id) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    const result = await capturePayPalOrder(orderId);
    const supabase = createAdminClient();

    if (result.status === 'COMPLETED') {
      if (type === 'camp') {
        await supabase
          .from('camp_registrations')
          .update({
            payment_status: 'paid',
            payment_method: 'paypal',
            payment_reference: result.captureId ?? null,
            paid_at: new Date().toISOString()
          })
          .eq('id', id);
        await sendCampSuccessEmails(id);
        revalidatePath('/admin/camps');
      } else {
        await supabase
          .from('training_requests')
          .update({
            payment_status: 'paid',
            payment_method: 'paypal',
            payment_reference: result.captureId ?? null,
            paid_at: new Date().toISOString()
          })
          .eq('id', id);
        await sendTrainingSuccessEmail(id);
        revalidatePath('/admin/demandes-training');
      }
      return NextResponse.json({ ok: true, status: 'paid' });
    }

    // Échec
    if (type === 'camp') {
      await supabase
        .from('camp_registrations')
        .update({ payment_status: 'failed' })
        .eq('id', id);
      await sendCampFailureEmails(id, 'declined');
    } else {
      await supabase
        .from('training_requests')
        .update({ payment_status: 'failed' })
        .eq('id', id);
      await sendTrainingPaymentFailedEmail(id, 'declined');
    }

    return NextResponse.json({ ok: false, status: 'failed' });
  } catch (err: any) {
    console.error('[PayPal capture-order] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}