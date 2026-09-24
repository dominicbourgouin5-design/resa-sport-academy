'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  deleteCoach,
  toggleCoachActive,
  toggleCoachFeatured
} from './actions';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function CoachesTable({ coaches }: { coaches: any[] }) {
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState<any | null>(null);

  const filtered = coaches.filter((c) => {
    const term = q.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.role_fr ?? '').toLowerCase().includes(term) ||
      (c.location ?? '').toLowerCase().includes(term)
    );
  });

  if (coaches.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
        Aucun coach dans cette section.
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
            placeholder="Rechercher par nom, rôle, lieu…"
            className="w-full rounded-lg border border-black/10 bg-resa-gray/50 py-2 pl-9 pr-3 text-[12px] outline-none transition focus:border-resa-navy/30 focus:bg-white focus:ring-2 focus:ring-resa-navy/10"
          />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
          {filtered.length} / {coaches.length}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
          Aucun résultat.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-175 text-sm">
            <thead className="border-b border-black/5 bg-resa-gray/40">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                <th className="px-5 py-2.5 text-left">Coach</th>
                <th className="hidden px-5 py-2.5 text-left md:table-cell">Rôle</th>
                <th className="hidden px-5 py-2.5 text-left lg:table-cell">Lieu</th>
                <th className="px-5 py-2.5 text-center">Vedette</th>
                <th className="px-5 py-2.5 text-center">Statut</th>
                <th className="px-5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((c) => {
                const initials = c.initials ?? c.name.slice(0, 2).toUpperCase();
                return (
                  <tr key={c.id} className="transition hover:bg-resa-gray/40">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {c.photo_url ? (
                          <img
                            src={c.photo_url}
                            alt={c.name}
                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-resa-navy to-resa-royal font-display text-[11px] font-black text-white">
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-semibold text-resa-navy">
                            {c.name}
                          </div>
                          <div className="truncate text-[10px] text-resa-text/40 md:hidden">
                            {c.role_fr ?? '—'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="hidden px-5 py-3 text-[12px] text-resa-text/70 md:table-cell">
                      {c.role_fr ?? '—'}
                    </td>

                    <td className="hidden px-5 py-3 lg:table-cell">
                      <div className="text-[12px] text-resa-text/70">
                        {c.flag && <span className="mr-1">{c.flag}</span>}
                        {c.location ?? '—'}
                      </div>
                    </td>

                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => toggleCoachFeatured(c.id, c.is_featured)}
                        className={`text-lg transition ${
                          c.is_featured
                            ? 'text-amber-500 hover:scale-110'
                            : 'text-gray-300 hover:text-amber-400'
                        }`}
                        title="Basculer en vedette"
                      >
                        {c.is_featured ? '★' : '☆'}
                      </button>
                    </td>

                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => toggleCoachActive(c.id, c.is_active)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                          c.is_active
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {c.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/coachs/${c.id}`}
                          className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-navy transition hover:border-resa-navy/20 hover:bg-resa-gray"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => setToDelete(c)}
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

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteCoach(toDelete.id);
          setToDelete(null);
        }}
        title="Supprimer ce coach ?"
        message={`Le coach "${toDelete?.name ?? ''}" sera définitivement supprimé, ainsi que ses témoignages et médias associés. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  );
}