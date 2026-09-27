'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { sendTrainingRequest } from '@/app/[locale]/contact/actions';
import { WHATSAPP_URL } from '@/lib/utils';

type Program = { slug: string; title_fr: string; title_en: string };
type Coach = {
  id: string;
  slug: string;
  name: string;
  role_fr: string | null;
  role_en: string | null;
};

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

const PARTNER_TYPES = [
  { value: 'sponsor',       label: '💰 Sponsor financier' },
  { value: 'institutional', label: '🏛️ Partenaire institutionnel' },
  { value: 'media',         label: '📣 Partenaire média' },
  { value: 'equipment',     label: '👕 Équipementier' },
  { value: 'other',         label: '🤝 Autre type' }
];

export default function ContactForm({
  programs,
  coaches,
  preselectedSlug,
  preselectedCoach
}: {
  programs: Program[];
  coaches: Coach[];
  preselectedSlug?: string | null;
  preselectedCoach?: string | null;
}) {
  const t = useTranslations('contactForm');
  const locale = useLocale();
  const isFr = locale === 'fr';
  const [state, formAction, pending] = useActionState(sendTrainingRequest, null);

  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [programSlug, setProgramSlug] = useState<string>(preselectedSlug ?? '');
  const [coachSlug, setCoachSlug] = useState<string>(preselectedCoach ?? '');
  const [customSubject, setCustomSubject] = useState('');

  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  // ─── Mode partenaire ───
  const [partnerData, setPartnerData] = useState({
    company_name: '',
    sector: '',
    website_url: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    country: 'ci',
    partnership_type: 'sponsor',
    message: ''
  });
  const [partnerStatus, setPartnerStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [partnerError, setPartnerError] = useState<string | null>(null);

  const updatePartner = (k: string, v: string) =>
    setPartnerData((d) => ({ ...d, [k]: v }));

  useEffect(() => {
    if (state?.ok && formRef.current) {
      formRef.current.reset();
      setProgramSlug('');
      setCoachSlug('');
      setCustomSubject('');
      setParentName('');
      setParentEmail('');
      setStep(1);
    }
  }, [state?.ok]);

  const selectedProgram = programs.find((p) => p.slug === programSlug);
  const isOther = programSlug === '__other__';
  const isPartner = programSlug === '__partner__';
  const totalSteps: 2 | 3 = isOther ? 2 : 3;

  useEffect(() => {
    if (step > totalSteps) setStep(totalSteps as 1 | 2 | 3);
  }, [totalSteps, step]);

  const selectedTitle = isOther
    ? customSubject || (isFr ? 'Autre demande' : 'Other request')
    : isPartner
      ? (isFr ? 'Demande de partenariat' : 'Partnership request')
      : selectedProgram
        ? isFr ? selectedProgram.title_fr : selectedProgram.title_en
        : null;
  const selectedCoach = coaches.find((c) => c.slug === coachSlug);

  const emailOk = /^\S+@\S+\.\S+$/.test(parentEmail);
  const otherOk = !isOther || customSubject.trim() !== '';
  const step1Valid = isPartner
    ? partnerData.company_name.trim() !== '' && partnerData.contact_name.trim() !== ''
    : parentName.trim() !== '' && emailOk && otherOk;

  // ═══ SOUMISSION PARTENAIRE (fetch séparé) ═══
  const handlePartnerSubmit = async () => {
    setPartnerStatus('loading');
    setPartnerError(null);

    try {
      const res = await fetch('/api/partner-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partnerData)
      });
      const json = await res.json();

      if (!res.ok) {
        setPartnerError(json.error ?? 'Erreur inconnue');
        setPartnerStatus('error');
        return;
      }

      setPartnerStatus('success');
    } catch (err: any) {
      setPartnerError(err.message ?? 'Erreur réseau');
      setPartnerStatus('error');
    }
  };

  // ═══ SUCCÈS ═══
  if (state?.ok || partnerStatus === 'success') {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center md:p-10">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-2xl text-white">
          ✓
        </div>
        <h3 className="font-display text-xl font-black text-emerald-800 md:text-2xl">
          {partnerStatus === 'success'
            ? (isFr ? 'Demande de partenariat reçue !' : 'Partnership request received!')
            : t('successTitle')}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-emerald-700">
          {partnerStatus === 'success'
            ? (isFr
                ? 'Merci pour votre intérêt. Notre équipe étudie votre dossier et vous recontacte sous 48h.'
                : 'Thank you for your interest. Our team will review your file and get back to you within 48h.')
            : t('successText')}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:brightness-110"
          >
            💬 {t('whatsappCta')}
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-emerald-700 transition hover:bg-emerald-50"
          >
            {t('sendAnother')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa-lg"
    >
      {/* Header compact */}
      <div className="border-b border-black/5 px-5 py-3.5 md:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 rounded-full bg-resa-red" />
            <div>
              <h2 className="font-display text-lg font-black leading-tight text-resa-navy md:text-xl">
                {isPartner
                  ? (isFr ? 'Demande de partenariat' : 'Partnership request')
                  : isOther
                    ? (isFr ? 'Votre demande' : 'Your request')
                    : t('title')}
              </h2>
              <p className="text-[11px] text-resa-text/55">
                {isPartner
                  ? (isFr ? 'Réponse sous 48h.' : 'Reply within 48h.')
                  : isOther
                    ? (isFr ? 'Écrivez-nous, on vous répond sous 24h.' : 'Write to us, we reply within 24h.')
                    : t('subtitle')}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[9px] font-black uppercase tracking-widest text-resa-text/45">
              {isFr ? 'Étape' : 'Step'}
            </div>
            <div className="font-display text-base font-black leading-none text-resa-red">
              {step}<span className="text-resa-text/30">/{totalSteps}</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2.5 flex items-center gap-2">
          <div className={`h-1 flex-1 rounded-full transition ${step >= 1 ? 'bg-resa-red' : 'bg-resa-gray'}`} />
          <div className={`h-1 flex-1 rounded-full transition ${step >= 2 ? 'bg-resa-red' : 'bg-resa-gray'}`} />
          {totalSteps === 3 && (
            <div className={`h-1 flex-1 rounded-full transition ${step >= 3 ? 'bg-resa-red' : 'bg-resa-gray'}`} />
          )}
        </div>

        {/* Labels */}
        <div className={`mt-1 grid text-[9px] font-bold uppercase tracking-widest ${totalSteps === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <span className={step >= 1 ? 'text-resa-navy' : 'text-resa-text/30'}>
            {isPartner
              ? (isFr ? 'Organisation' : 'Organization')
              : isOther
                ? (isFr ? 'Objet' : 'Subject')
                : (isFr ? 'Projet' : 'Project')}
          </span>
          <span className={`text-center ${step >= 2 ? 'text-resa-navy' : 'text-resa-text/30'}`}>
            {isPartner
              ? (isFr ? 'Contact' : 'Contact')
              : isOther
                ? (isFr ? 'Message' : 'Message')
                : (isFr ? 'Joueur' : 'Player')}
          </span>
          {totalSteps === 3 && (
            <span className={`text-right ${step >= 3 ? 'text-resa-navy' : 'text-resa-text/30'}`}>
              {isPartner
                ? (isFr ? 'Projet' : 'Project')
                : (isFr ? 'Préférences' : 'Preferences')}
            </span>
          )}
        </div>
      </div>

      {/* Bandeau sélection (hors partner) */}
      {!isPartner && (selectedTitle || selectedCoach) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/5 bg-resa-red/5 px-5 py-2 md:px-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
            {selectedTitle && (
              <div className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-resa-red" />
                <span className="text-resa-text/55">{t('selectedProgramLabel')} :</span>
                <span className="font-bold text-resa-navy">{selectedTitle}</span>
              </div>
            )}
            {selectedCoach && (
              <div className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-resa-royal" />
                <span className="text-resa-text/55">{t('selectedCoachLabel')} :</span>
                <span className="font-bold text-resa-navy">{selectedCoach.name}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setProgramSlug('');
              setCoachSlug('');
              setCustomSubject('');
            }}
            className="text-[10px] font-bold text-resa-text/40 transition hover:text-resa-red"
          >
            ✕
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ÉTAPE 1 — Sélecteur + coordonnées OU organisation (partner) */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className={step === 1 ? 'block' : 'hidden'}>
        <div className="space-y-4 p-5 md:p-6">
          {!isPartner && (
            <Group title={isFr ? 'Type de demande' : 'Request type'}>
              <select
                name="program_slug"
                value={programSlug}
                onChange={(e) => setProgramSlug(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[12.5px] text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              >
                <option value="">{t('fieldProgramPlaceholder')}</option>
                {programs.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {isFr ? p.title_fr : p.title_en}
                  </option>
                ))}
                <option value="__partner__">
                  {isFr ? '🤝 Demande de partenariat' : '🤝 Partnership request'}
                </option>
                <option value="__other__">
                  {isFr ? '✏️ Autre demande (question, presse, bénévolat…)' : '✏️ Other request (question, press, volunteering…)'}
                </option>
              </select>

              {isOther && (
                <div className="mt-3">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-resa-text/55">
                    {isFr ? 'Objet de votre demande' : 'Subject of your request'}
                    <span className="ml-1 text-resa-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    required
                    placeholder={
                      isFr
                        ? 'Ex : Presse, Bénévolat, Question…'
                        : 'Ex: Press, Volunteering, Question…'
                    }
                    className="w-full rounded-lg border border-resa-red/30 bg-resa-red/5 px-3 py-2 text-[12.5px] text-resa-navy outline-none transition focus:border-resa-red/60 focus:ring-2 focus:ring-resa-red/10"
                  />
                </div>
              )}

              <input
                type="hidden"
                name="program_title"
                value={isOther ? `Autre — ${customSubject}` : (selectedTitle ?? '')}
              />
            </Group>
          )}

          {/* ─── Champs ORGANISATION (partner) ─── */}
          {isPartner && (
            <>
              <Group title={isFr ? 'Votre organisation' : 'Your organization'}>
                <Field
                  label={isFr ? "Nom de l'organisation *" : 'Organization name *'}
                  value={partnerData.company_name}
                  onChange={(v) => updatePartner('company_name', v)}
                  required
                  placeholder={isFr ? 'Ex : Banque Atlantique CI' : 'Ex: Atlantic Bank'}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label={isFr ? "Secteur d'activité" : 'Industry'}
                    value={partnerData.sector}
                    onChange={(v) => updatePartner('sector', v)}
                    placeholder={isFr ? 'Ex : Banque, Télécoms…' : 'Ex: Banking, Telecom…'}
                  />
                  <Field
                    label={isFr ? 'Site web' : 'Website'}
                    type="url"
                    value={partnerData.website_url}
                    onChange={(v) => updatePartner('website_url', v)}
                    placeholder="https://exemple.ci"
                  />
                </div>
              </Group>

              <Group title={isFr ? 'Contact principal' : 'Primary contact'}>
                <Field
                  label={isFr ? 'Nom du contact *' : 'Contact name *'}
                  value={partnerData.contact_name}
                  onChange={(v) => updatePartner('contact_name', v)}
                  required
                  placeholder={isFr ? 'Ex : M. Kouassi' : 'Ex: Mr. Smith'}
                />
              </Group>
            </>
          )}

          {/* ─── Champs COORDONNÉES (mode normal) ─── */}
          {!isPartner && (
            <Group title={t('sectionParent')}>
              <Field
                label={t('fieldParentName')}
                name="parent_name"
                required
                placeholder={isFr ? 'Ex : M. Kouassi Jean' : 'Ex: Mr. John Smith'}
                value={parentName}
                onChange={setParentName}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={t('fieldParentEmail')}
                  name="parent_email"
                  type="email"
                  required
                  placeholder="email@example.com"
                  value={parentEmail}
                  onChange={setParentEmail}
                />
                <Field
                  label={t('fieldParentPhone')}
                  name="parent_phone"
                  type="tel"
                  placeholder="+225 07 00 00 00 00"
                />
              </div>
            </Group>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ÉTAPE 2 — Joueur (normal) OU Contact complet (partner)  */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isPartner && (
        <div className={step === 2 ? 'block' : 'hidden'}>
          <div className="space-y-4 p-5 md:p-6">
            <Group title={isFr ? 'Coordonnées du contact' : 'Contact details'}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Email *"
                  type="email"
                  value={partnerData.contact_email}
                  onChange={(v) => updatePartner('contact_email', v)}
                  required
                  placeholder="email@exemple.ci"
                />
                <Field
                  label={isFr ? 'Téléphone (WhatsApp)' : 'Phone (WhatsApp)'}
                  type="tel"
                  value={partnerData.contact_phone}
                  onChange={(v) => updatePartner('contact_phone', v)}
                  placeholder="+225 07 00 00 00 00"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/55">
                  {isFr ? 'Pays' : 'Country'}
                </label>
                <select
                  value={partnerData.country}
                  onChange={(e) => updatePartner('country', e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[12.5px] text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
            </Group>
          </div>
        </div>
      )}

      {!isPartner && !isOther && (
        <div className={step === 2 ? 'block' : 'hidden'}>
          <div className="space-y-4 p-5 md:p-6">
            <Group title={t('sectionPlayer')}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={t('fieldPlayerName')}
                  name="player_name"
                  placeholder={isFr ? "Prénom de l'enfant" : "Child's first name"}
                />
                <Field
                  label={t('fieldPlayerAge')}
                  name="player_age"
                  type="number"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/55">
                  {t('fieldPlayerLevel')}
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    { value: 'beginner', key: 'levelBeginner' },
                    { value: 'intermediate', key: 'levelIntermediate' },
                    { value: 'advanced', key: 'levelAdvanced' }
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="group flex cursor-pointer items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-[12.5px] transition has-[:checked]:border-resa-red has-[:checked]:bg-resa-red/5"
                    >
                      <input
                        type="radio"
                        name="player_level"
                        value={opt.value}
                        className="h-3.5 w-3.5 border-black/20 text-resa-red focus:ring-resa-red/30"
                      />
                      <span className="font-medium text-resa-navy group-has-[:checked]:font-bold">
                        {t(opt.key as any)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </Group>
          </div>
        </div>
      )}

      {isOther && (
        <div className={step === 2 ? 'block' : 'hidden'}>
          <div className="space-y-4 p-5 md:p-6">
            <Group title={isFr ? 'Votre message' : 'Your message'}>
              <textarea
                name="message"
                rows={7}
                placeholder={
                  isFr
                    ? 'Décrivez votre demande en détail — plus vous nous donnez de contexte, mieux on pourra vous répondre.'
                    : 'Describe your request in detail — the more context, the better we can answer.'
                }
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[12.5px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
            </Group>

            {state?.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                {state.error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* ÉTAPE 3 — Préférences (normal) OU Projet (partner)      */}
      {/* ═══════════════════════════════════════════════════════ */}
      {isPartner && (
        <div className={step === 3 ? 'block' : 'hidden'}>
          <div className="space-y-5 p-5 md:p-6">
            <Group title={isFr ? 'Type de partenariat souhaité' : 'Desired partnership type'}>
              <div className="grid gap-2 sm:grid-cols-2">
                {PARTNER_TYPES.map((pt) => (
                  <label
                    key={pt.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-[12.5px] transition ${
                      partnerData.partnership_type === pt.value
                        ? 'border-resa-red bg-resa-red/5'
                        : 'border-black/10 bg-white hover:border-resa-navy/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="partnership_type"
                      value={pt.value}
                      checked={partnerData.partnership_type === pt.value}
                      onChange={(e) => updatePartner('partnership_type', e.target.value)}
                      className="h-3.5 w-3.5 border-black/20 text-resa-red focus:ring-resa-red/30"
                    />
                    <span className="font-medium text-resa-navy">{pt.label}</span>
                  </label>
                ))}
              </div>
            </Group>

            <Group title={isFr ? 'Votre projet' : 'Your project'}>
              <textarea
                value={partnerData.message}
                onChange={(e) => updatePartner('message', e.target.value)}
                rows={5}
                placeholder={
                  isFr
                    ? 'Décrivez votre projet de partenariat — plus vous nous donnez de contexte, mieux on pourra vous répondre.'
                    : 'Describe your partnership project — the more context, the better we can answer.'
                }
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[12.5px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
            </Group>

            {partnerError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                {partnerError}
              </div>
            )}
          </div>
        </div>
      )}

      {!isPartner && !isOther && (
        <div className={step === 3 ? 'block' : 'hidden'}>
          <div className="space-y-4 p-5 md:p-6">
            <Group title={t('sectionPreferences')}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/55">
                    {t('fieldRegion')}
                  </label>
                  <div className="grid gap-2 grid-cols-2">
                    {[
                      { value: 'africa', label: '🇨🇮 Africa' },
                      { value: 'usa', label: '🇺🇸 USA' }
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className="group flex cursor-pointer items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 text-[12.5px] transition has-[:checked]:border-resa-red has-[:checked]:bg-resa-red/5"
                      >
                        <input
                          type="radio"
                          name="region"
                          value={opt.value}
                          defaultChecked={opt.value === 'africa'}
                          className="h-3.5 w-3.5 border-black/20 text-resa-red focus:ring-resa-red/30"
                        />
                        <span className="font-medium text-resa-navy group-has-[:checked]:font-bold">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {coaches.length > 0 && (
                  <div>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/55">
                      {t('fieldCoach')}
                    </label>
                    <select
                      name="preferred_coach"
                      value={coachSlug ? coaches.find((c) => c.slug === coachSlug)?.name ?? '' : ''}
                      onChange={(e) => {
                        const name = e.target.value;
                        const found = coaches.find((c) => c.name === name);
                        setCoachSlug(found?.slug ?? '');
                      }}
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[12.5px] text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                    >
                      <option value="">{t('fieldCoachPlaceholder')}</option>
                      {coaches.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                          {isFr ? (c.role_fr ? ` — ${c.role_fr}` : '') : (c.role_en ? ` — ${c.role_en}` : '')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <Field
                label={t('fieldAvailability')}
                name="availability"
                as="textarea"
                rows={2}
                placeholder={
                  isFr
                    ? 'Ex : Samedi matin, dimanche après-midi…'
                    : 'Ex: Saturday morning, Sunday afternoon…'
                }
              />
            </Group>

            <Group title={t('fieldMessage')}>
              <textarea
                name="message"
                rows={3}
                placeholder={t('fieldMessagePlaceholder')}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[12.5px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
            </Group>

            {state?.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                {state.error}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Footer ═══ */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 bg-resa-gray/30 px-5 py-3 md:px-6">
        {step > 1 ? (
          <button
            key={`back-${step}`}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
            disabled={pending}
            className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-[11px] font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray disabled:opacity-50"
          >
            ← {isFr ? 'Retour' : 'Back'}
          </button>
        ) : (
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-resa-text/55 transition hover:text-[#25D366]"
          >
            💬 {t('preferWhatsapp')}
          </a>
        )}

        {step < totalSteps ? (
          <button
            key={`next-${step}`}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
            disabled={step === 1 && !step1Valid}
            className="inline-flex items-center gap-2 rounded-full bg-resa-red px-6 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFr ? 'Suivant' : 'Next'} →
          </button>
        ) : isPartner ? (
          <button
            key={`submit-partner-${step}`}
            type="button"
            onClick={handlePartnerSubmit}
            disabled={partnerStatus === 'loading'}
            className="inline-flex items-center gap-2 rounded-full bg-resa-red px-6 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
          >
            {partnerStatus === 'loading'
              ? (isFr ? 'Envoi…' : 'Sending…')
              : (isFr ? 'Envoyer ma demande' : 'Send my request')}
            {partnerStatus !== 'loading' && <span>→</span>}
          </button>
        ) : (
          <button
            key={`submit-${step}`}
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-resa-red px-6 py-2.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
          >
            {pending
              ? t('submitting')
              : isOther
                ? (isFr ? 'Envoyer ma demande' : 'Send my request')
                : t('submit')}
            {!pending && <span>→</span>}
          </button>
        )}
      </div>
    </form>
  );
}

// ─── Group compact ───
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-resa-navy">
        <span className="h-1 w-1 rounded-full bg-resa-red" />
        {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

// ─── Field compact ───
function Field({
  label,
  name,
  defaultValue,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  hint,
  as = 'input',
  rows = 3
}: {
  label: string;
  name?: string;
  defaultValue?: string | null;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  as?: 'input' | 'textarea';
  rows?: number;
}) {
  const isControlled = value !== undefined;
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-resa-text/55">
        {label}
        {required && <span className="ml-1 text-resa-red">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          name={name}
          defaultValue={defaultValue ?? ''}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[12.5px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
        />
      ) : (
        <input
          type={type}
          name={name}
          {...(isControlled
            ? { value, onChange: (e) => onChange?.(e.target.value) }
            : { defaultValue: defaultValue ?? '' })}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[12.5px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
        />
      )}
      {hint && <div className="mt-0.5 text-[10px] text-resa-text/40">{hint}</div>}
    </div>
  );
}