'use client';

import { useActionState, useEffect } from 'react';
import { saveScore } from './actions';

export default function ScoreModal({
  match,
  onClose
}: {
  match: any;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveScore, null);

  // Fermer au succès
  useEffect(() => {
    if (state?.ok) {
      const timer = setTimeout(() => {
        onClose();
        window.location.reload();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [state, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-black/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
                {match.category?.code} · Saisie de score
              </div>
              <div className="mt-1 text-xs text-resa-text/60">
                {new Date(match.match_date).toLocaleDateString('fr-FR', {
                  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                })}
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full text-resa-text/40 transition hover:bg-resa-gray"
            >
              ✕
            </button>
          </div>
        </div>

        <form action={formAction} className="p-6">
          <input type="hidden" name="id" value={match.id} />

          {/* Équipes + scores */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* Domicile */}
            <div className="text-center">
              <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-xl bg-resa-navy font-display text-lg font-black text-white">
                {(match.home_team?.school?.name ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="text-xs font-bold text-resa-navy">
                {match.home_team?.school?.name ?? match.home_team?.name}
              </div>
            </div>

            {/* Scores */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                name="home_score"
                min="0"
                max="99"
                defaultValue={match.home_score ?? 0}
                required
                className="h-16 w-16 rounded-xl border-2 border-resa-navy/10 bg-white text-center font-display text-2xl font-black text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
              <span className="font-display text-xl font-black text-resa-text/20">-</span>
              <input
                type="number"
                name="away_score"
                min="0"
                max="99"
                defaultValue={match.away_score ?? 0}
                required
                className="h-16 w-16 rounded-xl border-2 border-resa-navy/10 bg-white text-center font-display text-2xl font-black text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
            </div>

            {/* Extérieur */}
            <div className="text-center">
              <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-xl bg-resa-red font-display text-lg font-black text-white">
                {(match.away_team?.school?.name ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="text-xs font-bold text-resa-navy">
                {match.away_team?.school?.name ?? match.away_team?.name}
              </div>
            </div>
          </div>

          {/* Statut */}
          <div className="mt-6">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-resa-text/60">
              Statut du match
            </label>
            <select
              name="status"
              defaultValue={match.status}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
            >
              <option value="played">Joué</option>
              <option value="scheduled">À venir</option>
              <option value="postponed">Reporté</option>
              <option value="cancelled">Annulé</option>
              <option value="forfeit_home">Forfait domicile</option>
              <option value="forfeit_away">Forfait extérieur</option>
            </select>
          </div>

          {state?.error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          {state?.ok && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              ✓ Score enregistré · Classement mis à jour
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-black/5 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
            >
              Annuler
            </button>
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
    </div>
  );
}