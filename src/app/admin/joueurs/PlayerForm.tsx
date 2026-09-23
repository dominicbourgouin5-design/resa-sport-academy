'use client';

import { useActionState, useState, useMemo } from 'react';
import Link from 'next/link';
import { savePlayer } from './actions';
import ImageUpload from '@/components/admin/ImageUpload';

export default function PlayerForm({
  player,
  teams,
  preselectedTeamId
}: {
  player?: any;
  teams: any[];
  preselectedTeamId?: string;
}) {
  const [state, formAction, pending] = useActionState(savePlayer, null);
  const isEdit = !!player;

  // Options groupées par catégorie pour le select équipe
  const teamOptions = useMemo(() => {
    return teams
      .map((t) => ({
        id: t.id,
        label: `${t.school?.name ?? '?'} — ${t.category?.code ?? '?'}`,
        catCode: t.category?.code ?? '?'
      }))
      .sort((a, b) => a.catCode.localeCompare(b.catCode) || a.label.localeCompare(b.label));
  }, [teams]);

  const [position, setPosition] = useState<string>(player?.position ?? '');
  const [photoUrl, setPhotoUrl] = useState<string>(player?.photo_url ?? '');

  return (
    <div className="mx-auto max-w-3xl">

      {/* Fil d'ariane */}
      <div className="mb-6 text-[11px] text-resa-text/50">
        <Link href="/admin/joueurs" className="hover:text-resa-red">
          Joueurs
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-resa-navy">
          {isEdit ? 'Modifier' : 'Nouveau joueur'}
        </span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-resa-navy">
          {isEdit ? `${player.first_name} ${player.last_initial ?? ''}` : 'Nouveau joueur'}
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          {isEdit
            ? 'Modifier les informations du joueur.'
            : 'Ajouter un joueur à une équipe.'}
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="id" value={player.id} />}

        {/* Section 1 : Équipe */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-navy/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-navy" />
            <h2 className="text-sm font-bold text-resa-navy">Équipe</h2>
          </header>

          <div className="p-5">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
              Équipe d'affectation <span className="text-resa-red">*</span>
            </label>
            <select
              name="team_id"
              required
              defaultValue={player?.team_id ?? preselectedTeamId ?? ''}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] font-medium text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
            >
              <option value="" disabled>— Sélectionner une équipe —</option>
              {teamOptions.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Section 2 : Photo */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-royal/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-royal" />
            <h2 className="text-sm font-bold text-resa-navy">Photo du joueur</h2>
          </header>
          <div className="p-5">
            <div className="mx-auto max-w-xs">
              <ImageUpload
                label=""
                value={photoUrl}
                onChange={setPhotoUrl}
                folder="players"
                aspect="1/1"
                hint="Carré recommandé. Respecter l'autorisation parentale (prénom + initiale uniquement sur le site public)."
              />
              <input type="hidden" name="photo_url" value={photoUrl} />
            </div>
          </div>
        </section>

        {/* Section 3 : Identité */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-red/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-red" />
            <h2 className="text-sm font-bold text-resa-navy">Identité</h2>
          </header>

          <div className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Prénom"
                name="first_name"
                defaultValue={player?.first_name}
                required
                placeholder="Ex : Yao"
              />
              <Field
                label="Initiale du nom"
                name="last_initial"
                defaultValue={player?.last_initial}
                placeholder="K."
                hint="Une seule lettre (protection des mineurs)."
              />
            </div>

            <Field
              label="Date de naissance"
              name="birth_date"
              type="date"
              defaultValue={player?.birth_date}
            />
          </div>
        </section>

        {/* Section 4 : Poste & numéro */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-royal/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-royal" />
            <h2 className="text-sm font-bold text-resa-navy">Poste & numéro</h2>
          </header>

          <div className="space-y-4 p-5">
            <Field
              label="Numéro de maillot"
              name="jersey_number"
              type="number"
              defaultValue={player?.jersey_number?.toString()}
              placeholder="1 à 99"
            />

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Poste
              </label>
              <input type="hidden" name="position" value={position} />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { key: 'GK', label: 'Gardien',    icon: '🧤' },
                  { key: 'DF', label: 'Défenseur',  icon: '🛡️' },
                  { key: 'MF', label: 'Milieu',     icon: '🎯' },
                  { key: 'FW', label: 'Attaquant',  icon: '⚽' }
                ].map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPosition(position === p.key ? '' : p.key)}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-3 transition ${
                      position === p.key
                        ? 'border-resa-red bg-resa-red text-white shadow-resa'
                        : 'border-black/10 bg-white text-resa-text/60 hover:border-resa-red/30'
                    }`}
                  >
                    <span className="text-lg">{p.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
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
            href="/admin/joueurs"
            className="rounded-full border border-black/5 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le joueur'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label, name, defaultValue, type = 'text', required = false, placeholder, hint
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
        {label}
        {required && <span className="ml-1 text-resa-red">*</span>}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ''}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
      />
      {hint && (
        <div className="mt-1 text-[10px] text-resa-text/40">{hint}</div>
      )}
    </div>
  );
}