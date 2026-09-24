'use client';

import React from 'react';
import type { ReactNode, ChangeEvent } from 'react';
import Link from 'next/link';
import { saveCoach } from './actions';
import ImageUpload from '@/components/admin/ImageUpload';

// Résolution sans conflit du hook d'action
const useActionState =
  (React as any).useActionState ||
  ((action: any, initialState: any) => {
    const [state, setState] = React.useState(initialState);
    const [pending, setPending] = React.useState(false);
    const formAction = async (formData: FormData) => {
      setPending(true);
      try {
        const res = await action(state, formData);
        setState(res);
      } finally {
        setPending(false);
      }
    };
    return [state, formAction, pending];
  });

type CareerItem = {
  period: string;
  role_fr: string;
  role_en: string;
  club: string;
};

export default function CoachForm({ coach }: { coach?: any }) {
  const [state, formAction, pending] = useActionState(saveCoach, null);
  const isEdit = !!coach;

  const [photoUrl, setPhotoUrl] = React.useState<string>(coach?.photo_url ?? '');
  const [career, setCareer] = React.useState<CareerItem[]>(
    Array.isArray(coach?.career) ? coach.career : []
  );

  const addCareer = () =>
    setCareer([...career, { period: '', role_fr: '', role_en: '', club: '' }]);

  const updateCareer = (i: number, field: keyof CareerItem, value: string) =>
    setCareer(career.map((c: CareerItem, idx: number) => (idx === i ? { ...c, [field]: value } : c)));

  const removeCareer = (i: number) =>
    setCareer(career.filter((_: CareerItem, idx: number) => idx !== i));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 text-[11px] text-resa-text/50">
        <Link href="/admin/coachs" className="hover:text-resa-red">
          Coachs
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-resa-navy">
          {isEdit ? 'Modifier' : 'Nouveau coach'}
        </span>
      </div>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-resa-navy">
          {isEdit ? coach.name : 'Nouveau coach'}
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          {isEdit
            ? 'Modifier les informations du coach.'
            : 'Ajouter un nouveau coach à l\'équipe technique.'}
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="id" value={coach.id} />}
        <input type="hidden" name="photo_url" value={photoUrl} />
        <input type="hidden" name="career" value={JSON.stringify(career)} />

        {/* ─── Section 1 : Identité ─── */}
        <Section title="Identité" accent="navy">
          <Field
            label="Nom complet"
            name="name"
            defaultValue={coach?.name}
            required
            placeholder="Roger Sampah"
          />

          <Field
            label="Slug (identifiant URL)"
            name="slug"
            defaultValue={coach?.slug}
            required
            placeholder="roger-sampah"
            hint="Minuscules et tirets uniquement. Ex : roger-sampah"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Initiales (si pas de photo)"
              name="initials"
              defaultValue={coach?.initials}
              placeholder="RS"
            />
            <Field
              label="Drapeau (emoji)"
              name="flag"
              defaultValue={coach?.flag}
              placeholder="🇨🇮"
            />
          </div>

          <Field
            label="Localisation"
            name="location"
            defaultValue={coach?.location}
            placeholder="Abidjan, Côte d'Ivoire"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Nationalité (FR)"
              name="nationality_fr"
              defaultValue={coach?.nationality_fr}
              placeholder="Ivoirienne"
            />
            <Field
              label="Nationality (EN)"
              name="nationality_en"
              defaultValue={coach?.nationality_en}
              placeholder="Ivorian"
            />
          </div>

          <Field
            label="Années d'expérience"
            name="experience_years"
            type="number"
            defaultValue={coach?.experience_years?.toString()}
            placeholder="15"
          />
        </Section>

        {/* ─── Section 2 : Rôle & spécialités ─── */}
        <Section title="Rôle & spécialités" accent="royal">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Rôle (FR)"
              name="role_fr"
              defaultValue={coach?.role_fr}
              placeholder="Fondateur & Head Coach"
            />
            <Field
              label="Role (EN)"
              name="role_en"
              defaultValue={coach?.role_en}
              placeholder="Founder & Head Coach"
            />
          </div>

          <Field
            label="Spécialités (FR)"
            name="specialties_fr"
            defaultValue={coach?.specialties_fr?.join(', ')}
            placeholder="Head coaching, Développement joueur, Détection"
            hint="Sépare par des virgules."
          />

          <Field
            label="Specialties (EN)"
            name="specialties_en"
            defaultValue={coach?.specialties_en?.join(', ')}
            placeholder="Head coaching, Player development, Scouting"
            hint="Sépare par des virgules."
          />
        </Section>

        {/* ─── Section 3 : Bio & philosophie ─── */}
        <Section title="Bio & philosophie" accent="navy">
          <Field
            label="Bio courte (FR)"
            name="bio_short_fr"
            defaultValue={coach?.bio_short_fr}
            as="textarea"
            rows={2}
            hint="Utilisée sur la carte coach et l'aperçu."
          />
          <Field
            label="Short bio (EN)"
            name="bio_short_en"
            defaultValue={coach?.bio_short_en}
            as="textarea"
            rows={2}
          />

          <Field
            label="Bio longue (FR)"
            name="bio_long_fr"
            defaultValue={coach?.bio_long_fr}
            as="textarea"
            rows={5}
            hint="Utilisée sur la fiche profil."
          />
          <Field
            label="Long bio (EN)"
            name="bio_long_en"
            defaultValue={coach?.bio_long_en}
            as="textarea"
            rows={5}
          />

          <Field
            label="Philosophie (FR)"
            name="philosophy_fr"
            defaultValue={coach?.philosophy_fr}
            as="textarea"
            rows={3}
          />
          <Field
            label="Philosophy (EN)"
            name="philosophy_en"
            defaultValue={coach?.philosophy_en}
            as="textarea"
            rows={3}
          />
        </Section>

        {/* ─── Section 4 : Certifications & langues ─── */}
        <Section title="Certifications & langues" accent="emerald">
          <Field
            label="Certifications"
            name="certifications"
            defaultValue={coach?.certifications?.join(', ')}
            placeholder="CAF B, US Soccer Grassroots"
            hint="Sépare par des virgules."
          />
          <Field
            label="Langues parlées"
            name="languages"
            defaultValue={coach?.languages?.join(', ')}
            placeholder="Français, Anglais"
            hint="Sépare par des virgules."
          />
        </Section>

        {/* ─── Section 5 : Parcours ─── */}
        <Section title="Parcours professionnel" accent="amber">
          <div className="space-y-3">
            {career.map((c: CareerItem, i: number) => (
              <div
                key={i}
                className="rounded-lg border border-black/5 bg-resa-gray/30 p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                    Ligne {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCareer(i)}
                    className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 transition hover:bg-red-100"
                  >
                    Retirer
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={c.period}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateCareer(i, 'period', e.target.value)}
                    placeholder="2015 – aujourd'hui"
                    className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] outline-none focus:border-resa-navy/40"
                  />
                  <input
                    value={c.club}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateCareer(i, 'club', e.target.value)}
                    placeholder="RESA Sport Academy"
                    className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] outline-none focus:border-resa-navy/40"
                  />
                  <input
                    value={c.role_fr}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateCareer(i, 'role_fr', e.target.value)}
                    placeholder="Rôle (FR)"
                    className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] outline-none focus:border-resa-navy/40"
                  />
                  <input
                    value={c.role_en}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => updateCareer(i, 'role_en', e.target.value)}
                    placeholder="Role (EN)"
                    className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] outline-none focus:border-resa-navy/40"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addCareer}
              className="w-full rounded-lg border-2 border-dashed border-black/10 px-4 py-3 text-[12px] font-bold text-resa-navy/60 transition hover:border-resa-navy/30 hover:bg-resa-gray/30"
            >
              + Ajouter une ligne
            </button>
          </div>
        </Section>

        {/* ─── Section 6 : Contact & réseaux ─── */}
        <Section title="Contact & réseaux" accent="navy">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Email"
              name="email"
              type="email"
              defaultValue={coach?.email}
              placeholder="coach@resa.com"
            />
            <Field
              label="Téléphone"
              name="phone"
              type="tel"
              defaultValue={coach?.phone}
              placeholder="+225 07 00 00 00 00"
            />
          </div>
          <Field
            label="WhatsApp"
            name="whatsapp"
            type="tel"
            defaultValue={coach?.whatsapp}
            placeholder="+2250700000000"
            hint="Format international sans espaces."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Instagram"
              name="social_instagram"
              defaultValue={coach?.social_instagram}
              placeholder="https://instagram.com/…"
            />
            <Field
              label="LinkedIn"
              name="social_linkedin"
              defaultValue={coach?.social_linkedin}
              placeholder="https://linkedin.com/in/…"
            />
            <Field
              label="Twitter / X"
              name="social_twitter"
              defaultValue={coach?.social_twitter}
              placeholder="https://x.com/…"
            />
          </div>
        </Section>

        {/* ─── Section 7 : Photos ─── */}
        <Section title="Photos" accent="royal">
          <ImageUpload
            label="Photo de profil"
            value={photoUrl}
            onChange={setPhotoUrl}
            folder="coaches"
            aspect="1/1"
            hint="Carré recommandé (min. 400×400 px)."
          />
        </Section>

        {/* ─── Section 8 : Publication ─── */}
        <Section title="Publication" accent="emerald">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Région
              </label>
              <select
                name="region"
                defaultValue={coach?.region ?? 'both'}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              >
                <option value="both">Les deux</option>
                <option value="africa">Afrique</option>
                <option value="usa">USA</option>
              </select>
            </div>
            <Field
              label="Ordre d'affichage"
              name="display_order"
              type="number"
              defaultValue={coach?.display_order?.toString() ?? '100'}
              hint="Plus petit = affiché en premier."
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={coach ? coach.is_featured : false}
                className="h-4 w-4 rounded border-black/20 text-amber-500 focus:ring-amber-500/30"
              />
              <div>
                <div className="text-[13px] font-semibold text-resa-navy">
                  Mettre en vedette
                </div>
                <div className="text-[11px] text-resa-text/50">
                  Affiché en premier + badge "Fondateur".
                </div>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={coach ? coach.is_active : true}
                className="h-4 w-4 rounded border-black/20 text-resa-red focus:ring-resa-red/30"
              />
              <div>
                <div className="text-[13px] font-semibold text-resa-navy">
                  Coach actif
                </div>
                <div className="text-[11px] text-resa-text/50">
                  Un coach inactif n'apparaît pas sur le site public.
                </div>
              </div>
            </label>
          </div>
        </Section>

        {state?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4">
          <Link
            href="/admin/coachs"
            className="rounded-full border border-black/5 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
          >
            {pending
              ? 'Enregistrement…'
              : isEdit
              ? 'Enregistrer'
              : 'Créer le coach'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Section générique (children rendu optionnel) ───────────
function Section({
  title,
  accent = 'navy',
  children
}: {
  title: string;
  accent?: 'navy' | 'royal' | 'red' | 'emerald' | 'amber';
  children?: ReactNode;
}) {
  const accents: Record<string, string> = {
    navy: 'from-resa-navy/5 bg-resa-navy',
    royal: 'from-resa-royal/5 bg-resa-royal',
    red: 'from-resa-red/5 bg-resa-red',
    emerald: 'from-emerald-500/5 bg-emerald-500',
    amber: 'from-amber-500/5 bg-amber-500'
  };
  const [gradient, bar] = accents[accent].split(' ');
  return (
    <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
      <header
        className={`flex items-center gap-3 border-b border-black/5 bg-gradient-to-r ${gradient} to-transparent px-5 py-3`}
      >
        <div className={`h-4 w-1 rounded-full ${bar}`} />
        <h2 className="text-sm font-bold text-resa-navy">{title}</h2>
      </header>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

// ─── Champ générique ────────────────────────────────────────
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
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue ?? ''}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
        />
      )}
      {hint && <div className="mt-1 text-[10px] text-resa-text/40">{hint}</div>}
    </div>
  );
}