import { redirect } from 'next/navigation';
import { stripe } from '@/lib/payments/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendTrainingSuccessEmail, sendTrainingPaymentFailedEmail } from '@/lib/training-emails';
import { sendCampSuccessEmails, sendCampFailureEmails } from '@/lib/camp-emails';

export default async function StripeReturnPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string; cancelled?: string }>;
}) {
  const { session_id, cancelled } = await searchParams;
  const supabase = createAdminClient();

  // ═══ Cas annulation directe ═══
  if (cancelled === '1' || !session_id) {
    redirect('/fr/paiement/training?status=canceled');
  }

  try {
    // 1. Récupère la session Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const requestId = session.metadata?.requestId;
    const requestType = session.metadata?.requestType; // 'camp' | 'training'

    if (!requestId || !requestType) {
      redirect('/fr/paiement/training?status=declined');
    }

    // ═══ Cas paiement réussi ═══
    if (session.payment_status === 'paid') {
      const reference = (session.payment_intent as string) || session.id;

      if (requestType === 'training') {
        const { data: req } = await supabase
          .from('training_requests')
          .select('id, payment_status')
          .eq('id', requestId)
          .maybeSingle();

        if (req && req.payment_status !== 'paid') {
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
        }

        redirect(`/fr/paiement/training/${requestId}?status=approved&id=${session.id}`);
      }

      if (requestType === 'camp') {
        const { data: reg } = await supabase
          .from('camp_registrations')
          .select('id, payment_status')
          .eq('id', requestId)
          .maybeSingle();

        if (reg && reg.payment_status !== 'paid') {
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
        }

        redirect(`/fr/paiement/camp/${requestId}?status=approved&id=${session.id}`);
      }
    }

    // ═══ Paiement non abouti ═══
    if (requestType === 'training') {
      await sendTrainingPaymentFailedEmail(requestId, 'declined');
    } else if (requestType === 'camp') {
      await sendCampFailureEmails(requestId, 'declined');
    }
    redirect('/fr/paiement/training?status=declined');
  } catch (err) {
    console.error('[Stripe Return] Erreur:', err);
    redirect('/fr/paiement/training?status=declined');
  }
}