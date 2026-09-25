import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  getFedaPayTransaction,
  isPaidStatus,
  isFailedStatus
} from '@/lib/payments/fedapay';
import {
  sendTrainingSuccessEmail,
  sendTrainingPaymentFailedEmail
} from '@/lib/training-emails';

export const dynamic = 'force-dynamic';

export default async function TrainingPaymentReturnPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; reqId: string }>;
  searchParams: Promise<{ status?: string; id?: string; close?: string }>;
}) {
  const { locale, reqId } = await params;
  const { status: callbackStatus, close: closeParam, id: urlTxId } = await searchParams;
  setRequestLocale(locale);

  return (
    <PaymentReturn
      reqId={reqId}
      locale={locale}
      callbackStatus={callbackStatus ?? null}
      isClosed={closeParam === 'true' || closeParam === '1'}
      urlTxId={urlTxId ?? null}
    />
  );
}

async function PaymentReturn({
  reqId,
  locale,
  callbackStatus,
  isClosed,
  urlTxId
}: {
  reqId: string;
  locale: string;
  callbackStatus: string | null;
  isClosed: boolean;
  urlTxId: string | null;
}) {
  const isFr = locale === 'fr';
  const supabase = createAdminClient();

  const { data: req } = await supabase
    .from('training_requests')
    .select('*')
    .eq('id', reqId)
    .single();

  if (!req) notFound();

  let finalStatus: 'paid' | 'failed' | 'pending' = 'pending';
  let failureReason: 'declined' | 'canceled' | 'error' = 'declined';

  // ═══════════════════════════════════════════════════════════
  // 1) CALLBACK DIRECT — canceled ou close
  // ═══════════════════════════════════════════════════════════
  if (callbackStatus === 'canceled' || isClosed) {
    if (req.payment_status !== 'paid') {
      if (req.payment_status !== 'failed') {
        await supabase
          .from('training_requests')
          .update({ payment_status: 'failed' })
          .eq('id', reqId);
        await sendTrainingPaymentFailedEmail(reqId, 'canceled');
      }
      finalStatus = 'failed';
      failureReason = 'canceled';
    } else {
      finalStatus = 'paid';
    }
  } else if (callbackStatus === 'declined') {
    // ═══════════════════════════════════════════════════════════
    // 2) CALLBACK DIRECT — declined
    // ═══════════════════════════════════════════════════════════
    if (req.payment_status !== 'paid') {
      if (req.payment_status !== 'failed') {
        await supabase
          .from('training_requests')
          .update({ payment_status: 'failed' })
          .eq('id', reqId);
        await sendTrainingPaymentFailedEmail(reqId, 'declined');
      }
      finalStatus = 'failed';
      failureReason = 'declined';
    } else {
      finalStatus = 'paid';
    }
  } else {
    // ═══════════════════════════════════════════════════════════
    // 3) FALLBACK — DB puis API FedaPay
    // ═══════════════════════════════════════════════════════════
    if (req.payment_status === 'paid') {
      finalStatus = 'paid';
    } else if (req.payment_status === 'failed') {
      finalStatus = 'failed';
    } else if (urlTxId || req.payment_provider_id) {
      try {
        // ⚠️ Priorité à l'ID de l'URL (transaction réellement payée)
        const txId = urlTxId ?? req.payment_provider_id;
        const tx = await getFedaPayTransaction(Number(txId));

        if (isPaidStatus(tx.status)) {
          if (req.payment_status !== 'paid') {
            await supabase
              .from('training_requests')
              .update({
                payment_status: 'paid',
                payment_reference: tx.reference ?? req.payment_reference,
                paid_at: new Date().toISOString()
              })
              .eq('id', reqId);
            await sendTrainingSuccessEmail(reqId);
          }
          finalStatus = 'paid';
        } else if (isFailedStatus(tx.status)) {
          if (req.payment_status !== 'failed') {
            await supabase
              .from('training_requests')
              .update({ payment_status: 'failed' })
              .eq('id', reqId);
            const reason = tx.status === 'canceled' ? 'canceled' : 'declined';
            await sendTrainingPaymentFailedEmail(reqId, reason);
          }
          finalStatus = 'failed';
          failureReason = tx.status === 'canceled' ? 'canceled' : 'declined';
        } else {
          finalStatus = 'pending';
        }
      } catch (err) {
        console.error('[Training PaymentReturn] verify error:', err);
        finalStatus = 'pending';
      }
    }
  }

  const isSuccess = finalStatus === 'paid';
  const isFailed = finalStatus === 'failed';

  const title = isSuccess
    ? isFr ? 'Paiement confirmé !' : 'Payment confirmed!'
    : isFailed
      ? failureReason === 'canceled'
        ? isFr ? 'Paiement annulé' : 'Payment canceled'
        : isFr ? 'Paiement non abouti' : 'Payment failed'
      : isFr ? 'Paiement en cours de vérification' : 'Payment being verified';

  const message = isSuccess
    ? isFr
      ? `Votre séance${req.program_title ? ` "${req.program_title}"` : ''} est réservée. Un email de confirmation vous a été envoyé.`
      : `Your session${req.program_title ? ` "${req.program_title}"` : ''} is booked. A confirmation email has been sent.`
    : isFailed
      ? failureReason === 'canceled'
        ? isFr
          ? `Vous avez annulé le paiement. Votre place n'est PAS réservée.`
          : `You canceled the payment. Your spot is NOT booked.`
        : isFr
          ? `Le paiement n'a pas abouti. Votre place n'est PAS réservée.`
          : `The payment did not go through. Your spot is NOT booked.`
      : isFr
        ? 'Nous vérifions auprès de FedaPay. Patientez quelques instants.'
        : 'We are verifying with FedaPay. Please wait a moment.';

  const icon = isSuccess ? '✓' : isFailed ? '✕' : '⏳';
  const barColor = isSuccess ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-amber-500';
  const iconBg = barColor;

  const amountLabel = req.payment_amount
    ? `${Number(req.payment_amount).toLocaleString('fr-FR')} ${req.payment_currency ?? 'XOF'}`
    : null;

  return (
    <section className="mx-auto max-w-2xl px-4 py-20 md:px-6 md:py-28">
      <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-resa-lg">
        <div className={`h-2 ${barColor}`} />
        <div className="p-8 text-center md:p-12">
          <div className={`mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full text-4xl text-white shadow-lg ${iconBg}`}>
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
              {req.program_title && (
                <div className="flex items-center justify-between">
                  <span className="text-resa-text/60">{isFr ? 'Programme' : 'Program'}</span>
                  <span className="font-semibold text-resa-navy">{req.program_title}</span>
                </div>
              )}
              {req.player_name && (
                <div className="flex items-center justify-between">
                  <span className="text-resa-text/60">{isFr ? 'Joueur' : 'Player'}</span>
                  <span className="font-semibold text-resa-navy">{req.player_name}</span>
                </div>
              )}
              {amountLabel && (
                <div className="flex items-center justify-between border-t border-black/5 pt-2">
                  <span className="text-resa-text/60">{isFr ? 'Montant' : 'Amount'}</span>
                  <span className={`font-display font-black ${isSuccess ? 'text-emerald-600' : 'text-resa-red'}`}>
                    {amountLabel}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-black/5 pt-2">
                <span className="text-resa-text/60">{isFr ? 'Statut' : 'Status'}</span>
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
              <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-resa-navy px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-resa-royal">
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