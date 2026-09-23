'use client';

import { useActionState, useState, useMemo } from 'react';
import Link from 'next/link';
import { saveMatch } from './actions';

// Convertit ISO → format datetime-local (YYYY-MM-DDTHH:mm)
function toLocalInput(iso: string | null | undefined) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function MatchForm({
  match,
  season,
  categories,
  teams
}: {
  match?: any;
  season: any;
  categories: any[];
  teams: any[];
}) {
  const [state, formAction, pending] = useActionState(saveMatch, null);
  const isEdit = !!match;

  const [catCode, setCatCode] = useState<string>(
    match?.category_id
      ? categories.find((c) => c.id === match.category_id)?.code ?? categories[0]?.code
      : categories[0]?.code ?? 'U7'
  );

  // Filtrer les équipes par catégorie
  const filteredTeams = useMemo(() => {
    return teams
      .filter((t) => t.category?.code === catCode)
      .map((t) => ({
        id: t.id,
        label: t.school?.name ?? t.name ?? '?',
        categoryId: t.category?.id
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [teams, catCode]);

  const activeCategory = categories.find((c) => c.code === catCode);

  return (
    <div className="mx-auto max-w-3xl">

      {/* Fil d'ariane */}
      <div className="mb-6 text-[11px] text-resa-text/50">
        <Link href="/admin/matchs" className="hover:text-resa-red">
          Matchs
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-resa-navy">
          {isEdit ? 'Modifier' : 'Nouveau match'}
        </span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-resa-navy">
          {isEdit ? 'Modifier le match' : 'Nouveau match'}
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          {isEdit
            ? 'Modifier les informations du match.'
            : 'Créer un nouveau match au calendrier.'}
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="id" value={match.id} />}
        {season?.id && <input type="hidden" name="season_id" value={season.id} />}

        {/* Section 1 : Catégorie + Saison */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-navy/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-navy" />
            <h2 className="text-sm font-bold text-resa-navy">Contexte</h2>
          </header>

          <div className="space-y-4 p-5">
            {/* Saison affichée en lecture seule */}
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Saison
              </label>
              <div className="rounded-lg border border-black/5 bg-resa-gray/50 px-3 py-2.5 text-[13px] font-semibold text-resa-navy">
                {season?.name_fr ?? '—'}
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Catégorie <span className="text-resa-red">*</span>
              </label>
              <div className="flex gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCatCode(c.code)}
                    className={`flex-1 rounded-lg border-2 px-4 py-2.5 text-center transition ${
                      catCode === c.code
                        ? 'border-resa-navy bg-resa-navy text-white shadow-resa'
                        : 'border-black/10 bg-white text-resa-text/60 hover:border-resa-navy/30'
                    }`}
                  >
                    <div className="font-display text-lg font-black">{c.code}</div>
                    <div
                      className={`mt-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        catCode === c.code ? 'text-white/70' : 'text-resa-text/40'
                      }`}
                    >
                      {c.school_levels?.join(' · ')}
                    </div>
                  </button>
                ))}
              </div>
              <input type="hidden" name="category_id" value={activeCategory?.id ?? ''} />
            </div>
          </div>
        </section>

        {/* Section 2 : Équipes */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-red/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-red" />
            <h2 className="text-sm font-bold text-resa-navy">Équipes</h2>
          </header>

          <div className="space-y-4 p-5">
            {filteredTeams.length < 2 ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
                ⚠️ Pas assez d'équipes en catégorie <strong>{catCode}</strong>. Il faut au moins 2 équipes pour créer un match.
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TeamSelect
                    label="Équipe domicile"
                    name="home_team_id"
                    teams={filteredTeams}
                    defaultValue={match?.home_team_id}
                    required
                  />
                  <TeamSelect
                    label="Équipe extérieur"
                    name="away_team_id"
                    teams={filteredTeams}
                    defaultValue={match?.away_team_id}
                    required
                  />
                </div>

                <p className="text-[10px] text-resa-text/40">
                  Les deux équipes doivent être différentes.
                </p>
              </>
            )}
          </div>
        </section>

        {/* Section 3 : Date & lieu */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-royal/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-royal" />
            <h2 className="text-sm font-bold text-resa-navy">Date & lieu</h2>
          </header>

          <div className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                  Date & heure <span className="text-resa-red">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="match_date"
                  defaultValue={toLocalInput(match?.match_date)}
                  required
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                  Lieu
                </label>
                <input
                  type="text"
                  name="venue"
                  defaultValue={match?.venue ?? ''}
                  placeholder="Ex : Stade Scolaire — Abidjan"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 4 : Statut */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-emerald-500/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-resa-navy">Statut</h2>
          </header>
          <div className="p-5">
            <select
              name="status"
              defaultValue={match?.status ?? 'scheduled'}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] font-medium text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
            >
              <option value="scheduled">📅 À venir</option>
              <option value="played">✅ Joué</option>
              <option value="postponed">⏸️ Reporté</option>
              <option value="cancelled">❌ Annulé</option>
              <option value="forfeit_home">🚫 Forfait domicile</option>
              <option value="forfeit_away">🚫 Forfait extérieur</option>
            </select>

            <p className="mt-3 text-[11px] text-resa-text/50">
              💡 Le score se saisit après coup depuis la liste des matchs, via le bouton <strong>Score</strong>.
            </p>
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
            href="/admin/matchs"
            className="rounded-full border border-black/5 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={pending || filteredTeams.length < 2}
            className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le match'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Select d'équipe ────────────────────────────────────────
function TeamSelect({
  label, name, teams, defaultValue, required
}: {
  label: string;
  name: string;
  teams: { id: string; label: string }[];
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
        {label} {required && <span className="text-resa-red">*</span>}
      </label>
      <select
        name={name}
        defaultValue={defaultValue ?? ''}
        required={required}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] font-medium text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
      >
        <option value="" disabled>
          — Sélectionner une équipe —
        </option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}