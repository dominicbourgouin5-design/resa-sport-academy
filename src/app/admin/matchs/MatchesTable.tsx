'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import ScoreModal from './ScoreModal';
import { deleteMatch } from './actions';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function MatchesTable({ matches }: { matches: any[] }) {
  const [q, setQ] = useState('');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [scoreModal, setScoreModal] = useState<any>(null);
  const [toDelete, setToDelete] = useState<any | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    matches.forEach((m: any) => m.category?.code && set.add(m.category.code));
    return Array.from(set).sort();
  }, [matches]);

  const filtered = useMemo(() => {
    return matches.filter((m: any) => {
      const term = q.toLowerCase();
      const matchText =
        (m.home_team?.school?.name ?? '').toLowerCase().includes(term) ||
        (m.away_team?.school?.name ?? '').toLowerCase().includes(term);
      const matchCat = catFilter === 'all' ? true : m.category?.code === catFilter;
      return matchText && matchCat;
    });
  }, [matches, q, catFilter]);

  const statusLabel = (s: string) => ({
    scheduled: 'À venir',
    played: 'Joué',
    postponed: 'Reporté',
    cancelled: 'Annulé',
    forfeit_home: 'Forfait dom.',
    forfeit_away: 'Forfait ext.'
  }[s] ?? s);

  const statusColor = (s: string) => ({
    scheduled: 'bg-amber-100 text-amber-700',
    played: 'bg-emerald-100 text-emerald-700',
    postponed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-gray-200 text-gray-600',
    forfeit_home: 'bg-red-100 text-red-700',
    forfeit_away: 'bg-red-100 text-red-700'
  }[s] ?? 'bg-gray-100 text-gray-600');

  if (matches.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
        Aucun match dans cette section.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border-b border-black/5 px-5 py-3">
        <div className="relative min-w-50 flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-resa-text/30">
            🔍
          </span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une équipe…"
            className="w-full rounded-lg border border-black/10 bg-resa-gray/50 py-2 pl-9 pr-3 text-[12px] outline-none transition focus:border-resa-navy/30 focus:bg-white focus:ring-2 focus:ring-resa-navy/10"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex gap-1 rounded-full border border-black/5 bg-resa-gray p-1">
            <button
              onClick={() => setCatFilter('all')}
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
                catFilter === 'all'
                  ? 'bg-white text-resa-navy shadow-sm'
                  : 'text-resa-text/50 hover:text-resa-navy'
              }`}
            >
              Toutes
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCatFilter(c)}
                className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
                  catFilter === c
                    ? 'bg-white text-resa-navy shadow-sm'
                    : 'text-resa-text/50 hover:text-resa-navy'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
          {filtered.length} / {matches.length}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
          Aucun résultat.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-160 text-sm">
            <thead className="border-b border-black/5 bg-resa-gray/40">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                <th className="px-5 py-2.5 text-left">Date</th>
                <th className="px-5 py-2.5 text-center">Cat.</th>
                <th className="px-5 py-2.5 text-right">Domicile</th>
                <th className="px-5 py-2.5 text-center">Score</th>
                <th className="px-5 py-2.5 text-left">Extérieur</th>
                <th className="hidden px-5 py-2.5 text-center lg:table-cell">Statut</th>
                <th className="px-5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((m: any) => {
                const date = new Date(m.match_date);
                const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                return (
                  <tr key={m.id} className="transition hover:bg-resa-gray/40">
                    <td className="px-5 py-3">
                      <div className="text-[12px] font-bold text-resa-navy">{dateStr}</div>
                      <div className="text-[10px] text-resa-text/50">{timeStr}</div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="rounded-md bg-resa-navy/5 px-2 py-0.5 text-[10px] font-black text-resa-navy">
                        {m.category?.code}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-[12px] font-semibold text-resa-navy">
                      {m.home_team?.school?.name ?? m.home_team?.name}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {m.status === 'played' ? (
                        <span className="font-display text-base font-black text-resa-navy">
                          {m.home_score} - {m.away_score}
                        </span>
                      ) : (
                        <span className="text-[10px] text-resa-text/30">vs</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-[12px] font-semibold text-resa-navy">
                      {m.away_team?.school?.name ?? m.away_team?.name}
                    </td>
                    <td className="hidden px-5 py-3 text-center lg:table-cell">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColor(m.status)}`}>
                        {statusLabel(m.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/matchs/${m.id}/evenements`}
                          className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-600 transition hover:border-emerald-200 hover:bg-emerald-50"
                          title="Saisir les buts, cartons et MVP"
                        >
                          Événements
                        </Link>
                        <button
                          onClick={() => setScoreModal(m)}
                          className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-royal transition hover:border-resa-royal/20 hover:bg-resa-gray"
                        >
                          Score
                        </button>
                        <Link
                          href={`/admin/matchs/${m.id}`}
                          className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-navy transition hover:border-resa-navy/20 hover:bg-resa-gray"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => setToDelete(m)}
                          className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                        >
                          Suppr.
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {scoreModal && (
        <ScoreModal match={scoreModal} onClose={() => setScoreModal(null)} />
      )}

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteMatch(toDelete.id);
          setToDelete(null);
        }}
        title="Supprimer ce match ?"
        message="Ce match sera définitivement supprimé, ainsi que tous ses événements (buts, cartons, MVP). Cette action est irréversible."
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  );
}