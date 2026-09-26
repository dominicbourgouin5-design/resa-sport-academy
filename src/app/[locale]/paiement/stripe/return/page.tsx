import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { stripe } from '@/lib/payments/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendTrainingSuccessEmail, sendTrainingPaymentFailedEmail } from '@/lib/training-emails';
import { sendCampSuccessEmails, sendCampFailureEmails } from '@/lib/camp-emails';

export const dynamic = 'force-dynamic';

export default async function StripeReturnPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string; cancelled?: string }>;
}) {
  const { locale } = await params;
  const { session_id, cancelled } = await searchParams;
  setRequestLocale(locale);

  const lang = locale || 'fr';
  let redirectUrl = `/${lang}`;

  // ═══ Cas annulation (avec session_id → on traite) ═══
  if (cancelled === '1') {
    if (!session_id) {
      redirect(`/${lang}?status=canceled`);
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      const requestId = session.metadata?.requestId || session.client_reference_id;
      const requestType = session.metadata?.requestType;

      if (requestId && requestType) {
        const supabase = createAdminClient();

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
            await sendTrainingPaymentFailedEmail(requestId, 'canceled');
          }
          // ✅ status=canceled → écran « Paiement annulé »
          redirect(`/${lang}/paiement/training/${requestId}?status=canceled`);
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
            await sendCampFailureEmails(requestId, 'canceled');
          }
          // ✅ status=canceled → écran « Paiement annulé »
          redirect(`/${lang}/paiement/camp/${requestId}?status=canceled`);
        }
      }
    } catch (err: any) {
      if (err?.message === 'NEXT_REDIRECT' || err?.digest?.startsWith('NEXT_REDIRECT')) {
        throw err;
      }
      console.error('[Stripe Return] cancel processing error:', err);
    }

    redirect(`/${lang}?status=canceled`);
  }

  if (!session_id) {
    redirect(`/${lang}?status=canceled`);
  }

  const supabase = createAdminClient();

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const requestId = session.metadata?.requestId || session.client_reference_id;
    const requestType = session.metadata?.requestType;

    if (!requestId || !requestType) {
      redirectUrl = `/${lang}?status=declined`;
    } else if (session.payment_status === 'paid') {
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

        redirectUrl = `/${lang}/paiement/training/${requestId}?status=approved&id=${session.id}`;
      } else if (requestType === 'camp') {
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

        redirectUrl = `/${lang}/paiement/camp/${requestId}?status=approved&id=${session.id}`;
      }
    } else {
      if (requestType === 'training') {
        await sendTrainingPaymentFailedEmail(requestId, 'declined');
        redirectUrl = `/${lang}/paiement/training/${requestId}?status=declined`;
      } else if (requestType === 'camp') {
        await sendCampFailureEmails(requestId, 'declined');
        redirectUrl = `/${lang}/paiement/camp/${requestId}?status=declined`;
      } else {
        redirectUrl = `/${lang}?status=declined`;
      }
    }
  } catch (err: any) {
    if (err?.message === 'NEXT_REDIRECT' || err?.digest?.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('[Stripe Return] Erreur:', err);
    redirectUrl = `/${lang}?status=error`;
  }

  redirect(redirectUrl);
}