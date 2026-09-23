'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { saveSchool } from './actions';
import ImageUpload from '@/components/admin/ImageUpload';

export default function SchoolForm({ school }: { school?: any }) {
  const [state, formAction, pending] = useActionState(saveSchool, null);
  const isEdit = !!school;

  // État contrôlé pour l'upload du logo
  const [logoUrl, setLogoUrl] = useState<string>(school?.logo_url ?? '');

  const autoSlug = (v: string) =>
    v.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  return (
    <div className="mx-auto max-w-3xl">

      {/* Fil d'ariane */}
      <div className="mb-6 text-[11px] text-resa-text/50">
        <Link href="/admin/ecoles" className="hover:text-resa-red">
          Écoles
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-resa-navy">
          {isEdit ? 'Modifier' : 'Nouvelle école'}
        </span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-resa-navy">
          {isEdit ? school.name : 'Nouvelle école'}
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          {isEdit
            ? 'Modifier les informations de l\'établissement.'
            : 'Ajouter un nouvel établissement participant à la Ligue.'}
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="id" value={school.id} />}
        <input type="hidden" name="logo_url" value={logoUrl} />

        {/* Section 1 : Identité */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-navy/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-navy" />
            <h2 className="text-sm font-bold text-resa-navy">Identité de l'établissement</h2>
          </header>

          <div className="space-y-4 p-5">
            <Field
              label="Nom de l'école"
              name="name"
              defaultValue={school?.name}
              required
              placeholder="Ex : EPP Cocody Nord"
            />

            <Field
              label="Slug (identifiant URL)"
              name="slug"
              defaultValue={school?.slug}
              required
              placeholder="epp-cocody-nord"
              hint="Minuscules, tirets uniquement. Utilisé dans l'URL publique."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ville" name="city" defaultValue={school?.city} placeholder="Abidjan" />
              <Field label="Commune / Quartier" name="district" defaultValue={school?.district} placeholder="Cocody" />
            </div>

            <Field
              label="Description (FR)"
              name="description_fr"
              defaultValue={school?.description_fr}
              as="textarea"
              rows={3}
            />

            <Field
              label="Description (EN)"
              name="description_en"
              defaultValue={school?.description_en}
              as="textarea"
              rows={3}
            />

            {/* Logo de l'école */}
            <ImageUpload
              label="Logo de l'école"
              value={logoUrl}
              onChange={setLogoUrl}
              folder="logos/schools"
              aspect="1/1"
              hint="Carré recommandé (minimum 200×200 px). JPG, PNG ou WebP."
            />
          </div>
        </section>

        {/* Section 2 : Contact */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-royal/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-royal" />
            <h2 className="text-sm font-bold text-resa-navy">Contact</h2>
          </header>

          <div className="space-y-4 p-5">
            <Field
              label="Nom du référent"
              name="contact_name"
              defaultValue={school?.contact_name}
              placeholder="Ex : Mme Kouamé Adjoua"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Téléphone"
                name="contact_phone"
                type="tel"
                defaultValue={school?.contact_phone}
                placeholder="+225 07 00 00 00 00"
              />
              <Field
                label="Email"
                name="contact_email"
                type="email"
                defaultValue={school?.contact_email}
                placeholder="contact@ecole.ci"
              />
            </div>
          </div>
        </section>

        {/* Section 3 : Statut */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-emerald-500/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-resa-navy">Statut</h2>
          </header>
          <div className="p-5">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={school ? school.is_active : true}
                className="h-4 w-4 rounded border-black/20 text-resa-red focus:ring-resa-red/30"
              />
              <div>
                <div className="text-[13px] font-semibold text-resa-navy">
                  École active
                </div>
                <div className="text-[11px] text-resa-text/50">
                  Une école inactive n'apparaît pas sur le site public.
                </div>
              </div>
            </label>
          </div>
        </section>

        {/* Erreur */}
        {state?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4">
          <Link
            href="/admin/ecoles"
            className="rounded-full border border-black/5 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer l\'école'}
          </button>
        </div>
      </form>
    </div>
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

      {hint && (
        <div className="mt-1 text-[10px] text-resa-text/40">{hint}</div>
      )}
    </div>
  );
}