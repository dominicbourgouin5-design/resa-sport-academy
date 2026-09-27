'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/admin/Modal';
import {
  createTrainingRequestManually,
  getTrainingProgramRates,
  type TrainingRate
} from '@/app/admin/demandes-training/actions';

type Step = 1 | 2 | 3;
type PaymentOption = 'later' | 'paid';

const METHODS = [
  { value: 'cash', label: '💵 Espèces' },
  { value: 'momo_offline', label: '📱 Mobile Money (hors ligne)' },
  { value: 'bank_transfer', label: '🏦 Virement bancaire' },
  { value: 'check', label: '📝 Chèque' },
  { value: 'manual', label: '✏️ Autre / Manuel' }
];

export default function NewTrainingRequestModal({
  programs,
  onClose,
  onSuccess
}: {
  programs: { slug: string; title_fr: string }[];
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  // ─── Champs ───
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentCountry, setParentCountry] = useState('ci');

  const [playerName, setPlayerName] = useState('');
  const [playerAge, setPlayerAge] = useState<string>('');
  const [playerLevel, setPlayerLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');

  const [region, setRegion] = useState<'africa' | 'usa' | 'both'>('africa');
  const [programSlug, setProgramSlug] = useState<string>(programs[0]?.slug ?? '');
  const [programTitle, setProgramTitle] = useState<string>(programs[0]?.title_fr ?? '');
  const [preferredCoach, setPreferredCoach] = useState('');
  const [availability, setAvailability] = useState('');
  const [message, setMessage] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const [status, setStatus] = useState<'pending' | 'contacted' | 'booked'>('booked');
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('later');
  const [rates, setRates] = useState<TrainingRate[]>([]);
  const [selectedRateIdx, setSelectedRateIdx] = useState<number>(0);
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('XOF');
  const [method, setMethod] = useState<string>('cash');
  const [loadingRates, setLoadingRates] = useState(false);

  // ─── Charger les rates quand programme change (si paiement immédiat) ───
  useEffect(() => {
    if (paymentOption !== 'paid' || !programSlug) return;
    let cancelled = false;

    (async () => {
      try {
        setLoadingRates(true);
        const list = await getTrainingProgramRates(programSlug, programTitle);
        if (cancelled) return;
        setRates(list);
        setSelectedRateIdx(0);
        if (list[0]) {
          setAmount(String(list[0].amount_xof ?? ''));
          setCurrency('XOF');
        }
      } catch (err) {
        console.warn('[NewTrainingRequest] rates lookup:', err);
      } finally {
        if (!cancelled) setLoadingRates(false);
      }
    })();

    return () => { cancelled = true; };
  }, [programSlug, programTitle, paymentOption]);

  // ─── Appliquer une formule ───
  const applyRate = (idx: number, curr: string = currency) => {
    setSelectedRateIdx(idx);
    const r = rates[idx];
    if (!r) return;
    if (curr === 'XOF' && r.amount_xof) setAmount(String(r.amount_xof));
    else if (curr === 'USD' && r.amount_usd) setAmount(String(r.amount_usd));
    else if (curr === 'EUR' && r.amount_usd) {
      setAmount(String(r.amount_usd));
      setCurrency('USD');
    }
  };

  const handleCurrencyChange = (newCurr: string) => {
    setCurrency(newCurr);
    if (rates.length > 0) applyRate(selectedRateIdx, newCurr);
  };

  const canGoStep2 =
    parentName.trim().length > 0 &&
    parentEmail.trim().length > 0 &&
    /^\S+@\S+\.\S+$/.test(parentEmail);

  const canGoStep3 = playerName.trim().length > 0 && programSlug !== '';

  const handleSubmit = async () => {
    setSending(true);
    setResult(null);

    try {
      const res = await createTrainingRequestManually({
        parent_name: parentName,
        parent_email: parentEmail,
        parent_phone: parentPhone,
        parent_country: parentCountry,
        player_name: playerName,
        player_age: playerAge ? Number(playerAge) : null,
        player_level: playerLevel,
        region,
        program_slug: programSlug,
        program_title: programTitle,
        preferred_coach: preferredCoach,
        availability,
        message,
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

  // ═══ Succès ═══
  if (result?.ok) {
    return (
      <Modal open onClose={onClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md anim-fade-in" onClick={onClose} aria-hidden="true" />
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] anim-fade-up">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-3xl text-white shadow-lg">✓</div>
          <h2 className="font-display text-2xl font-black text-resa-navy">Demande créée</h2>
          <p className="mt-2 text-sm text-resa-text/60">
            {paymentOption === 'paid'
              ? 'Email de confirmation + reçu PDF envoyés au parent.'
              : 'La demande a été enregistrée.'}
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

        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-resa-red">
            ➕ Nouvelle demande — Training
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
                {n === 1 ? 'Identité' : n === 2 ? 'Détails' : 'Paiement'}
              </span>
              {n < 3 && <div className="mx-1 h-px w-6 bg-black/10" />}
            </div>
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">

          {/* ═══ ÉTAPE 1 — Identité ═══ */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-black text-resa-navy">Coordonnées du parent</h2>
                <p className="mt-1 text-sm text-resa-text/60">Informations de contact.</p>
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

          {/* ═══ ÉTAPE 2 — Détails ═══ */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-black text-resa-navy">Détails de la demande</h2>
                <p className="mt-1 text-sm text-resa-text/60">Joueur + programme.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Nom du joueur *"
                  className="col-span-2 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
                <input
                  type="number"
                  value={playerAge}
                  onChange={(e) => setPlayerAge(e.target.value)}
                  placeholder="Âge"
                  min={4}
                  max={18}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
                <select
                  value={playerLevel}
                  onChange={(e) => setPlayerLevel(e.target.value as any)}
                  className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                >
                  <option value="beginner">Débutant</option>
                  <option value="intermediate">Intermédiaire</option>
                  <option value="advanced">Avancé</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                    Programme *
                  </label>
                  <select
                    value={programSlug}
                    onChange={(e) => {
                      const slug = e.target.value;
                      setProgramSlug(slug);
                      const p = programs.find((x) => x.slug === slug);
                      setProgramTitle(p?.title_fr ?? '');
                    }}
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                  >
                    {programs.map((p) => (
                      <option key={p.slug} value={p.slug}>{p.title_fr}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                    Région
                  </label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as any)}
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                  >
                    <option value="africa">🇨🇮 Africa</option>
                    <option value="usa">🇺🇸 USA</option>
                    <option value="both">🌍 Les deux</option>
                  </select>
                </div>
              </div>

              <input
                type="text"
                value={preferredCoach}
                onChange={(e) => setPreferredCoach(e.target.value)}
                placeholder="Coach souhaité (optionnel)"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />

              <textarea
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="Disponibilités (ex : Samedi matin, Dimanche après-midi…)"
                rows={2}
                className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message/notes du parent (optionnel)"
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
          )}

          {/* ═══ ÉTAPE 3 — Statut + Paiement ═══ */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-black text-resa-navy">Statut & Paiement</h2>
                <p className="mt-1 text-sm text-resa-text/60">Où en est cette demande ?</p>
              </div>

              {/* Statut */}
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                  Statut initial
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('pending')}
                    className={`rounded-lg border-2 px-3 py-2.5 text-[12px] font-bold transition ${
                      status === 'pending'
                        ? 'border-resa-red bg-resa-red/5 text-resa-navy'
                        : 'border-black/10 bg-white text-resa-text/60 hover:border-resa-navy/30'
                    }`}
                  >
                    🆕 En attente
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
                    onClick={() => setStatus('booked')}
                    className={`rounded-lg border-2 px-3 py-2.5 text-[12px] font-bold transition ${
                      status === 'booked'
                        ? 'border-resa-red bg-resa-red/5 text-resa-navy'
                        : 'border-black/10 bg-white text-resa-text/60 hover:border-resa-navy/30'
                    }`}
                  >
                    ✅ Réservé
                  </button>
                </div>
              </div>

              {/* Paiement */}
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                  Paiement
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentOption('later')}
                    className={`rounded-lg border-2 px-3 py-3 text-left transition ${
                      paymentOption === 'later'
                        ? 'border-resa-red bg-resa-red/5'
                        : 'border-black/10 bg-white hover:border-resa-navy/30'
                    }`}
                  >
                    <div className="text-[12px] font-bold text-resa-navy">📝 À régler plus tard</div>
                    <div className="mt-0.5 text-[10px] text-resa-text/55">
                      Momo hors ligne, espèces, virement…
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentOption('paid')}
                    className={`rounded-lg border-2 px-3 py-3 text-left transition ${
                      paymentOption === 'paid'
                        ? 'border-resa-red bg-resa-red/5'
                        : 'border-black/10 bg-white hover:border-resa-navy/30'
                    }`}
                  >
                    <div className="text-[12px] font-bold text-resa-navy">✅ Payé immédiatement</div>
                    <div className="mt-0.5 text-[10px] text-resa-text/55">
                      Email + reçu PDF envoyés
                    </div>
                  </button>
                </div>
              </div>

              {/* Si payé : formulaire de paiement */}
              {paymentOption === 'paid' && (
                <>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
                    ⚠️ Un <strong>email de confirmation</strong> + <strong>reçu PDF</strong> seront envoyés au parent.
                  </div>

                  {rates.length > 1 && (
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                        Formule
                        {loadingRates && <span className="ml-2 text-resa-text/40">⏳…</span>}
                      </label>
                      <select
                        value={selectedRateIdx}
                        onChange={(e) => applyRate(Number(e.target.value))}
                        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] font-bold text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                      >
                        {rates.map((r, i) => (
                          <option key={i} value={i}>
                            {r.label_fr}
                            {r.amount_xof ? ` — ${r.amount_xof.toLocaleString('fr-FR')} FCFA` : ''}
                            {r.amount_usd ? ` / $${r.amount_usd}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={currency === 'XOF' ? '25000' : '25.00'}
                      min={1}
                      step={currency === 'XOF' ? '1' : '0.01'}
                      className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[15px] font-bold text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                    />
                    <select
                      value={currency}
                      onChange={(e) => handleCurrencyChange(e.target.value)}
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
                {sending ? 'Création…' : '✓ Créer la demande'}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}