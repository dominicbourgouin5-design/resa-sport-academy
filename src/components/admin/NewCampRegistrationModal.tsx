'use client';

import { useState } from 'react';
import Modal from '@/components/admin/Modal';
import { createCampRegistrationManually } from '@/app/admin/camps/actions';

type Step = 1 | 2 | 3;
type PaymentOption = 'later' | 'paid';

const METHODS = [
  { value: 'cash', label: '💵 Espèces' },
  { value: 'momo_offline', label: '📱 Mobile Money (hors ligne)' },
  { value: 'bank_transfer', label: '🏦 Virement bancaire' },
  { value: 'check', label: '📝 Chèque' },
  { value: 'manual', label: '✏️ Autre / Manuel' }
];

export default function NewCampRegistrationModal({
  camp,
  onClose,
  onSuccess
}: {
  camp: { id: string; title_fr: string; price_amount?: number | null; price_amount_usd?: number | null };
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentCountry, setParentCountry] = useState('ci');

  const [playerName, setPlayerName] = useState('');
  const [playerAge, setPlayerAge] = useState<string>('');
  const [playerBirthDate, setPlayerBirthDate] = useState('');

  const [notes, setNotes] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const [status, setStatus] = useState<'new' | 'contacted' | 'confirmed'>('confirmed');  
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('later');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('XOF');
  const [method, setMethod] = useState<string>('cash');

  const canGoStep2 =
    parentName.trim().length > 0 &&
    parentEmail.trim().length > 0 &&
    /^\S+@\S+\.\S+$/.test(parentEmail);

  const canGoStep3 = playerName.trim().length > 0;

  // Auto-remplir le montant quand on passe en "payé"
  const handlePaymentOptionChange = (opt: PaymentOption) => {
    setPaymentOption(opt);
    if (opt === 'paid' && !amount) {
      if (camp.price_amount) {
        setAmount(String(camp.price_amount));
        setCurrency('XOF');
      } else if (camp.price_amount_usd) {
        setAmount(String(camp.price_amount_usd));
        setCurrency('USD');
      }
    }
  };

  const handleSubmit = async () => {
    setSending(true);
    setResult(null);

    try {
      const res = await createCampRegistrationManually({
        camp_id: camp.id,
        parent_name: parentName,
        parent_email: parentEmail,
        parent_phone: parentPhone,
        parent_country: parentCountry,
        player_name: playerName,
        player_age: playerAge ? Number(playerAge) : null,
        player_birth_date: playerBirthDate,
        notes,
        admin_notes: adminNotes,
        status,
        payment_option: paymentOption,
        payment_amount: paymentOption === 'paid' ? Number(amount) : null,
        payment_currency: paymentOption === 'paid' ? currency : null,
        payment_method: paymentOption === 'paid' ? method : null
      });

      if (res.error) {
        setResult({ ok: false, error: res.error });
        setSending(false);
        return;
      }

      setResult({ ok: true });
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setResult({ ok: false, error: err.message ?? 'Erreur inconnue' });
      setSending(false);
    }
  };

  if (result?.ok) {
    return (
      <Modal open onClose={onClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md anim-fade-in" onClick={onClose} aria-hidden="true" />
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] anim-fade-up">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-3xl text-white shadow-lg">✓</div>
          <h2 className="font-display text-2xl font-black text-resa-navy">Inscription créée</h2>
          <p className="mt-2 text-sm text-resa-text/60">
            {paymentOption === 'paid'
              ? 'Email de confirmation + reçu PDF envoyés au parent.'
              : "L'inscription a été enregistrée."}
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md anim-fade-in" onClick={onClose} aria-hidden="true" />
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] anim-fade-up">
        <div className="h-1 bg-linear-to-r from-resa-red via-resa-royal to-resa-red" />

        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-resa-red">
            ➕ Nouvelle inscription — {camp.title_fr}
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-resa-text/40 transition hover:bg-resa-gray"
          >✕</button>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 border-b border-black/5 bg-resa-gray/40 px-6 py-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-black transition ${
                step === n ? 'bg-resa-red text-white'
                : step > n ? 'bg-emerald-500 text-white'
                : 'bg-white text-resa-text/40 ring-1 ring-black/5'
              }`}>
                {step > n ? '✓' : n}
              </div>
              <span className={`hidden text-[11px] font-bold uppercase tracking-wider sm:block ${
                step >= n ? 'text-resa-navy' : 'text-resa-text/30'
              }`}>
                {n === 1 ? 'Identité' : n === 2 ? 'Joueur' : 'Paiement'}
              </span>
              {n < 3 && <div className="mx-1 h-px w-6 bg-black/10" />}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-black text-resa-navy">Coordonnées du parent</h2>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Nom complet du parent *"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="Email *"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={parentCountry}
                    onChange={(e) => setParentCountry(e.target.value)}
                    className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                  >
                    <option value="ci">🇨🇮 Côte d'Ivoire</option>
                    <option value="sn">🇸🇳 Sénégal</option>
                    <option value="bj">🇧🇯 Bénin</option>
                    <option value="bf">🇧🇫 Burkina Faso</option>
                    <option value="ml">🇲🇱 Mali</option>
                    <option value="ne">🇳🇪 Niger</option>
                    <option value="tg">🇹🇬 Togo</option>
                    <option value="us">🇺🇸 États-Unis</option>
                    <option value="fr">🇫🇷 France</option>
                  </select>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="Téléphone"
                    className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-black text-resa-navy">Joueur & notes</h2>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nom du joueur *"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={playerAge}
                    onChange={(e) => setPlayerAge(e.target.value)}
                    placeholder="Âge"
                    min={4}
                    max={18}
                    className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                  />
                  <input
                    type="date"
                    value={playerBirthDate}
                    onChange={(e) => setPlayerBirthDate(e.target.value)}
                    className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                  />
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes du parent (optionnel)"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Notes internes admin (optionnel)"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-black/10 bg-gray-50 px-3 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-black text-resa-navy">Statut & Paiement</h2>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                  Statut initial
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('new')}
                    className={`rounded-lg border-2 px-3 py-2.5 text-[12px] font-bold transition ${
                      status === 'new'
                        ? 'border-resa-red bg-resa-red/5 text-resa-navy'
                        : 'border-black/10 bg-white text-resa-text/60 hover:border-resa-navy/30'
                    }`}
                  >
                    🆕 Nouveau
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('contacted')}
                    className={`rounded-lg border-2 px-3 py-2.5 text-[12px] font-bold transition ${
                      status === 'contacted'
                        ? 'border-resa-red bg-resa-red/5 text-resa-navy'
                        : 'border-black/10 bg-white text-resa-text/60 hover:border-resa-navy/30'
                    }`}
                  >
                    📞 Contacté
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('confirmed')}
                    className={`rounded-lg border-2 px-3 py-2.5 text-[12px] font-bold transition ${
                      status === 'confirmed'
                        ? 'border-resa-red bg-resa-red/5 text-resa-navy'
                        : 'border-black/10 bg-white text-resa-text/60 hover:border-resa-navy/30'
                    }`}
                  >
                    ✅ Confirmé
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                  Paiement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePaymentOptionChange('later')}
                    className={`rounded-lg border-2 px-3 py-3 text-left transition ${
                      paymentOption === 'later'
                        ? 'border-resa-red bg-resa-red/5'
                        : 'border-black/10 bg-white hover:border-resa-navy/30'
                    }`}
                  >
                    <div className="text-[12px] font-bold text-resa-navy">📝 À régler plus tard</div>
                    <div className="mt-0.5 text-[10px] text-resa-text/55">
                      Contact ultérieur
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentOptionChange('paid')}
                    className={`rounded-lg border-2 px-3 py-3 text-left transition ${
                      paymentOption === 'paid'
                        ? 'border-resa-red bg-resa-red/5'
                        : 'border-black/10 bg-white hover:border-resa-navy/30'
                    }`}
                  >
                    <div className="text-[12px] font-bold text-resa-navy">✅ Payé immédiatement</div>
                    <div className="mt-0.5 text-[10px] text-resa-text/55">
                      Email + PDF envoyés
                    </div>
                  </button>
                </div>
              </div>

              {paymentOption === 'paid' && (
                <>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
                    ⚠️ Un <strong>email de confirmation</strong> + <strong>reçu PDF</strong> seront envoyés au parent.
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={currency === 'XOF' ? '25000' : '40'}
                      min={1}
                      step={currency === 'XOF' ? '1' : '0.01'}
                      className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[15px] font-bold text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                    />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] font-bold text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                    >
                      <option value="XOF">FCFA</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                      Méthode
                    </label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] font-bold text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                    >
                      {METHODS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {result?.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {result.error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-black/5 bg-resa-gray/40 px-6 py-4">
          {step === 1 && (
            <>
              <button onClick={onClose} className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray">
                Annuler
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canGoStep2}
                className="rounded-full bg-resa-navy px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-resa-royal disabled:opacity-50"
              >
                Suivant →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray">
                ← Retour
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canGoStep3}
                className="rounded-full bg-resa-navy px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-resa-royal disabled:opacity-50"
              >
                Suivant →
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <button onClick={() => setStep(2)} disabled={sending} className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray disabled:opacity-50">
                ← Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={sending}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {sending ? 'Création…' : '✓ Créer l\'inscription'}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}