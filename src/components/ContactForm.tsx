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
  const [programSlug, setProgramSlug] = useState<string>(preselectedSlug ?? '');
  const [coachSlug, setCoachSlug] = useState<string>(preselectedCoach ?? '');

  useEffect(() => {
    if (state?.ok && formRef.current) {
      formRef.current.reset();
      setProgramSlug('');
      setCoachSlug('');
    }
  }, [state?.ok]);

  const selectedProgram = programs.find((p) => p.slug === programSlug);
  const selectedTitle = selectedProgram
    ? isFr
      ? selectedProgram.title_fr
      : selectedProgram.title_en
    : null;

  const selectedCoach = coaches.find((c) => c.slug === coachSlug);

  // ─── Succès ───
  if (state?.ok) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center md:p-12">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-3xl text-white">
          ✓
        </div>
        <h3 className="font-display text-2xl font-black text-emerald-800 md:text-3xl">
          {t('successTitle')}
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-emerald-700">
          {t('successText')}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:brightness-110"
          >
            💬 {t('whatsappCta')}
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-emerald-700 transition hover:bg-emerald-50"
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
      className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-resa-lg"
    >
      {/* ─── En-tête ─── */}
      <div className="border-b border-black/5 px-6 py-6 md:px-8">
        <div className="mb-3 h-1 w-12 bg-resa-red" />
        <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
          {t('title')}
        </h2>
        <p className="mt-2 text-sm text-resa-text/60">{t('subtitle')}</p>
      </div>

      {/* ─── Bandeau sélection ─── */}
      {(selectedTitle || selectedCoach) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 bg-resa-red/5 px-6 py-3 md:px-8">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {selectedTitle && (
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-resa-red" />
                <span className="text-resa-text/60">{t('selectedProgramLabel')} :</span>
                <span className="font-bold text-resa-navy">{selectedTitle}</span>
              </div>
            )}
            {selectedCoach && (
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-resa-royal" />
                <span className="text-resa-text/60">{t('selectedCoachLabel')} :</span>
                <span className="font-bold text-resa-navy">{selectedCoach.name}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setProgramSlug('');
              setCoachSlug('');
            }}
            className="text-xs font-bold text-resa-text/40 transition hover:text-resa-red"
            aria-label="Clear selection"
          >
            ✕
          </button>
        </div>
      )}

      <div className="space-y-7 p-6 md:p-8">

        {/* ═══ PROGRAMME ═══ */}
        <Group title={t('sectionProgram')}>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
              {t('fieldProgram')}
            </label>
            <select
              name="program_slug"
              value={programSlug}
              onChange={(e) => setProgramSlug(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
            >
              <option value="">{t('fieldProgramPlaceholder')}</option>
              {programs.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {isFr ? p.title_fr : p.title_en}
                </option>
              ))}
            </select>
          </div>
          <input type="hidden" name="program_title" value={selectedTitle ?? ''} />
        </Group>

        {/* ═══ PARENT ═══ */}
        <Group title={t('sectionParent')}>
          <Field
            label={t('fieldParentName')}
            name="parent_name"
            required
            placeholder={isFr ? 'Ex : M. Kouassi Jean' : 'Ex: Mr. John Smith'}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t('fieldParentEmail')}
              name="parent_email"
              type="email"
              required
              placeholder="email@example.com"
            />
            <Field
              label={t('fieldParentPhone')}
              name="parent_phone"
              type="tel"
              placeholder="+225 07 00 00 00 00"
            />
          </div>
        </Group>

        {/* ═══ JOUEUR ═══ */}
        <Group title={t('sectionPlayer')}>
          <div className="grid gap-4 sm:grid-cols-2">
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
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
              {t('fieldPlayerLevel')}
            </label>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { value: 'beginner',     key: 'levelBeginner' },
                { value: 'intermediate', key: 'levelIntermediate' },
                { value: 'advanced',     key: 'levelAdvanced' }
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="group flex cursor-pointer items-center gap-2.5 rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm transition has-[:checked]:border-resa-red has-[:checked]:bg-resa-red/5"
                >
                  <input
                    type="radio"
                    name="player_level"
                    value={opt.value}
                    className="h-4 w-4 border-black/20 text-resa-red focus:ring-resa-red/30"
                  />
                  <span className="font-medium text-resa-navy group-has-[:checked]:font-bold">
                    {t(opt.key as any)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </Group>

        {/* ═══ PRÉFÉRENCES ═══ */}
        <Group title={t('sectionPreferences')}>
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
              {t('fieldRegion')}
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { value: 'africa', label: '🇨🇮 Africa' },
                { value: 'usa',    label: '🇺🇸 USA' }
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="group flex cursor-pointer items-center gap-2.5 rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-sm transition has-[:checked]:border-resa-red has-[:checked]:bg-resa-red/5"
                >
                  <input
                    type="radio"
                    name="region"
                    value={opt.value}
                    defaultChecked={opt.value === 'africa'}
                    className="h-4 w-4 border-black/20 text-resa-red focus:ring-resa-red/30"
                  />
                  <span className="font-medium text-resa-navy group-has-[:checked]:font-bold">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Coach — dropdown depuis la DB */}
          {coaches.length > 0 && (
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
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
                className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
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

        {/* ═══ MESSAGE ═══ */}
        <Group title={t('fieldMessage')}>
          <textarea
            name="message"
            rows={4}
            placeholder={t('fieldMessagePlaceholder')}
            className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
          />
        </Group>

        {state?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 border-t border-black/5 pt-5">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-resa-red px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-resa transition hover:scale-[1.03] hover:bg-red-700 disabled:opacity-60 disabled:hover:scale-100"
          >
            {pending ? t('submitting') : t('submit')}
            {!pending && <span>→</span>}
          </button>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-resa-text/55 transition hover:text-[#25D366]"
          >
            💬 {t('preferWhatsapp')}
          </a>
        </div>
      </div>
    </form>
  );
}

// ─── Sous-composants ────────────────────────────────────────
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-resa-navy">
        <span className="h-1 w-1 rounded-full bg-resa-red" />
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label, name, defaultValue, type = 'text', required = false,
  placeholder, hint, as = 'input', rows = 3
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  as?: 'input' | 'textarea';
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
        {label}
        {required && <span className="ml-1 text-resa-red">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          name={name}
          defaultValue={defaultValue ?? ''}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue ?? ''}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
        />
      )}
      {hint && <div className="mt-1 text-[10px] text-resa-text/40">{hint}</div>}
    </div>
  );
}