import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import { capturePayPalOrder } from '@/lib/payments/paypal';
import { sendCampSuccessEmails, sendCampFailureEmails } from '@/lib/camp-emails';
import { sendTrainingSuccessEmail, sendTrainingPaymentFailedEmail } from '@/lib/training-emails';

export const dynamic = 'force-dynamic';

export default async function PayPalReturnPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; type: string; id: string }>;
  searchParams: Promise<{ token?: string; cancelled?: string }>;
}) {
  const { locale, type, id } = await params;
  const { token: orderId, cancelled } = await searchParams;
  setRequestLocale(locale);

  const isFr = locale === 'fr';
  const supabase = createAdminClient();

  let status: 'paid' | 'failed' | 'pending' = 'pending';
  let reference: string | null = null;
  let itemTitle = type === 'camp' ? 'Camp RESA' : 'Training RESA';
  let amountLabel: string | null = null;

  // ═══════════════════════════════════════════════════════════
  // 1) CAS ANNULATION EXPLICITE
  // ═══════════════════════════════════════════════════════════
  if (cancelled === '1') {
    status = 'failed';
    if (type === 'camp') {
      const { data: reg } = await supabase
        .from('camp_registrations')
        .select('id, payment_status, camp:camps(title_fr)')
        .eq('id', id)
        .single();
      if (reg && reg.payment_status !== 'paid' && reg.payment_status !== 'failed') {
        await supabase
          .from('camp_registrations')
          .update({ payment_status: 'failed' })
          .eq('id', id);
        await sendCampFailureEmails(id, 'canceled');
      }
      itemTitle = (reg?.camp as any)?.title_fr ?? 'Camp RESA';
    } else {
      const { data: req } = await supabase
        .from('training_requests')
        .select('id, payment_status, program_title')
        .eq('id', id)
        .single();
      if (req && req.payment_status !== 'paid' && req.payment_status !== 'failed') {
        await supabase
          .from('training_requests')
          .update({ payment_status: 'failed' })
          .eq('id', id);
        await sendTrainingPaymentFailedEmail(id, 'canceled');
      }
      itemTitle = req?.program_title ?? 'Training RESA';
    }
  } else if (orderId) {
    // ═══════════════════════════════════════════════════════════
    // 2) CAPTURE DE LA COMMANDE PAYPAL
    // ═══════════════════════════════════════════════════════════
    try {
      const result = await capturePayPalOrder(orderId);
      reference = result.captureId ?? null;

      if (result.status === 'COMPLETED') {
        if (type === 'camp') {
          const { data: reg } = await supabase
            .from('camp_registrations')
            .select('*, camp:camps(title_fr, price_amount, price_fr)')
            .eq('id', id)
            .single();

          if (reg) {
            if (reg.payment_status !== 'paid') {
              await supabase
                .from('camp_registrations')
                .update({
                  payment_status: 'paid',
                  payment_method: 'paypal',
                  payment_reference: reference,
                  paid_at: new Date().toISOString()
                })
                .eq('id', id);
              await sendCampSuccessEmails(id);
            } else if (!reg.success_email_sent_at) {
              // Déjà payé mais email pas envoyé → on force
              await sendCampSuccessEmails(id);
            }
            console.log('[PayPal Return] Camp déjà payé — double paiement ignoré');
          }
          itemTitle = (reg?.camp as any)?.title_fr ?? 'Camp RESA';
          amountLabel = reg?.camp?.price_amount
            ? `${reg.camp.price_amount.toLocaleString('fr-FR')} XOF`
            : null;
        } else {
          const { data: req } = await supabase
            .from('training_requests')
            .select('*')
            .eq('id', id)
            .single();

          if (req) {
            if (req.payment_status !== 'paid') {
              await supabase
                .from('training_requests')
                .update({
                  payment_status: 'paid',
                  payment_method: 'paypal',
                  payment_reference: reference,
                  paid_at: new Date().toISOString()
                })
                .eq('id', id);
              await sendTrainingSuccessEmail(id);
            } else if (!req.success_email_sent_at) {
              // Déjà payé mais email pas envoyé → on force
              await sendTrainingSuccessEmail(id);
            }
            console.log('[PayPal Return] Training déjà payé — double paiement ignoré');
          }
          itemTitle = req?.program_title ?? 'Training RESA';
          amountLabel = req?.payment_amount
            ? `${req.payment_amount.toLocaleString('fr-FR')} ${req.payment_currency ?? 'XOF'}`
            : null;
        }
        status = 'paid';
      } else {
        status = 'failed';
      }
    } catch (err: any) {
      console.error('[PayPal Return] Capture error:', err);
      status = 'failed';
    }
  } else {
    notFound();
  }

  const isSuccess = status === 'paid';
  const isFailed = status === 'failed';

  const title = isSuccess
    ? isFr ? 'Paiement confirmé !' : 'Payment confirmed!'
    : isFailed
      ? isFr ? 'Paiement non abouti' : 'Payment failed'
      : isFr ? 'Paiement en vérification' : 'Payment verifying';

  const message = isSuccess
    ? isFr
      ? `Votre paiement pour "${itemTitle}" est confirmé. Un email de confirmation vient de vous être envoyé.`
      : `Your payment for "${itemTitle}" is confirmed. A confirmation email has been sent.`
    : isFailed
      ? isFr
        ? `Le paiement n'a pas abouti. Votre place n'est PAS réservée.`
        : `The payment did not go through. Your spot is NOT booked.`
      : isFr
        ? 'Vérification en cours…'
        : 'Verifying…';

  const icon = isSuccess ? '✓' : isFailed ? '✕' : '⏳';
  const barColor = isSuccess
    ? 'bg-emerald-500'
    : isFailed
      ? 'bg-red-500'
      : 'bg-amber-500';

  return (
    <section className="mx-auto max-w-2xl px-4 py-20 md:px-6 md:py-28">
      <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-resa-lg">
        <div className={`h-2 ${barColor}`} />
        <div className="p-8 text-center md:p-12">
          <div className={`mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full text-4xl text-white shadow-lg ${barColor}`}>
            {icon}
          </div>
          <h1 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-resa-text/70">
            {message}
          </p>

          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-black/5 bg-resa-gray/40 p-5 text-left">
            <div className="text-[10px] font-black uppercase tracking-widest text-resa-text/40">
              {isFr ? 'Récapitulatif' : 'Summary'}
            </div>
            <div className="mt-3 space-y-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-resa-text/60">
                  {isFr ? 'Événement' : 'Event'}
                </span>
                <span className="font-semibold text-resa-navy">{itemTitle}</span>
              </div>
              {amountLabel && (
                <div className="flex items-center justify-between border-t border-black/5 pt-2">
                  <span className="text-resa-text/60">
                    {isFr ? 'Montant' : 'Amount'}
                  </span>
                  <span className={`font-display font-black ${isSuccess ? 'text-emerald-600' : 'text-resa-red'}`}>
                    {amountLabel}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-black/5 pt-2">
                <span className="text-resa-text/60">
                  {isFr ? 'Statut' : 'Status'}
                </span>
                <span className={`font-display font-black uppercase text-[11px] ${
                  isSuccess ? 'text-emerald-600' : isFailed ? 'text-red-600' : 'text-amber-600'
                }`}>
                  {isSuccess
                    ? isFr ? '✓ Payé' : '✓ Paid'
                    : isFailed
                      ? isFr ? '✕ Échoué' : '✕ Failed'
                      : isFr ? '⏳ En attente' : '⏳ Pending'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {isSuccess && (
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-resa-navy px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-resa-royal"
              >
                {isFr ? "Retour à l'accueil" : 'Back home'}
              </Link>
            )}
            <a
              href="https://wa.me/2250700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:brightness-110"
            >
              💬 {isFr ? "Contacter l'équipe" : 'Contact team'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}