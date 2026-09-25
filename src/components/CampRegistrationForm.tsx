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

export default function CampRegistrationForm({
  camp,
  initialValues = null
}: {
  camp: any;
  initialValues?: InitialValues;
}) {
  const locale = useLocale();
  const isFr = locale === 'fr';

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [paymentChoice, setPaymentChoice] = useState<'later' | 'online'>(
    initialValues?.payment_choice === 'online' ? 'online' : 'later'
  );
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const result = await sendCampRegistration({
        camp_id: camp.id,
        camp_slug: camp.slug,
        ...form,
        payment_choice: paymentChoice,
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

  const reset = () => {
    setStatus('idle');
    setPaymentChoice('later');
    setForm({
      parent_name: '',
      parent_email: '',
      parent_country: 'ci',
      parent_phone: '',
      player_name: '',
      player_age: '',
      player_birth_date: '',
      notes: ''
    });
  };

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center shadow-resa">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-2xl text-white">
          ✓
        </div>
        <h3 className="font-display text-xl font-black text-emerald-800">
          {isFr ? 'Inscription enregistrée !' : 'Registration recorded!'}
        </h3>
        <p className="mt-2 text-sm text-emerald-700">
          {isFr
            ? 'Notre équipe vous contactera sous 48h pour finaliser le paiement.'
            : 'Our team will contact you within 48h to finalize payment.'}
        </p>
        <button
          onClick={reset}
          className="mt-4 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-emerald-600"
        >
          {isFr ? 'Nouvelle inscription' : 'New registration'}
        </button>
      </div>
    );
  }

  const isClosed = camp.status !== 'open';
  const hasPrice = !!camp.price_amount;

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa-lg">
      <div className="h-1 bg-linear-to-r from-resa-red via-resa-royal to-resa-red" />

      {/* Bandeau "formulaire pré-rempli" (mode rebook) */}
      {initialValues && (
        <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-3">
          <div className="flex items-start gap-2 text-[12px] text-emerald-800">
            <span className="mt-0.5">✓</span>
            <span>
              {isFr
                ? 'Nous avons pré-rempli le formulaire avec vos choix précédents. Vérifiez, modifiez si besoin, puis validez.'
                : 'We pre-filled the form with your previous choices. Review, adjust if needed, then confirm.'}
            </span>
          </div>
        </div>
      )}

      <div className="border-b border-black/5 px-6 py-5">
        <h3 className="font-display text-xl font-black text-resa-navy">
          {isFr ? 'Inscription' : 'Registration'}
        </h3>
        <p className="mt-1 text-xs text-resa-text/60">
          {isClosed
            ? isFr
              ? 'Les inscriptions sont fermées pour cet événement.'
              : 'Registration is closed for this event.'
            : isFr
              ? 'Remplissez le formulaire ci-dessous.'
              : 'Fill out the form below.'}
        </p>
      </div>

      {isClosed ? (
        <div className="p-6 text-center">
          <div className="text-4xl">🚫</div>
          <p className="mt-3 text-sm text-resa-text/60">
            {isFr ? 'Les inscriptions sont clôturées.' : 'Registration is closed.'}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Mode paiement */}
          {hasPrice && (
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                {isFr ? 'Mode de paiement' : 'Payment method'}
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPaymentChoice('later')}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition',
                    paymentChoice === 'later'
                      ? 'border-resa-red bg-resa-red/5'
                      : 'border-black/10 bg-white hover:border-resa-navy/30'
                  )}
                >
                  <span className="mt-0.5 text-lg">📝</span>
                  <div>
                    <div className="text-[13px] font-bold text-resa-navy">
                      {isFr ? 'Réserver sans payer' : 'Book without paying'}
                    </div>
                    <div className="mt-0.5 text-[11px] text-resa-text/55">
                      {isFr
                        ? 'Notre équipe vous contactera pour finaliser.'
                        : 'Our team will contact you to finalize.'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentChoice('online')}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border-2 px-4 py-3 text-left transition',
                    paymentChoice === 'online'
                      ? 'border-resa-red bg-resa-red/5'
                      : 'border-black/10 bg-white hover:border-resa-navy/30'
                  )}
                >
                  <span className="mt-0.5 text-lg">💳</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-[13px] font-bold text-resa-navy">
                      {isFr ? 'Payer en ligne' : 'Pay online'}
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-700">
                        {camp.price_fr ?? ''}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[11px] text-resa-text/55">
                      {isFr
                        ? 'Wave · Orange Money · MTN MoMo · Carte'
                        : 'Wave · Orange Money · MTN MoMo · Card'}
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Coordonnées */}
          <div className="space-y-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-resa-red">
              {isFr ? 'Vos coordonnées' : 'Your details'}
            </div>
            <input
              type="text"
              value={form.parent_name}
              onChange={(e) => update('parent_name', e.target.value)}
              required
              placeholder={isFr ? 'Nom complet du parent *' : 'Parent full name *'}
              className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
            />
            <input
              type="email"
              value={form.parent_email}
              onChange={(e) => update('parent_email', e.target.value)}
              required
              placeholder="Email *"
              className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
            />

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                {isFr ? 'Pays' : 'Country'}
              </label>
              <select
                value={form.parent_country}
                onChange={(e) => update('parent_country', e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="tel"
              value={form.parent_phone}
              onChange={(e) => update('parent_phone', e.target.value)}
              placeholder={
                isFr
                  ? `Téléphone (${COUNTRIES.find((c) => c.code === form.parent_country)?.dial ?? ''}…)`
                  : `Phone (${COUNTRIES.find((c) => c.code === form.parent_country)?.dial ?? ''}…)`
              }
              className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
            />
          </div>

          {/* Joueur */}
          <div className="space-y-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-resa-red">
              {isFr ? 'Le joueur' : 'The player'}
            </div>
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

          <textarea
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            rows={3}
            placeholder={isFr ? 'Notes, questions (optionnel)' : 'Notes, questions (optional)'}
            className="w-full resize-y rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
          />

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-resa-red px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
          >
            {status === 'loading'
              ? isFr ? 'Envoi…' : 'Sending…'
              : paymentChoice === 'online' && hasPrice
                ? isFr ? '💳 Payer et réserver' : '💳 Pay & reserve'
                : isFr ? 'Réserver ma place' : 'Reserve my spot'}
          </button>
        </form>
      )}
    </div>
  );
}