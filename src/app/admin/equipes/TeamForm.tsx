'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import { saveTeam } from './actions';

export default function TeamForm({ team }: { team: any }) {
  const [state, formAction, pending] = useActionState(saveTeam, null);
  const [logoUrl, setLogoUrl] = useState(team?.logo_url ?? '');

  const schoolName = team.school?.name ?? '—';
  const categoryCode = team.category?.code ?? '—';

  return (
    <div className="mx-auto max-w-3xl">

      {/* Fil d'ariane */}
      <div className="mb-6 text-[11px] text-resa-text/50">
        <Link href="/admin/equipes" className="hover:text-resa-red">
          Équipes
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-resa-navy">
          {schoolName} · {categoryCode}
        </span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-resa-navy">
          Modifier l'équipe
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          {schoolName} — catégorie {categoryCode}
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="id" value={team.id} />

        {/* Section 1 : Logo */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-navy/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-navy" />
            <h2 className="text-sm font-bold text-resa-navy">Logo de l'équipe</h2>
          </header>
          <div className="p-5">
            <div className="mx-auto max-w-xs">
              <ImageUpload
                label=""
                value={logoUrl}
                onChange={setLogoUrl}
                folder="logos/teams"
                aspect="1/1"
                hint="Carré recommandé. Si vide, l'initiale du nom sera utilisée."
              />
              <input type="hidden" name="logo_url" value={logoUrl} />
            </div>
          </div>
        </section>

        {/* Section 2 : Informations */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-royal/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-royal" />
            <h2 className="text-sm font-bold text-resa-navy">Informations</h2>
          </header>

          <div className="space-y-4 p-5">
            <Field
              label="Nom de l'équipe (optionnel)"
              name="name"
              defaultValue={team.name}
              placeholder={`${schoolName} — ${categoryCode}`}
              hint="Si vide, un nom automatique sera utilisé."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Poule / Groupe"
                name="group_name"
                defaultValue={team.group_name}
                placeholder="Poule A"
              />
              <Field
                label="Coach"
                name="coach_name"
                defaultValue={team.coach_name}
                placeholder="Ex : Coach Yao"
              />
            </div>

            <label className="flex cursor-pointer items-center gap-3 pt-2">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={team.is_active}
                className="h-4 w-4 rounded border-black/20 text-resa-red focus:ring-resa-red/30"
              />
              <div>
                <div className="text-[13px] font-semibold text-resa-navy">
                  Équipe active
                </div>
                <div className="text-[11px] text-resa-text/50">
                  Une équipe inactive n'apparaît pas dans les classements.
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
            href="/admin/equipes"
            className="rounded-full border border-black/5 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, name, defaultValue, placeholder, hint
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
        {label}
      </label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
      />
      {hint && <div className="mt-1 text-[10px] text-resa-text/40">{hint}</div>}
    </div>
  );
}