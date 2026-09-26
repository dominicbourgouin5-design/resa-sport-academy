'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { sendCampRegistration } from '@/app/[locale]/camps/actions';
import { cn } from '@/lib/utils';

const COUNTRIES = [
  { code: 'ci', label: '🇨🇮 Côte d\'Ivoire', dial: '+225' },
  { code: 'sn', label: '🇸🇳 Sénégal', dial: '+221' },
  { code: 'bj', label: '🇧🇯 Bénin', dial: '+229' },
  { code: 'bf', label: '🇧🇫 Burkina Faso', dial: '+226' },
  { code: 'ml', label: '🇲🇱 Mali', dial: '+223' },
  { code: 'ne', label: '🇳🇪 Niger', dial: '+227' },
  { code: 'tg', label: '🇹🇬 Togo', dial: '+228' },
  { code: 'gw', label: '🇬🇼 Guinée-Bissau', dial: '+245' },
  { code: 'fr', label: '🇫🇷 France', dial: '+33' },
  { code: 'us', label: '🇺🇸 États-Unis', dial: '+1' }
];

type InitialValues = Record<string, string> | null;
type PaymentMode = 'later' | 'online';
type OnlineMethod = 'fedapay' | 'paypal' | 'stripe';

export default function CampRegistrationForm({
  camp,
  initialValues = null,
  onClose
}: {
  camp: any;
  initialValues?: InitialValues;
  onClose?: () => void;
}) {
  const locale = useLocale();
  const isFr = locale === 'fr';

  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const hasPrice = !!camp.price_amount;
  const hasUsdPrice = !!camp.price_amount_usd;
  const hasAnyOnlineOption = hasPrice || hasUsdPrice;

  const [paymentMode, setPaymentMode] = useState<PaymentMode>(
    initialValues?.payment_mode === 'online' ? 'online' : 'later'
  );

  // ✅ Devise par défaut intelligente :
  // - Si XOF existe → FedaPay
  // - Sinon si USD → PayPal (Stripe en secours)
  const [onlineMethod, setOnlineMethod] = useState<OnlineMethod>(() => {
    if (initialValues?.online_method === 'paypal') return 'paypal';
    if (initialValues?.online_method === 'stripe') return 'stripe';
    if (initialValues?.online_method === 'fedapay') return 'fedapay';
    if (hasPrice) return 'fedapay';
    if (hasUsdPrice) return 'paypal';
    return 'fedapay';
  });

  const [form, setForm] = useState({
    parent_name: initialValues?.parent_name ?? '',
    parent_email: initialValues?.parent_email ?? '',
    parent_country: initialValues?.parent_country ?? 'ci',
    parent_phone: initialValues?.parent_phone ?? '',
    player_name: initialValues?.player_name ?? '',
    player_age: initialValues?.player_age ?? '',
    player_birth_date: initialValues?.player_birth_date ?? '',
    notes: initialValues?.notes ?? ''
  });

  const update = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canGoStep2 =
    form.parent_name.trim() !== '' &&
    form.parent_email.trim() !== '' &&
    /^\S+@\S+\.\S+$/.test(form.parent_email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setError(null);

    const finalMethod: 'later' | 'fedapay' | 'paypal' | 'stripe' =
      paymentMode === 'later' ? 'later' : onlineMethod;

    try {
      const result = await sendCampRegistration({
        camp_id: camp.id,
        camp_slug: camp.slug,
        ...form,
        payment_method: finalMethod,
        locale
      });

      if (result.error) {
        setError(result.error);
        setStatus('error');
        return;
      }

      if (result.payment_url) {
        window.location.href = result.payment_url;
        return;
      }

      setStatus('success');
    } catch (err: any) {
      setError(err.message ?? 'Erreur inconnue');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="p-8 text-center sm:p-10">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-3xl text-white">
          ✓
        </div>
        <h3 className="font-display text-2xl font-black text-emerald-800">
          {isFr ? 'Inscription enregistrée !' : 'Registration recorded!'}
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-sm text-emerald-700">
          {isFr
            ? 'Notre équipe vous contactera sous 48h pour finaliser le paiement.'
            : 'Our team will contact you within 48h to finalize payment.'}
        </p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mt-6 rounded-full bg-emerald-500 px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-emerald-600"
          >
            {isFr ? 'Fermer' : 'Close'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Header + Progress */}
      <div className="border-b border-black/5 px-6 pb-4 pt-6 sm:px-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-1 w-10 bg-resa-red" />
            <h2 className="mt-2 font-display text-xl font-black text-resa-navy">
              {isFr ? 'Inscription' : 'Registration'}
            </h2>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-widest text-resa-text/50">
              {isFr ? 'Étape' : 'Step'}
            </div>
            <div className="font-display text-lg font-black text-resa-red">
              {step}<span className="text-resa-text/30">/2</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-1.5">
          <div className={cn('h-1.5 flex-1 rounded-full', step >= 1 ? 'bg-resa-red' : 'bg-resa-gray')} />
          <div className={cn('h-1.5 flex-1 rounded-full', step >= 2 ? 'bg-resa-red' : 'bg-resa-gray')} />
        </div>
      </div>

      {initialValues && step === 1 && (
        <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-2.5 sm:px-8">
          <div className="flex items-start gap-2 text-[11px] text-emerald-800">
            <span className="mt-0.5">✓</span>
            <span>
              {isFr
                ? 'Vos choix précédents ont été pré-remplis.'
                : 'Your previous choices have been pre-filled.'}
            </span>
          </div>
        </div>
      )}

      {/* ÉTAPE 1 */}
      {step === 1 && (
        <div className="space-y-5 p-6 sm:p-8">
          {hasAnyOnlineOption && (
            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-resa-text/60">
                {isFr ? 'Mode de paiement' : 'Payment method'}
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('later')}
                  className={cn(
                    'flex items-start gap-2.5 rounded-xl border-2 px-3.5 py-3 text-left transition',
                    paymentMode === 'later'
                      ? 'border-resa-red bg-resa-red/5'
                      : 'border-black/10 bg-white hover:border-resa-navy/30'
                  )}
                >
                  <span className="mt-0.5 text-base">📝</span>
                  <div>
                    <div className="text-[12px] font-bold text-resa-navy">
                      {isFr ? 'Sans payer maintenant' : 'Pay later'}
                    </div>
                    <div className="mt-0.5 text-[10px] text-resa-text/55">
                      {isFr ? 'Momo hors ligne, espèces ou contact.' : 'Offline momo, cash, or contact.'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('online')}
                  className={cn(
                    'flex items-start gap-2.5 rounded-xl border-2 px-3.5 py-3 text-left transition',
                    paymentMode === 'online'
                      ? 'border-resa-red bg-resa-red/5'
                      : 'border-black/10 bg-white hover:border-resa-navy/30'
                  )}
                >
                  <span className="mt-0.5 text-base">💳</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-bold text-resa-navy">
                      {isFr ? 'Payer en ligne' : 'Pay online'}
                    </div>
                    <div className="mt-0.5 text-[10px] text-resa-text/55">
                      {isFr ? 'Mobile Money · Carte · PayPal' : 'Mobile Money · Card · PayPal'}
                    </div>
                  </div>
                </button>
              </div>

              {/* Sélecteur FedaPay / PayPal / Stripe */}
              {paymentMode === 'online' && (
                <div className="mt-3">
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/55">
                    {isFr ? 'Méthode' : 'Method'}
                  </label>
                  <select
                    value={onlineMethod}
                    onChange={(e) => setOnlineMethod(e.target.value as OnlineMethod)}
                    className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                  >
                    {hasPrice && (
                      <option value="fedapay">
                        {isFr ? 'Mobile Money / Carte (FedaPay)' : 'Mobile Money / Card (FedaPay)'}
                        {camp.price_fr ? ` — ${camp.price_fr}` : ''}
                      </option>
                    )}
                    {/* ✅ AJOUT : PayPal (USD uniquement) */}
                    {hasUsdPrice && (
                      <option value="paypal">
                        {isFr ? 'PayPal' : 'PayPal'}
                        {` — $${camp.price_amount_usd}`}
                      </option>
                    )}
                    {/* ✅ Stripe : USD si dispo, sinon XOF (converti en USD côté serveur) */}
                    <option value="stripe">
                      {isFr ? 'Carte bancaire (Stripe)' : 'Card (Stripe)'}
                      {hasUsdPrice
                        ? ` — $${camp.price_amount_usd}`
                        : camp.price_fr
                          ? ` — ${camp.price_fr}`
                          : ''}
                    </option>
                  </select>
                </div>
              )}
            </div>
          )}

          <div>
            <div className="mb-2.5 text-[10px] font-black uppercase tracking-widest text-resa-red">
              {isFr ? 'Vos coordonnées' : 'Your details'}
            </div>
            <div className="space-y-2.5">
              <input
                type="text"
                value={form.parent_name}
                onChange={(e) => update('parent_name', e.target.value)}
                placeholder={isFr ? 'Nom complet du parent *' : 'Parent full name *'}
                className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
              <input
                type="email"
                value={form.parent_email}
                onChange={(e) => update('parent_email', e.target.value)}
                placeholder="Email *"
                className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.parent_country}
                  onChange={(e) => update('parent_country', e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={form.parent_phone}
                  onChange={(e) => update('parent_phone', e.target.value)}
                  placeholder={`${COUNTRIES.find((c) => c.code === form.parent_country)?.dial ?? ''}…`}
                  className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={!canGoStep2}
            onClick={() => setStep(2)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-resa-red px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFr ? 'Suivant' : 'Next'} →
          </button>

          <a
            href="https://wa.me/2250700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-[11px] text-resa-text/50 transition hover:text-resa-red"
          >
            💬 {isFr ? 'Besoin d\'aide ?' : 'Need help?'}
          </a>
        </div>
      )}

      {/* ÉTAPE 2 */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
          <div>
            <div className="mb-2.5 text-[10px] font-black uppercase tracking-widest text-resa-red">
              {isFr ? 'Le joueur' : 'The player'}
            </div>
            <div className="space-y-2.5">
              <input
                type="text"
                value={form.player_name}
                onChange={(e) => update('player_name', e.target.value)}
                required
                placeholder={isFr ? "Prénom de l'enfant *" : "Child's first name *"}
                className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={form.player_age}
                  onChange={(e) => update('player_age', e.target.value)}
                  placeholder={isFr ? 'Âge' : 'Age'}
                  className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
                <input
                  type="date"
                  value={form.player_birth_date}
                  onChange={(e) => update('player_birth_date', e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
              </div>
            </div>
          </div>

          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={3}
            placeholder={isFr ? 'Notes, questions (optionnel)' : 'Notes, questions (optional)'}
            className="w-full resize-none rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
          />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              disabled={status === 'loading'}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-resa-navy/10 bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-resa-navy transition hover:border-resa-navy/30 disabled:opacity-50"
            >
              ← {isFr ? 'Retour' : 'Back'}
            </button>
            <button
              type="submit"
              disabled={status === 'loading' || !form.player_name.trim()}
              className="inline-flex flex-2 items-center justify-center gap-2 rounded-full bg-resa-red px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === 'loading'
                ? isFr ? 'Envoi…' : 'Sending…'
                : paymentMode === 'online'
                  ? isFr ? '💳 Payer et réserver' : '💳 Pay & reserve'
                  : isFr ? 'Réserver ma place' : 'Reserve my spot'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}