'use client';

import Link from 'next/link';
import { useState } from 'react';
import { deleteProgram, toggleProgramActive } from './actions';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function ProgramsTable({ programs }: { programs: any[] }) {
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState<any | null>(null);

  const filtered = programs.filter((p) => {
    const term = q.toLowerCase();
    return (
      p.title_fr.toLowerCase().includes(term) ||
      p.slug.toLowerCase().includes(term)
    );
  });

  if (programs.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
        Aucun programme dans cette section.
      </p>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-black/5 px-5 py-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-resa-text/30">
            🔍
          </span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un programme…"
            className="w-full rounded-lg border border-black/10 bg-resa-gray/50 py-2 pl-9 pr-3 text-[12px] outline-none transition focus:border-resa-navy/30 focus:bg-white focus:ring-2 focus:ring-resa-navy/10"
          />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
          {filtered.length} / {programs.length}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
          Aucun résultat.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-150 text-sm">
            <thead className="border-b border-black/5 bg-resa-gray/40">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                <th className="px-5 py-2.5 text-left">Programme</th>
                <th className="hidden px-5 py-2.5 text-left md:table-cell">Région</th>
                <th className="hidden px-5 py-2.5 text-center lg:table-cell">Ordre</th>
                <th className="px-5 py-2.5 text-center">Statut</th>
                <th className="px-5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((p) => (
                <tr key={p.id} className="transition hover:bg-resa-gray/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${
                          p.accent ?? 'from-resa-navy to-resa-royal'
                        } text-lg`}
                      >
                        {p.icon ?? '⚽'}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-resa-navy">
                          {p.title_fr}
                        </div>
                        <div className="truncate text-[10px] text-resa-text/40">
                          {p.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-5 py-3 text-[12px] text-resa-text/70 md:table-cell">
                    <span className="rounded-full bg-resa-navy/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-resa-navy">
                      {p.region === 'both' ? 'Global' : p.region}
                    </span>
                  </td>

                  <td className="hidden px-5 py-3 text-center text-[12px] text-resa-text/60 lg:table-cell">
                    {p.display_order}
                  </td>

                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => toggleProgramActive(p.id, p.is_active)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                        p.is_active
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {p.is_active ? 'Actif' : 'Inactif'}
                    </button>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/programmes/${p.id}`}
                        className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-navy transition hover:border-resa-navy/20 hover:bg-resa-gray"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => setToDelete(p)}
                        className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                      >
                        Suppr.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteProgram(toDelete.id);
          setToDelete(null);
        }}
        title="Supprimer ce programme ?"
        message={`Le programme "${toDelete?.title_fr ?? ''}" sera définitivement supprimé. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  );
}