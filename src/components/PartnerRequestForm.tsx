'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

type Step = 1 | 2 | 3;

const COUNTRIES = [
  { code: 'ci', label: "🇨🇮 Côte d'Ivoire" },
  { code: 'sn', label: '🇸🇳 Sénégal' },
  { code: 'bj', label: '🇧🇯 Bénin' },
  { code: 'bf', label: '🇧🇫 Burkina Faso' },
  { code: 'ml', label: '🇲🇱 Mali' },
  { code: 'ne', label: '🇳🇪 Niger' },
  { code: 'tg', label: '🇹🇬 Togo' },
  { code: 'us', label: '🇺🇸 États-Unis' },
  { code: 'fr', label: '🇫🇷 France' },
  { code: 'other', label: '🌍 Autre' }
];

const TYPES = [
  { value: 'sponsor',       label: '💰 Sponsor financier' },
  { value: 'institutional', label: '🏛️ Partenaire institutionnel' },
  { value: 'media',         label: '📣 Partenaire média' },
  { value: 'equipment',     label: '👕 Équipementier' },
  { value: 'other',         label: '🤝 Autre type' }
];

export default function PartnerRequestForm() {
  const locale = useLocale();
  const isFr = locale === 'fr';

  const [step, setStep] = useState<Step>(1);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    company_name: '',
    sector: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    country: 'ci',
    website_url: '',
    partnership_type: 'sponsor',
    message: ''
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // ─── Validations par étape ───
  const step1Valid =
    form.company_name.trim().length > 0 &&
    form.website_url === '' || /^https?:\/\/.+/.test(form.website_url);

  const step2Valid =
    form.contact_name.trim().length > 0 &&
    /^\S+@\S+\.\S+$/.test(form.contact_email);

  const handleSubmit = async () => {
    setStatus('loading');
    setErrorMsg(null);

    try {
      const res = await fetch('/api/partner-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error ?? 'Erreur inconnue');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err.message ?? 'Erreur réseau');
      setStatus('error');
    }
  };

  // ═══ SUCCÈS ═══
  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center md:p-10">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-3xl text-white shadow-lg">
          ✓
        </div>
        <h3 className="font-display text-2xl font-black text-emerald-800">
          {isFr ? 'Demande bien reçue !' : 'Request received!'}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm text-emerald-700">
          {isFr
            ? 'Merci pour votre intérêt. Notre équipe étudie votre dossier et vous recontacte sous 48h.'
            : 'Thank you for your interest. Our team will review your file and get back to you within 48h.'}
        </p>
      </div>
    );
  }

  const stepLabels = [
    isFr ? 'Organisation' : 'Organization',
    isFr ? 'Contact' : 'Contact',
    isFr ? 'Projet' : 'Project'
  ];

  return (
        <form
        onSubmit={(e) => e.preventDefault()}
        className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)]"
        >
      {/* ═══ Header ═══ */}
      <div className="border-b border-black/5 px-6 py-4 md:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-resa-red" />
            <div>
              <h3 className="font-display text-lg font-black leading-tight text-resa-navy md:text-xl">
                {isFr ? 'Formulaire de partenariat' : 'Partnership form'}
              </h3>
              <p className="text-[11px] text-resa-text/55">
                {isFr ? 'Réponse sous 48h.' : 'Reply within 48h.'}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[9px] font-black uppercase tracking-widest text-resa-text/45">
              {isFr ? 'Étape' : 'Step'}
            </div>
            <div className="font-display text-base font-black leading-none text-resa-red">
              {step}<span className="text-resa-text/30">/3</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-2">
          <div className={`h-1 flex-1 rounded-full transition ${step >= 1 ? 'bg-resa-red' : 'bg-resa-gray'}`} />
          <div className={`h-1 flex-1 rounded-full transition ${step >= 2 ? 'bg-resa-red' : 'bg-resa-gray'}`} />
          <div className={`h-1 flex-1 rounded-full transition ${step >= 3 ? 'bg-resa-red' : 'bg-resa-gray'}`} />
        </div>

        {/* Labels */}
        <div className="mt-1 grid grid-cols-3 text-[9px] font-bold uppercase tracking-widest">
          <span className={step >= 1 ? 'text-resa-navy' : 'text-resa-text/30'}>
            {stepLabels[0]}
          </span>
          <span className={`text-center ${step >= 2 ? 'text-resa-navy' : 'text-resa-text/30'}`}>
            {stepLabels[1]}
          </span>
          <span className={`text-right ${step >= 3 ? 'text-resa-navy' : 'text-resa-text/30'}`}>
            {stepLabels[2]}
          </span>
        </div>
      </div>

      {/* ═══ Étape 1 : Organisation ═══ */}
      {step === 1 && (
        <div className="space-y-4 p-6 md:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label={isFr ? "Nom de l'organisation *" : 'Organization name *'}
              value={form.company_name}
              onChange={(v) => update('company_name', v)}
              placeholder={isFr ? 'Ex : Banque Atlantique CI' : 'Ex: Atlantic Bank'}
              required
            />
            <Field
              label={isFr ? "Secteur d'activité" : 'Industry'}
              value={form.sector}
              onChange={(v) => update('sector', v)}
              placeholder={isFr ? 'Ex : Banque, Télécoms…' : 'Ex: Banking, Telecom…'}
            />
          </div>

          <Field
            label={isFr ? 'Site web' : 'Website'}
            type="url"
            value={form.website_url}
            onChange={(v) => update('website_url', v)}
            placeholder="https://exemple.ci"
          />
        </div>
      )}

      {/* ═══ Étape 2 : Contact ═══ */}
      {step === 2 && (
        <div className="space-y-4 p-6 md:p-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label={isFr ? 'Nom du contact *' : 'Contact name *'}
              value={form.contact_name}
              onChange={(v) => update('contact_name', v)}
              placeholder={isFr ? 'Ex : M. Kouassi' : 'Ex: Mr. Smith'}
              required
            />
            <Field
              label="Email *"
              type="email"
              value={form.contact_email}
              onChange={(v) => update('contact_email', v)}
              placeholder="email@exemple.ci"
              required
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label={isFr ? 'Téléphone (WhatsApp)' : 'Phone (WhatsApp)'}
              type="tel"
              value={form.contact_phone}
              onChange={(v) => update('contact_phone', v)}
              placeholder="+225 07 00 00 00 00"
            />
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/55">
                {isFr ? 'Pays' : 'Country'}
              </label>
              <select
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Étape 3 : Projet ═══ */}
      {step === 3 && (
        <div className="space-y-5 p-6 md:p-8">
          <div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-resa-text/55">
              {isFr ? 'Type de partenariat souhaité' : 'Desired partnership type'}
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {TYPES.map((t) => (
                <label
                  key={t.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-[12.5px] transition ${
                    form.partnership_type === t.value
                      ? 'border-resa-red bg-resa-red/5'
                      : 'border-black/10 bg-white hover:border-resa-navy/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="partnership_type"
                    value={t.value}
                    checked={form.partnership_type === t.value}
                    onChange={(e) => update('partnership_type', e.target.value)}
                    className="h-3.5 w-3.5 border-black/20 text-resa-red focus:ring-resa-red/30"
                  />
                  <span className="font-medium text-resa-navy">{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/55">
              {isFr ? 'Votre projet / message' : 'Your project / message'}
            </label>
            <textarea
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              rows={4}
              placeholder={
                isFr
                  ? 'Décrivez votre projet de partenariat…'
                  : 'Describe your partnership project…'
              }
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
            />
          </div>

          {status === 'error' && errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}
        </div>
      )}

      {/* ═══ Footer ═══ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 bg-resa-gray/30 px-6 py-4 md:px-8">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
            disabled={status === 'loading'}
            className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray disabled:opacity-50"
          >
            ← {isFr ? 'Retour' : 'Back'}
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
            disabled={
              (step === 1 && !step1Valid) ||
              (step === 2 && !step2Valid)
            }
            className="inline-flex items-center gap-2 rounded-full bg-resa-red px-6 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFr ? 'Suivant' : 'Next'} →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === 'loading'}
            className="inline-flex items-center gap-2 rounded-full bg-resa-red px-6 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
          >
            {status === 'loading'
              ? (isFr ? 'Envoi…' : 'Sending…')
              : (isFr ? 'Envoyer ma demande' : 'Send my request')}
            {status !== 'loading' && <span>→</span>}
          </button>
        )}
      </div>
    </form>
  );
}

// ─── Field helper ───
function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/55">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
      />
    </div>
  );
}