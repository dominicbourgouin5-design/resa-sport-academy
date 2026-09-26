import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/payments/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { sendCampSuccessEmails, sendCampFailureEmails } from '@/lib/camp-emails';
import { sendTrainingSuccessEmail, sendTrainingPaymentFailedEmail } from '@/lib/training-emails';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? '';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature manquante' },
      { status: 400 }
    );
  }

  if (!WEBHOOK_SECRET) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET manquant');
    return NextResponse.json(
      { error: 'Webhook secret non configuré' },
      { status: 500 }
    );
  }

  // ═══ Vérification de la signature Stripe ═══
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('[Stripe Webhook] Signature invalide:', err.message);
    return NextResponse.json(
      { error: `Signature invalide: ${err.message}` },
      { status: 400 }
    );
  }

  console.log('[Stripe Webhook] Event:', event.type);

  const supabase = createAdminClient();

  try {
    // ═══════════════════════════════════════════════════════════
    // 1) CHECKOUT SESSION COMPLETED → Succès
    // ═══════════════════════════════════════════════════════════
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      const requestId = session.metadata?.requestId;
      const requestType = session.metadata?.requestType;

      if (!requestId || !requestType) {
        return NextResponse.json({ ok: true, ignored: 'no_metadata' });
      }

      const reference = (session.payment_intent as string) || session.id;

      // ─── Cas training ───
      if (requestType === 'training') {
        const { data: req } = await supabase
          .from('training_requests')
          .select('id, payment_status')
          .eq('id', requestId)
          .maybeSingle();

        if (!req) {
          return NextResponse.json({ ok: true, ignored: 'training_not_found' });
        }
        if (req.payment_status === 'paid') {
          return NextResponse.json({ ok: true, ignored: 'training_already_paid' });
        }

        await supabase
          .from('training_requests')
          .update({
            payment_status: 'paid',
            payment_method: 'stripe',
            payment_reference: reference,
            paid_at: new Date().toISOString()
          })
          .eq('id', requestId);

        await sendTrainingSuccessEmail(requestId);
        revalidatePath('/admin/demandes-training');
        return NextResponse.json({ ok: true, action: 'training_paid' });
      }

      // ─── Cas camp ───
      if (requestType === 'camp') {
        const { data: reg } = await supabase
          .from('camp_registrations')
          .select('id, payment_status')
          .eq('id', requestId)
          .maybeSingle();

        if (!reg) {
          return NextResponse.json({ ok: true, ignored: 'camp_not_found' });
        }
        if (reg.payment_status === 'paid') {
          return NextResponse.json({ ok: true, ignored: 'camp_already_paid' });
        }

        await supabase
          .from('camp_registrations')
          .update({
            payment_status: 'paid',
            payment_method: 'stripe',
            payment_reference: reference,
            paid_at: new Date().toISOString()
          })
          .eq('id', requestId);

        await sendCampSuccessEmails(requestId);
        revalidatePath('/admin/camps');
        return NextResponse.json({ ok: true, action: 'camp_paid' });
      }

      return NextResponse.json({ ok: true, ignored: 'unknown_type' });
    }

    // ═══════════════════════════════════════════════════════════
    // 2) PAYMENT INTENT FAILED → Échec
    // ═══════════════════════════════════════════════════════════
    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as Stripe.PaymentIntent;
      const requestId = intent.metadata?.requestId;
      const requestType = intent.metadata?.requestType;

      if (!requestId || !requestType) {
        return NextResponse.json({ ok: true, ignored: 'no_metadata' });
      }

      if (requestType === 'training') {
        const { data: req } = await supabase
          .from('training_requests')
          .select('id, payment_status')
          .eq('id', requestId)
          .maybeSingle();

        if (req && req.payment_status !== 'paid' && req.payment_status !== 'failed') {
          await supabase
            .from('training_requests')
            .update({ payment_status: 'failed' })
            .eq('id', requestId);

          await sendTrainingPaymentFailedEmail(requestId, 'declined');
          revalidatePath('/admin/demandes-training');
        }
      }

      if (requestType === 'camp') {
        const { data: reg } = await supabase
          .from('camp_registrations')
          .select('id, payment_status')
          .eq('id', requestId)
          .maybeSingle();

        if (reg && reg.payment_status !== 'paid' && reg.payment_status !== 'failed') {
          await supabase
            .from('camp_registrations')
            .update({ payment_status: 'failed' })
            .eq('id', requestId);

          await sendCampFailureEmails(requestId, 'declined');
          revalidatePath('/admin/camps');
        }
      }

      return NextResponse.json({ ok: true, action: 'failed' });
    }

    // ═══════════════════════════════════════════════════════════
    // 3) CHECKOUT SESSION EXPIRED → Échec (annulé)
    // ═══════════════════════════════════════════════════════════
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const requestId = session.metadata?.requestId;
      const requestType = session.metadata?.requestType;

      if (!requestId || !requestType) {
        return NextResponse.json({ ok: true, ignored: 'no_metadata' });
      }

      if (requestType === 'training') {
        const { data: req } = await supabase
          .from('training_requests')
          .select('id, payment_status')
          .eq('id', requestId)
          .maybeSingle();

        if (req && req.payment_status === 'pending') {
          await supabase
            .from('training_requests')
            .update({ payment_status: 'failed' })
            .eq('id', requestId);

          await sendTrainingPaymentFailedEmail(requestId, 'canceled');
          revalidatePath('/admin/demandes-training');
        }
      }

      if (requestType === 'camp') {
        const { data: reg } = await supabase
          .from('camp_registrations')
          .select('id, payment_status')
          .eq('id', requestId)
          .maybeSingle();

        if (reg && reg.payment_status === 'pending') {
          await supabase
            .from('camp_registrations')
            .update({ payment_status: 'failed' })
            .eq('id', requestId);

          await sendCampFailureEmails(requestId, 'canceled');
          revalidatePath('/admin/camps');
        }
      }

      return NextResponse.json({ ok: true, action: 'expired' });
    }

    // ═══════════════════════════════════════════════════════════
    // 4) CHARGE REFUNDED → Remboursement
    // ═══════════════════════════════════════════════════════════
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId = charge.payment_intent as string;

      // Recherche par payment_reference dans les deux tables
      const [trainRes, campRes] = await Promise.all([
        supabase
          .from('training_requests')
          .select('id, payment_status')
          .eq('payment_reference', paymentIntentId)
          .maybeSingle(),
        supabase
          .from('camp_registrations')
          .select('id, payment_status')
          .eq('payment_reference', paymentIntentId)
          .maybeSingle()
      ]);

      if (trainRes.data && trainRes.data.payment_status !== 'refunded') {
        await supabase
          .from('training_requests')
          .update({ payment_status: 'refunded' })
          .eq('id', trainRes.data.id);
        revalidatePath('/admin/demandes-training');
      }

      if (campRes.data && campRes.data.payment_status !== 'refunded') {
        await supabase
          .from('camp_registrations')
          .update({ payment_status: 'refunded' })
          .eq('id', campRes.data.id);
        revalidatePath('/admin/camps');
      }

      return NextResponse.json({ ok: true, action: 'refunded' });
    }

    // Autres événements → ignorés
    return NextResponse.json({ ok: true, ignored: event.type });

  } catch (err: any) {
    console.error('[Stripe Webhook] Erreur traitement:', err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}