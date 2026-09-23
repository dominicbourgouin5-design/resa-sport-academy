'use client';

import Link from 'next/link';
import { useState } from 'react';
import { deleteSchool, toggleSchoolActive } from './actions';

export default function SchoolsTable({ schools }: { schools: any[] }) {
  const [q, setQ] = useState('');

  const filtered = schools.filter((s) => {
    const term = q.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.city ?? '').toLowerCase().includes(term) ||
      (s.district ?? '').toLowerCase().includes(term) ||
      (s.contact_name ?? '').toLowerCase().includes(term)
    );
  });

  if (schools.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
        Aucune école dans cette section.
      </p>
    );
  }

  return (
    <>
      {/* Recherche */}
      <div className="flex items-center gap-3 border-b border-black/5 px-5 py-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-resa-text/30">
            🔍
          </span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par nom, ville, commune, référent…"
            className="w-full rounded-lg border border-black/10 bg-resa-gray/50 py-2 pl-9 pr-3 text-[12px] outline-none transition focus:border-resa-navy/30 focus:bg-white focus:ring-2 focus:ring-resa-navy/10"
          />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
          {filtered.length} / {schools.length}
        </div>
      </div>

      {/* Tableau */}
      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
          Aucun résultat.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">            
            <thead className="border-b border-black/5 bg-resa-gray/40">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                <th className="px-5 py-2.5 text-left">École</th>
                <th className="hidden px-5 py-2.5 text-left md:table-cell">Ville</th>
                <th className="hidden px-5 py-2.5 text-left lg:table-cell">Référent</th>
                <th className="hidden px-5 py-2.5 text-center md:table-cell">Équipes</th>
                <th className="px-5 py-2.5 text-center">Statut</th>
                <th className="px-5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((s) => {
                const teamCount = Array.isArray(s.teams) ? (s.teams[0]?.count ?? 0) : 0;
                return (
                  <tr key={s.id} className="transition hover:bg-resa-gray/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-resa-navy to-resa-royal font-display text-[12px] font-black text-white">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-semibold text-resa-navy">
                            {s.name}
                          </div>
                          <div className="truncate text-[10px] uppercase tracking-wider text-resa-text/40 md:hidden">
                            {s.city}{s.district && ` · ${s.district}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="hidden px-5 py-3 text-[12px] text-resa-text/70 md:table-cell">
                      {s.city ?? '—'}
                      {s.district && (
                        <span className="text-resa-text/40"> · {s.district}</span>
                      )}
                    </td>

                    <td className="hidden px-5 py-3 lg:table-cell">
                      {s.contact_name ? (
                        <div className="text-[12px] text-resa-text/70">
                          <div className="font-medium">{s.contact_name}</div>
                          {s.contact_phone && (
                            <div className="text-[10px] text-resa-text/40">
                              {s.contact_phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-resa-text/30">—</span>
                      )}
                    </td>

                    <td className="hidden px-5 py-3 text-center md:table-cell">
                      <span className="inline-flex items-center justify-center rounded-full bg-resa-navy/5 px-2.5 py-0.5 text-[11px] font-bold text-resa-navy">
                        {teamCount}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => toggleSchoolActive(s.id, s.is_active)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                          s.is_active
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                        title="Cliquer pour changer le statut"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {s.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/ecoles/${s.id}`}
                          className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-navy transition hover:border-resa-navy/20 hover:bg-resa-gray"
                        >
                          Modifier
                        </Link>
                        <DeleteButton id={s.id} name={s.name} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ─── Bouton supprimer avec confirmation ─────────────────────
function DeleteButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteSchool(id);
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
        className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-red-600 transition hover:border-red-200 hover:bg-red-50"
      >
        Suppr.
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded-lg bg-red-600 px-2 py-1 text-[10px] font-bold uppercase text-white transition hover:bg-red-700 disabled:opacity-50"
        title={`Confirmer la suppression de ${name}`}
      >
        {loading ? '…' : 'OK'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={loading}
        className="rounded-lg border border-black/5 bg-white px-2 py-1 text-[10px] font-bold text-resa-text/60 transition hover:bg-resa-gray"
      >
        ✕
      </button>
    </div>
  );
}