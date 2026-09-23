'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function TeamsTable({ teams }: { teams: any[] }) {
  const [q, setQ] = useState('');

  const filtered = teams.filter((t) => {
    const term = q.toLowerCase();
    return (
      (t.school?.name ?? '').toLowerCase().includes(term) ||
      (t.coach_name ?? '').toLowerCase().includes(term)
    );
  });

  if (teams.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
        Aucune équipe.
      </p>
    );
  }

  return (
    <>
      {/* Barre de recherche */}
      <div className="flex items-center gap-3 border-b border-black/5 px-5 py-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-resa-text/30">
            🔍
          </span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une école ou un coach…"
            className="w-full rounded-lg border border-black/10 bg-resa-gray/50 py-2 pl-9 pr-3 text-[12px] outline-none transition focus:border-resa-navy/30 focus:bg-white focus:ring-2 focus:ring-resa-navy/10"
          />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
          {filtered.length} / {teams.length}
        </div>
      </div>

      {/* Tableau */}
      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
          Aucun résultat.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-black/5 bg-resa-gray/40">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                <th className="px-5 py-2.5 text-left">École</th>
                <th className="hidden px-5 py-2.5 text-left md:table-cell">Équipe</th>
                <th className="hidden px-5 py-2.5 text-left lg:table-cell">Coach</th>
                <th className="hidden px-5 py-2.5 text-center md:table-cell">Poule</th>
                <th className="px-5 py-2.5 text-center">Statut</th>
                <th className="px-5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((t) => (
                <tr key={t.id} className="transition hover:bg-resa-gray/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                        {t.logo_url ? (
                          <img
                            src={t.logo_url}
                            alt=""
                            className="h-8 w-8 shrink-0 rounded-lg border border-black/5 bg-white object-cover"
                          />
                        ) : (
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-resa-navy to-resa-royal font-display text-[11px] font-black text-white">
                            {(t.school?.name ?? '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-resa-navy">
                          {t.school?.name ?? '—'}
                        </div>
                        <div className="truncate text-[10px] uppercase tracking-wider text-resa-text/40 md:hidden">
                          {t.category?.code}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-5 py-3 text-[12px] text-resa-text/70 md:table-cell">
                    {t.name ?? '—'}
                  </td>

                  <td className="hidden px-5 py-3 text-[12px] text-resa-text/70 lg:table-cell">
                    {t.coach_name ?? '—'}
                  </td>

                  <td className="hidden px-5 py-3 text-center md:table-cell">
                    {t.group_name ? (
                      <span className="rounded-md bg-resa-navy/5 px-2 py-0.5 text-[10px] font-bold text-resa-navy">
                        {t.group_name}
                      </span>
                    ) : (
                      <span className="text-resa-text/30">—</span>
                    )}
                  </td>

                  <td className="px-5 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        t.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {t.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/equipes/${t.id}`}
                      className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-navy transition hover:border-resa-navy/20 hover:bg-resa-gray"
                    >
                      Modifier
                    </Link>
                    {t.school?.slug && (
                      <Link
                        href={`/admin/ecoles/${t.school.id}`}
                        className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-red transition hover:border-red-200 hover:bg-red-50"
                      >
                        École →
                      </Link>
                    )}
                  </div>
                </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}