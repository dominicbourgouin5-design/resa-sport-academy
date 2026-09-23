'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { deletePlayer } from './actions';

const POSITION_LABELS: Record<string, string> = {
  GK: 'Gardien',
  DF: 'Défenseur',
  MF: 'Milieu',
  FW: 'Attaquant'
};

const POSITION_COLORS: Record<string, string> = {
  GK: 'bg-amber-100 text-amber-700',
  DF: 'bg-resa-navy/10 text-resa-navy',
  MF: 'bg-resa-royal/10 text-resa-royal',
  FW: 'bg-resa-red/10 text-resa-red'
};

export default function PlayersView({ players }: { players: any[] }) {
  const [q, setQ] = useState('');
  const [teamFilter, setTeamFilter] = useState<string>('all');

  // Liste des équipes de cette catégorie
  const teams = useMemo(() => {
    const map = new Map<string, string>();
    players.forEach((p) => {
      const t = p.team as any;
      if (t?.id) map.set(t.id, t.school?.name ?? t.name ?? '—');
    });
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [players]);

  const filtered = useMemo(() => {
    return players.filter((p) => {
      const term = q.toLowerCase();
      const matchText =
        p.first_name.toLowerCase().includes(term) ||
        (p.last_initial ?? '').toLowerCase().includes(term);
      const matchTeam = teamFilter === 'all' ? true : (p.team as any)?.id === teamFilter;
      return matchText && matchTeam;
    });
  }, [players, q, teamFilter]);

  // Grouper par équipe pour l'affichage
  const byTeam = useMemo(() => {
    const groups: Record<string, { team: any; players: any[] }> = {};
    for (const p of filtered) {
      const t = p.team as any;
      const key = t?.id ?? 'unknown';
      if (!groups[key]) groups[key] = { team: t, players: [] };
      groups[key].players.push(p);
    }
    // Trier par nom d'école
    return Object.values(groups).sort((a, b) =>
      (a.team?.school?.name ?? '').localeCompare(b.team?.school?.name ?? '')
    );
  }, [filtered]);

  return (
    <>
      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 border-b border-black/5 px-5 py-3">
        <div className="relative min-w-[200px] flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-resa-text/30">
            🔍
          </span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un joueur…"
            className="w-full rounded-lg border border-black/10 bg-resa-gray/50 py-2 pl-9 pr-3 text-[12px] outline-none transition focus:border-resa-navy/30 focus:bg-white focus:ring-2 focus:ring-resa-navy/10"
          />
        </div>

        {teams.length > 1 && (
          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="rounded-full border border-black/5 bg-white px-3 py-1.5 text-[11px] font-bold text-resa-navy outline-none transition focus:border-resa-navy/30 focus:ring-2 focus:ring-resa-navy/10"
          >
            <option value="all">Toutes les équipes</option>
            {teams.map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        )}

        <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
          {filtered.length} / {players.length}
        </div>
      </div>

      {/* Liste groupée par équipe */}
      {byTeam.length === 0 ? (
        <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
          Aucun joueur.
        </p>
      ) : (
        <div className="divide-y divide-black/5">
          {byTeam.map((group) => (
            <div key={group.team?.id ?? 'unknown'} className="px-5 py-4">
              {/* En-tête école */}
              <div className="mb-3 flex items-center gap-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-resa-navy to-resa-royal font-display text-[11px] font-black text-white">
                  {(group.team?.school?.name ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="text-[13px] font-bold text-resa-navy">
                  {group.team?.school?.name ?? '—'}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-resa-text/40">
                  {group.players.length} joueur(s)
                </div>
                <div className="h-px flex-1 bg-black/5" />
              </div>

              {/* Joueurs en grille */}
              <div className="-mx-2 flex flex-wrap">
                {group.players
                  .sort((a, b) => (a.jersey_number ?? 99) - (b.jersey_number ?? 99))
                  .map((p) => (
                    <div key={p.id} className="w-full px-2 pb-2 sm:w-1/2 lg:w-1/3">
                      <div className="group flex items-center gap-3 rounded-lg border border-black/5 bg-white p-2.5 transition hover:border-resa-navy/20 hover:shadow-sm">
                        {/* Numéro */}


                            {p.photo_url ? (
                              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-black/5 bg-white">
                                <img
                                  src={p.photo_url}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                                <div className="absolute bottom-0 right-0 rounded-tl-md bg-resa-navy px-1 text-[9px] font-black text-white">
                                  {p.jersey_number ?? '—'}
                                </div>
                              </div>
                            ) : (
                              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-resa-navy font-display text-sm font-black text-white">
                                {p.jersey_number ?? '—'}
                              </div>
                            )}

                        {/* Nom + poste */}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-semibold text-resa-navy">
                            {p.first_name} {p.last_initial}
                          </div>
                          {p.position && (
                            <span
                              className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                POSITION_COLORS[p.position] ?? 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {POSITION_LABELS[p.position] ?? p.position}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                          <Link
                            href={`/admin/joueurs/${p.id}`}
                            className="rounded border border-black/5 bg-white px-2 py-1 text-[10px] font-bold text-resa-navy transition hover:bg-resa-gray"
                          >
                            Éditer
                          </Link>
                          <DeleteButton id={p.id} name={`${p.first_name} ${p.last_initial ?? ''}`} />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function DeleteButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deletePlayer(id);
    } catch {
      alert('Erreur lors de la suppression');
      setLoading(false);
      setConfirming(false);
    }
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded border border-black/5 bg-white px-2 py-1 text-[10px] font-bold text-red-600 transition hover:bg-red-50"
      >
        Suppr.
      </button>
    );
  }

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded bg-red-600 px-1.5 py-1 text-[9px] font-bold uppercase text-white disabled:opacity-50"
        title={`Supprimer ${name}`}
      >
        {loading ? '…' : 'OK'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={loading}
        className="rounded border border-black/5 bg-white px-1.5 py-1 text-[9px] font-bold text-resa-text/60"
      >
        ✕
      </button>
    </div>
  );
}