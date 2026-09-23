'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { WHATSAPP_URL, cn } from '@/lib/utils';
import InscriptionsHero from './InscriptionsHero';

type Mode = 'school' | 'individual';

export default function InscriptionForm({ categories }: { categories: any[] }) {
  const t = useTranslations('inscriptions');
  const [mode, setMode] = useState<Mode>('school');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const [form, setForm] = useState({
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    message: '',
    school_name: '',
    school_city: '',
    category_codes: [] as string[],
    player_first_name: '',
    player_birth_date: '',
    player_position: ''
  });

  const update = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const toggleCategory = (code: string) => {
    setForm((f) => ({
      ...f,
      category_codes: f.category_codes.includes(code)
        ? f.category_codes.filter((c) => c !== code)
        : [...f.category_codes, code]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: mode, ...form })
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setForm({
      contact_name: '', contact_phone: '', contact_email: '', message: '',
      school_name: '', school_city: '', category_codes: [],
      player_first_name: '', player_birth_date: '', player_position: ''
    });
  };

  // ─── SUCCESS ───────────────────────────────────────────────
  if (status === 'success') {
    return (
      <section className="relative overflow-hidden bg-resa-navy py-20 text-white md:py-28">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-halo" />
        <div className="relative mx-auto max-w-2xl px-4 md:px-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-md md:p-14">
            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full bg-emerald-500 text-4xl font-black shadow-[0_0_40px_rgba(16,185,129,.4)]">
              ✓
            </div>
            <h1 className="font-display text-3xl font-black md:text-4xl">
              {t('success')}
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-white/75">
              {t('successText')}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <button
                onClick={reset}
                className="rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-white/20"
              >
                {t('sendAnother')}
              </button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:brightness-110"
              >
                {t('whatsappCta')} →
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ─── FORMULAIRE ────────────────────────────────────────────
  return (
    <>
      {/* ─── HERO ─── */}
      <InscriptionsHero />

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <section className="border-b border-black/5 bg-resa-gray">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
          <div className="mb-6">
            <div className="mb-3 h-1 w-14 bg-resa-red" />
            <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
              Comment ça marche
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StepLight n={1} title="Vous remplissez le formulaire" text="2 minutes suffisent." />
            <StepLight n={2} title="Nous étudions la demande" text="Vérification des places." />
            <StepLight n={3} title="Nous vous recontactons" text="Par téléphone ou WhatsApp." />
            <StepLight n={4} title="Votre place est confirmée" text="Bienvenue dans la Ligue." />
          </div>
        </div>
      </section>

      {/* ─── FORMULAIRE ─── */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

          {/* Colonne formulaire */}
          <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-resa-lg md:p-10">
            {/* Segmented control premium */}
            <div className="mb-8 inline-flex w-full max-w-md rounded-xl border border-black/10 bg-resa-gray p-1">
              {(['school', 'individual'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    'flex-1 rounded-lg px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 md:text-xs',
                    mode === m
                      ? 'bg-white text-resa-navy shadow-[0_1px_3px_rgba(10,31,68,.12)]'
                      : 'text-resa-text/50 hover:text-resa-navy'
                  )}
                >
                  {m === 'school' ? t('tabSchool') : t('tabIndividual')}
                </button>
              ))}
            </div>

            {/* Titre */}
            <div className="mb-8">
              <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
                {mode === 'school' ? t('schoolTitle') : t('individualTitle')}
              </h2>
              <p className="mt-2 text-sm text-resa-text/60">
                {mode === 'school' ? t('schoolSubtitle') : t('individualSubtitle')}
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1 : Contact */}
              <FormSection label="1 · Vos coordonnées">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={t('fieldContactName')} value={form.contact_name} onChange={(v) => update('contact_name', v)} required />
                  <Field label={t('fieldContactPhone')} value={form.contact_phone} onChange={(v) => update('contact_phone', v)} type="tel" required />
                </div>
                <Field label={t('fieldContactEmail')} value={form.contact_email} onChange={(v) => update('contact_email', v)} type="email" />
              </FormSection>

              {/* Section 2 : École OU enfant */}
              {mode === 'school' && (
                <FormSection label="2 · Votre établissement">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t('fieldSchoolName')} value={form.school_name} onChange={(v) => update('school_name', v)} required />
                    <Field label={t('fieldSchoolCity')} value={form.school_city} onChange={(v) => update('school_city', v)} required />
                  </div>
                  <div>
                    <FieldLabel>{t('fieldCategories')}</FieldLabel>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((c: any) => {
                        const active = form.category_codes.includes(c.code);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleCategory(c.code)}
                            className={cn(
                              'group relative rounded-xl border px-5 py-3 text-left transition-all duration-300',
                              active
                                ? 'border-resa-navy bg-resa-navy text-white shadow-resa'
                                : 'border-black/10 bg-white text-resa-text/70 hover:border-resa-navy/30 hover:bg-resa-gray/40'
                            )}
                          >
                            <div className="font-display text-lg font-black leading-none">
                              {c.code}
                            </div>
                            <div className={cn(
                              'mt-1 text-[10px] font-bold uppercase tracking-wider',
                              active ? 'text-white/70' : 'text-resa-text/40'
                            )}>
                              {c.school_levels?.join(' · ')}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </FormSection>
              )}

              {mode === 'individual' && (
                <FormSection label="2 · L'enfant">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t('fieldPlayerFirstName')} value={form.player_first_name} onChange={(v) => update('player_first_name', v)} required />
                    <Field label={t('fieldPlayerBirthDate')} value={form.player_birth_date} onChange={(v) => update('player_birth_date', v)} type="date" />
                  </div>
                  <div>
                    <FieldLabel>{t('fieldPlayerPosition')}</FieldLabel>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { k: 'GK', label: t('fieldPositionGK'), icon: '🧤' },
                        { k: 'DF', label: t('fieldPositionDF'), icon: '🛡️' },
                        { k: 'MF', label: t('fieldPositionMF'), icon: '🎯' },
                        { k: 'FW', label: t('fieldPositionFW'), icon: '⚽' }
                      ].map((p) => {
                        const active = form.player_position === p.k;
                        return (
                          <button
                            key={p.k}
                            type="button"
                            onClick={() => update('player_position', p.k)}
                            className={cn(
                              'flex flex-col items-center gap-1 rounded-xl border px-3 py-3 transition-all duration-300',
                              active
                                ? 'border-resa-red bg-resa-red text-white shadow-resa'
                                : 'border-black/10 bg-white text-resa-text/70 hover:border-resa-red/30'
                            )}
                          >
                            <span className="text-lg">{p.icon}</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{p.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </FormSection>
              )}

              {/* Section 3 : Message */}
              <FormSection label="3 · Message (facultatif)">
                <textarea
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  rows={3}
                  placeholder="Précisions, questions, contexte…"
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-resa-text outline-none transition focus:border-resa-royal/50 focus:ring-2 focus:ring-resa-royal/10"
                />
              </FormSection>

              {/* Erreur */}
              {status === 'error' && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <strong className="font-bold">{t('errorTitle')}</strong>
                  <p className="mt-1">{t('errorText')}</p>
                </div>
              )}

              {/* Submit */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-6">
                <p className="text-xs text-resa-text/50">
                  Champs marqués <span className="text-resa-red">*</span> obligatoires
                </p>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:bg-red-700 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'loading' ? t('submitting') : t('submit')}
                  {status !== 'loading' && (
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ASIDE */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* WhatsApp card */}
            <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa">
              <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] p-6 text-white">
                <div className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-white/20 backdrop-blur">
                  💬
                </div>
                <h3 className="font-display text-lg font-black leading-tight">
                  {t('whatsappTitle')}
                </h3>
                <p className="mt-1.5 text-sm text-white/85">
                  {t('whatsappText')}
                </p>
              </div>
              <div className="p-5">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:brightness-110"
                >
                  {t('whatsappCta')} →
                </a>
              </div>
            </div>

            {/* Trust card */}
            <div className="rounded-2xl border border-black/5 bg-resa-gray p-6">
              <div className="mb-3 flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-resa-navy text-white text-xs font-black">
                  ✓
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/60">
                  Vos données sont protégées
                </div>
              </div>
              <ul className="space-y-2 text-xs text-resa-text/70">
                <li className="flex gap-2">
                  <span className="text-resa-red">•</span> Connexion HTTPS chiffrée
                </li>
                <li className="flex gap-2">
                  <span className="text-resa-red">•</span> Données accessibles uniquement à l'administration
                </li>
                <li className="flex gap-2">
                  <span className="text-resa-red">•</span> Aucune information d'enfant publiée sans autorisation parentale
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

// ─── Composants utilitaires ─────────────────────────────────

function StepLight({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-black/5 bg-white p-4 shadow-resa transition-all duration-300 hover:-translate-y-1 hover:shadow-resa-lg">
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-resa-navy font-display text-xs font-black text-white">
          {n}
        </div>
        <div className="text-sm font-bold text-resa-navy">{title}</div>
      </div>
      <div className="mt-2 text-[11px] text-resa-text/60">{text}</div>
    </div>
  );
}

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-[10px] font-black uppercase tracking-widest text-resa-red">
          {label}
        </div>
        <div className="h-px flex-1 bg-black/5" />
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
      {children}
    </label>
  );
}

function Field({
  label, value, onChange, type = 'text', required = false
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <FieldLabel>
        {label}
        {required && <span className="ml-1 text-resa-red">*</span>}
      </FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-resa-text outline-none transition focus:border-resa-royal/50 focus:ring-2 focus:ring-resa-royal/10"
      />
    </div>
  );
}