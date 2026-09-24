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
  sendCampSuccessEmails,
  sendCampFailureEmails
} from '@/lib/camp-emails';

export const dynamic = 'force-dynamic';

export default async function PaymentReturnPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; regId: string }>;
  searchParams: Promise<{ status?: string; id?: string; close?: string }>;
}) {
  const { locale, regId } = await params;
  const { status: callbackStatus } = await searchParams;
  setRequestLocale(locale);
  return (
    <PaymentReturn
      regId={regId}
      locale={locale}
      callbackStatus={callbackStatus ?? null}
    />
  );
}

async function PaymentReturn({
  regId,
  locale,
  callbackStatus
}: {
  regId: string;
  locale: string;
  callbackStatus: string | null;
}) {
  const isFr = locale === 'fr';

  const supabase = createAdminClient();

  const { data: reg } = await supabase
    .from('camp_registrations')
    .select(`
      *,
      camp:camps(id, title_fr, title_en, slug, date_start, location, price_amount)
    `)
    .eq('id', regId)
    .single();

  if (!reg) notFound();

  let finalStatus: 'paid' | 'failed' | 'pending' = 'pending';
  let failureReason: 'declined' | 'canceled' | 'error' = 'declined';

  // ═══════════════════════════════════════════════════════════
  // 1) PRIORITÉ AU CALLBACK : si FedaPay nous dit "canceled"
  //    → on fait confiance IMMÉDIATEMENT (sans attendre l'API)
  // ═══════════════════════════════════════════════════════════
  if (callbackStatus === 'canceled') {
    // Vérifier qu'on n'a pas déjà traité (idempotence)
    if (reg.payment_status !== 'failed') {
      await supabase
        .from('camp_registrations')
        .update({ payment_status: 'failed' })
        .eq('id', regId);

      await sendCampFailureEmails(regId, 'canceled');
    }
    finalStatus = 'failed';
    failureReason = 'canceled';
  } else if (callbackStatus === 'declined') {
    if (reg.payment_status !== 'failed') {
      await supabase
        .from('camp_registrations')
        .update({ payment_status: 'failed' })
        .eq('id', regId);

      await sendCampFailureEmails(regId, 'declined');
    }
    finalStatus = 'failed';
    failureReason = 'declined';
  } else {
    // ═══════════════════════════════════════════════════════════
    // 2) PAS DE CALLBACK CLAIR → on interroge FedaPay
    // ═══════════════════════════════════════════════════════════
    if (reg.payment_provider_id) {
      try {
        const tx = await getFedaPayTransaction(Number(reg.payment_provider_id));

        if (isPaidStatus(tx.status)) {
          // ─── SUCCÈS ───
          if (reg.payment_status !== 'paid') {
            await supabase
              .from('camp_registrations')
              .update({
                payment_status: 'paid',
                payment_method: tx.mode ?? 'fedapay',
                paid_at: new Date().toISOString(),
                payment_reference: tx.reference ?? reg.payment_reference
              })
              .eq('id', regId);

            await sendCampSuccessEmails(regId);
          }
          finalStatus = 'paid';
        } else if (isFailedStatus(tx.status)) {
          // ─── ÉCHEC (confirmé par FedaPay) ───
          if (reg.payment_status !== 'failed') {
            await supabase
              .from('camp_registrations')
              .update({ payment_status: 'failed' })
              .eq('id', regId);

            const reason = tx.status === 'canceled' ? 'canceled' : 'declined';
            await sendCampFailureEmails(regId, reason);
          }
          finalStatus = 'failed';
          failureReason = tx.status === 'canceled' ? 'canceled' : 'declined';
        } else {
          // Statut pending confirmé par l'API
          finalStatus = 'pending';
        }
      } catch (err) {
        console.error('[PaymentReturn] FedaPay verify error:', err);
        finalStatus = 'pending';
      }
    } else if (reg.payment_status === 'paid') {
      finalStatus = 'paid';
    } else if (reg.payment_status === 'failed') {
      finalStatus = 'failed';
    }
  }

  const campTitle = isFr
    ? reg.camp?.title_fr
    : reg.camp?.title_en ?? reg.camp?.title_fr;

  const isSuccess = finalStatus === 'paid';
  const isFailed = finalStatus === 'failed';

  // ─── Textes selon statut ───
  const title = isSuccess
    ? isFr ? 'Paiement confirmé !' : 'Payment confirmed!'
    : isFailed
      ? failureReason === 'canceled'
        ? isFr ? 'Paiement annulé' : 'Payment canceled'
        : isFr ? 'Paiement non abouti' : 'Payment failed'
      : isFr ? 'Paiement en cours de vérification' : 'Payment being verified';

  const message = isSuccess
    ? isFr
      ? `Votre place pour "${campTitle}" est réservée. Un email de confirmation vient de vous être envoyé.`
      : `Your spot for "${campTitle}" is booked. A confirmation email has just been sent.`
    : isFailed
      ? failureReason === 'canceled'
        ? isFr
          ? `Vous avez annulé le paiement. Votre place n'est PAS réservée. Vous recevrez un email avec les options pour réessayer.`
          : `You canceled the payment. Your spot is NOT booked. You will receive an email with options to retry.`
        : isFr
          ? `Le paiement n'a pas abouti. Votre place n'est PAS réservée. Vous recevrez un email avec les options pour réessayer ou nous contacter.`
          : `The payment did not go through. Your spot is NOT booked. You will receive an email with options to retry or contact us.`
      : isFr
        ? 'Nous vérifions auprès de FedaPay. Patientez quelques instants ou consultez vos emails.'
        : 'We are verifying with FedaPay. Please wait or check your emails.';

  // Icône & couleur
  const icon = isSuccess ? '✓' : isFailed ? '✕' : '⏳';
  const barColor = isSuccess ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-amber-500';
  const iconBg = isSuccess ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-amber-500';

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

          {/* Récap */}
          {reg.camp && (
            <div className="mx-auto mt-8 max-w-md rounded-2xl border border-black/5 bg-resa-gray/40 p-5 text-left">
              <div className="text-[10px] font-black uppercase tracking-widest text-resa-text/40">
                {isFr ? 'Récapitulatif' : 'Summary'}
              </div>
              <div className="mt-3 space-y-2 text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="text-resa-text/60">{isFr ? 'Événement' : 'Event'}</span>
                  <span className="font-semibold text-resa-navy">{campTitle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-resa-text/60">{isFr ? 'Joueur' : 'Player'}</span>
                  <span className="font-semibold text-resa-navy">{reg.player_name}</span>
                </div>
                {reg.camp.date_start && (
                  <div className="flex items-center justify-between">
                    <span className="text-resa-text/60">{isFr ? 'Date' : 'Date'}</span>
                    <span className="font-semibold text-resa-navy">
                      {new Date(reg.camp.date_start).toLocaleDateString(
                        isFr ? 'fr-FR' : 'en-GB',
                        { day: '2-digit', month: 'long', year: 'numeric' }
                      )}
                    </span>
                  </div>
                )}
                {reg.camp.price_amount && (
                  <div className="flex items-center justify-between border-t border-black/5 pt-2">
                    <span className="text-resa-text/60">{isFr ? 'Montant' : 'Amount'}</span>
                    <span className={`font-display font-black ${isSuccess ? 'text-emerald-600' : 'text-resa-red'}`}>
                      {reg.camp.price_amount.toLocaleString('fr-FR')} FCFA
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
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {isSuccess && (
              <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-resa-navy px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-resa-royal">
                {isFr ? "Retour à l'accueil" : 'Back home'}
              </Link>
            )}

            {isFailed && reg.camp?.slug && (
              <Link href={`/camps/${reg.camp.slug}` as any} className="inline-flex items-center gap-2 rounded-full bg-resa-red px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-700">
                {isFr ? 'Réessayer le paiement' : 'Try payment again'}
              </Link>
            )}

            <a href="https://wa.me/2250700000000" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:brightness-110">
              💬 {isFr ? "Contacter l'équipe" : 'Contact team'}
            </a>
          </div>

          {isFailed && (
            <p className="mt-6 text-[11px] italic text-resa-text/50">
              {isFr
                ? 'Un email vous a été envoyé avec les étapes pour finaliser votre inscription.'
                : 'An email has been sent to you with the steps to complete your registration.'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}