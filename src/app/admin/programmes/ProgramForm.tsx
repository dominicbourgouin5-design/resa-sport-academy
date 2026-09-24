'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { saveProgram } from './actions';

const ACCENTS = [
  { value: 'from-resa-navy to-resa-royal',      label: 'Navy → Royal (bleu)' },
  { value: 'from-resa-royal to-resa-navy',      label: 'Royal → Navy (bleu)' },
  { value: 'from-resa-navy to-resa-navy-deep',  label: 'Navy → Deep (bleu foncé)' },
  { value: 'from-resa-red to-red-800',          label: 'Rouge' },
  { value: 'from-amber-500 to-amber-700',       label: 'Or' },
  { value: 'from-emerald-600 to-emerald-800',   label: 'Vert' },
  { value: 'from-purple-600 to-purple-800',     label: 'Violet' }
];

export default function ProgramForm({ program }: { program?: any }) {
  const [state, formAction, pending] = useActionState(saveProgram, null);
  const isEdit = !!program;

  return (
    <div className="mx-auto max-w-3xl">

      <div className="mb-6 text-[11px] text-resa-text/50">
        <Link href="/admin/programmes" className="hover:text-resa-red">
          Programmes
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-resa-navy">
          {isEdit ? 'Modifier' : 'Nouveau programme'}
        </span>
      </div>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-resa-navy">
          {isEdit ? program.title_fr : 'Nouveau programme'}
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          {isEdit
            ? 'Modifier les informations du programme.'
            : 'Ajouter un nouveau format de training.'}
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="id" value={program.id} />}

        {/* Identité */}
        <Section title="Identité" accent="navy">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Titre (FR)"
              name="title_fr"
              defaultValue={program?.title_fr}
              required
              placeholder="1-on-1 Private Training"
            />
            <Field
              label="Title (EN)"
              name="title_en"
              defaultValue={program?.title_en}
              required
              placeholder="1-on-1 Private Training"
            />
          </div>

          <Field
            label="Slug (identifiant URL)"
            name="slug"
            defaultValue={program?.slug}
            required
            placeholder="1-on-1"
            hint="Utilisé dans l'URL de réservation. Ex : 1-on-1"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Icône (emoji)"
              name="icon"
              defaultValue={program?.icon}
              placeholder="👤"
            />
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Couleur d'accent
              </label>
              <select
                name="accent"
                defaultValue={program?.accent ?? ACCENTS[0].value}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              >
                {ACCENTS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Section>

        {/* Description */}
        <Section title="Description" accent="royal">
          <Field
            label="Description courte (FR)"
            name="description_fr"
            defaultValue={program?.description_fr}
            as="textarea"
            rows={3}
          />
          <Field
            label="Description longue (FR)"
            name="long_description_fr"
            defaultValue={program?.long_description_fr}
            as="textarea"
            rows={6}
            hint="Utilisée sur la page détail. Sépare les paragraphes par une ligne vide."
            />
            <Field
            label="Long description (EN)"
            name="long_description_en"
            defaultValue={program?.long_description_en}
            as="textarea"
            rows={6}
            hint="Used on the detail page. Separate paragraphs with an empty line."
            />
          <Field
            label="Short description (EN)"
            name="description_en"
            defaultValue={program?.description_en}
            as="textarea"
            rows={3}
          />
          <Field
            label="Points forts (FR)"
            name="highlights_fr"
            defaultValue={program?.highlights_fr?.join(', ')}
            placeholder="Coach 100% dédié, Plan individuel, Suivi progression"
            hint="Sépare par des virgules."
          />
          <Field
            label="Highlights (EN)"
            name="highlights_en"
            defaultValue={program?.highlights_en?.join(', ')}
            placeholder="100% dedicated coach, Individual plan, Progress tracking"
            hint="Sépare par des virgules."
          />
        </Section>

        {/* Détails pratiques */}
        <Section title="Détails pratiques" accent="emerald">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Durée (min)"
              name="duration_min"
              type="number"
              defaultValue={program?.duration_min?.toString()}
              placeholder="60"
            />
            <Field
              label="Taille min (joueurs)"
              name="group_size_min"
              type="number"
              defaultValue={program?.group_size_min?.toString()}
              placeholder="1"
            />
            <Field
              label="Taille max (joueurs)"
              name="group_size_max"
              type="number"
              defaultValue={program?.group_size_max?.toString()}
              placeholder="1"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Prix (FR)"
              name="price_fr"
              defaultValue={program?.price_fr}
              placeholder="À partir de 25 000 FCFA"
            />
            <Field
              label="Price (EN)"
              name="price_en"
              defaultValue={program?.price_en}
              placeholder="From $40"
            />
          </div>
        </Section>

        {/* Publication */}
        <Section title="Publication" accent="amber">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Région
              </label>
              <select
                name="region"
                defaultValue={program?.region ?? 'both'}
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
              defaultValue={program?.display_order?.toString() ?? '100'}
              hint="Plus petit = affiché en premier."
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 pt-2">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={program ? program.is_active : true}
              className="h-4 w-4 rounded border-black/20 text-resa-red focus:ring-resa-red/30"
            />
            <div>
              <div className="text-[13px] font-semibold text-resa-navy">
                Programme actif
              </div>
              <div className="text-[11px] text-resa-text/50">
                Un programme inactif n'apparaît pas sur le site public.
              </div>
            </div>
          </label>
        </Section>

        {state?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4">
          <Link
            href="/admin/programmes"
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
              : 'Créer le programme'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  accent = 'navy',
  children
}: {
  title: string;
  accent?: 'navy' | 'royal' | 'red' | 'emerald' | 'amber';
  children: React.ReactNode;
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