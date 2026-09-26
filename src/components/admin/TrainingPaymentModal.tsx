'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/admin/Modal';
import {
  sendTrainingPaymentLink,
  sendTrainingPayPalLink,
  sendTrainingStripeLink,
  getTrainingProgramRate
} from '@/app/admin/demandes-training/actions';

type Method = 'fedapay' | 'paypal' | 'stripe';

// Taux de conversion utilisés pour les previews
const XOF_TO_USD = 600;    // doit être aligné avec src/lib/payments/stripe.ts
const XOF_TO_EUR = 656;    // taux fixe indicatif EUR/XOF

export default function TrainingPaymentModal({
  request,
  onClose
}: {
  request: any;
  onClose: () => void;
}) {
  const isAlreadyPaid =
    request.payment_status === 'paid' ||
    !!request.paid_at ||
    !!request.success_email_sent_at;

  const [method, setMethod] = useState<Method>('fedapay');
  const [amount, setAmount] = useState<string>(
    request.payment_amount ? String(request.payment_amount) : ''
  );
  const [currency, setCurrency] = useState<string>(
    request.payment_currency ?? 'XOF'
  );
  const [loadingRate, setLoadingRate] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  const isResend =
    !isAlreadyPaid &&
    (request.payment_status === 'pending' || request.payment_status === 'failed');

  // ✅ Auto-switch devise + conversion du montant selon méthode
  useEffect(() => {
    const num = Number(amount);
    const hasAmount = Number.isFinite(num) && num > 0;

    if (method === 'paypal' || method === 'stripe') {
      if (currency === 'XOF' && hasAmount) {
        setAmount(String(Math.max(1, Math.round((num / XOF_TO_USD) * 100) / 100)));
        setCurrency('USD');
      } else if (currency === 'XOF') {
        setCurrency('USD');
      }
    } else if (method === 'fedapay') {
      if (currency === 'USD' && hasAmount) {
        setAmount(String(Math.round(num * XOF_TO_USD)));
        setCurrency('XOF');
      } else if (currency === 'EUR' && hasAmount) {
        setAmount(String(Math.round(num * XOF_TO_EUR)));
        setCurrency('XOF');
      } else if (currency !== 'XOF') {
        setCurrency('XOF');
      }
    }
  }, [method]); // eslint-disable-line

  // Auto-charger le tarif DB
  useEffect(() => {
    const shouldFetch = !request.payment_amount && request.program_slug;
    if (!shouldFetch) return;

    let cancelled = false;
    setLoadingRate(true);

    getTrainingProgramRate(request.program_slug)
      .then((rate) => {
        if (cancelled || amount || !rate) return;
        if (method === 'fedapay') {
          setAmount(String(rate));
        } else {
          setAmount(String(Math.max(1, Math.round((rate / XOF_TO_USD) * 100) / 100)));
          setCurrency('USD');
        }
      })
      .catch((err) => console.warn('[TrainingPaymentModal] rate lookup:', err))
      .finally(() => { if (!cancelled) setLoadingRate(false); });

    return () => { cancelled = true; };
  }, [request.program_slug, request.payment_amount]); // eslint-disable-line

  const handleSend = async () => {
    if (isAlreadyPaid) {
      setResult({ ok: false, error: 'Cette demande est déjà payée.' });
      return;
    }

    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      setResult({ ok: false, error: 'Entrez un montant valide.' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const res =
        method === 'paypal'
          ? await sendTrainingPayPalLink(request.id, num, currency)
          : method === 'stripe'
            ? await sendTrainingStripeLink(request.id, num, currency)
            : await sendTrainingPaymentLink(request.id, num, currency);

      if (res.error) {
        setResult({ ok: false, error: res.error });
        setSending(false);
        return;
      }
      setResult({ ok: true });
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setResult({ ok: false, error: err.message ?? 'Erreur inconnue' });
    }
    setSending(false);
  };

  if (result?.ok) {
    return (
      <Modal open onClose={onClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md anim-fade-in" onClick={onClose} aria-hidden="true" />
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] anim-fade-up">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-3xl text-white shadow-lg">✓</div>
          <h2 className="font-display text-2xl font-black text-resa-navy">
            {isResend ? 'Nouveau lien envoyé !' : 'Lien envoyé !'}
          </h2>
          <p className="mt-2 text-sm text-resa-text/60">
            Le parent vient de recevoir un email {method === 'paypal' ? 'PayPal' : method === 'stripe' ? 'Stripe' : 'FedaPay'} avec le lien de paiement.
          </p>
        </div>
      </Modal>
    );
  }

  const previewAmount = Number(amount);
  const previewValid = Number.isFinite(previewAmount) && previewAmount > 0;

  return (
    <Modal open onClose={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md anim-fade-in" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] anim-fade-up">
        <div className="h-1 bg-linear-to-r from-resa-red via-resa-royal to-resa-red" />

        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-resa-red">
            {isAlreadyPaid
              ? 'Demande déjà payée'
              : isResend
                ? 'Renvoyer un lien de paiement'
                : 'Envoyer un lien de paiement'}
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-resa-text/40 transition hover:bg-resa-gray hover:text-resa-navy"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 p-6">
          {isAlreadyPaid && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-800">
              ✅ Cette demande est déjà payée
              {request.paid_at && (
                <> le {new Date(request.paid_at).toLocaleDateString('fr-FR')}</>
              )}
              . Aucun nouveau lien ne peut être envoyé.
            </div>
          )}

          <div className="rounded-lg border border-black/5 bg-resa-gray/40 px-4 py-3 text-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">Destinataire</div>
            <div className="mt-1 font-semibold text-resa-navy">{request.parent_name}</div>
            <div className="text-xs text-resa-text/60">{request.parent_email}</div>
            {request.program_title && (
              <div className="mt-2 inline-flex rounded-full bg-resa-navy/5 px-2.5 py-0.5 text-[11px] font-semibold text-resa-navy">
                {request.program_title}
              </div>
            )}
          </div>

          {!isAlreadyPaid && (
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                Méthode de paiement *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('fedapay')}
                  className={`rounded-lg border-2 px-3 py-2.5 text-left transition ${
                    method === 'fedapay'
                      ? 'border-resa-red bg-resa-red/5'
                      : 'border-black/10 bg-white hover:border-resa-navy/30'
                  }`}
                >
                  <div className="text-[13px] font-bold text-resa-navy">📱 FedaPay</div>
                  <div className="mt-0.5 text-[10px] text-resa-text/55">Mobile Money · FCFA</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('paypal')}
                  className={`rounded-lg border-2 px-3 py-2.5 text-left transition ${
                    method === 'paypal'
                      ? 'border-resa-red bg-resa-red/5'
                      : 'border-black/10 bg-white hover:border-resa-navy/30'
                  }`}
                >
                  <div className="text-[13px] font-bold text-resa-navy">💳 PayPal</div>
                  <div className="mt-0.5 text-[10px] text-resa-text/55">Intl. · USD/EUR</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('stripe')}
                  className={`rounded-lg border-2 px-3 py-2.5 text-left transition ${
                    method === 'stripe'
                      ? 'border-resa-red bg-resa-red/5'
                      : 'border-black/10 bg-white hover:border-resa-navy/30'
                  }`}
                >
                  <div className="text-[13px] font-bold text-resa-navy">💳 Stripe</div>
                  <div className="mt-0.5 text-[10px] text-resa-text/55">Carte · USD/EUR</div>
                </button>
              </div>
            </div>
          )}

          {!isAlreadyPaid && (
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                Montant à facturer *
                {loadingRate && <span className="ml-2 text-resa-text/40">⏳ chargement…</span>}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={method === 'fedapay' ? '25000' : '25.00'}
                  min={1}
                  step={method === 'fedapay' ? '1' : '0.01'}
                  className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[15px] font-bold text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] font-bold text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                >
                  {method === 'fedapay' ? (
                    <option value="XOF">FCFA</option>
                  ) : (
                    <>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </>
                  )}
                </select>
              </div>

              <div className="mt-1.5 text-[10px] text-resa-text/40">
                {method === 'fedapay'
                  ? 'FedaPay accepte uniquement les FCFA (XOF).'
                  : method === 'paypal'
                    ? 'PayPal accepte USD et EUR. Le lien sera envoyé dans cette devise.'
                    : 'Stripe accepte USD et EUR. Le lien sera envoyé dans cette devise.'}
              </div>

              {(method === 'stripe' || method === 'paypal') && previewValid && (
                <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
                  <span className="font-bold">
                    {method === 'stripe' ? '💳 Carte' : '💳 PayPal'} :
                  </span>{' '}
                  Le client sera facturé{' '}
                  <strong>
                    {previewAmount.toFixed(2)} {currency}
                  </strong>{' '}
                  — ce montant apparaîtra sur le reçu PDF et la page de confirmation.
                </div>
              )}
            </div>
          )}

          {isResend && !isAlreadyPaid && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
              ⚠️ Un lien a déjà été envoyé
              {request.payment_link_sent_at && (
                <> le {new Date(request.payment_link_sent_at).toLocaleDateString('fr-FR')}</>
              )}
              . Un <strong>nouveau lien</strong> sera généré et remplacera l'ancien.
            </div>
          )}

          {result?.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {result.error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-black/5 bg-resa-gray/40 px-6 py-4">
          <button
            onClick={onClose}
            disabled={sending}
            className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray disabled:opacity-50"
          >
            {isAlreadyPaid ? 'Fermer' : 'Annuler'}
          </button>
          {!isAlreadyPaid && (
            <button
              onClick={handleSend}
              disabled={sending || !amount}
              className="inline-flex items-center gap-2 rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-50"
            >
              {sending ? 'Envoi…' : isResend ? 'Renvoyer le lien' : 'Envoyer le lien'}
              {!sending && <span>→</span>}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}