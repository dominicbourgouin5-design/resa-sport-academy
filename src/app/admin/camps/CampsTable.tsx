'use client';

import Link from 'next/link';
import { useState } from 'react';
import { deleteCamp, toggleCampActive } from './actions';
import ConfirmModal from '@/components/admin/ConfirmModal';

const STATUS_LABEL: Record<string, string> = {
  open: 'Ouvert',
  full: 'Complet',
  closed: 'Clôturé',
  cancelled: 'Annulé'
};

const STATUS_COLOR: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-700',
  full: 'bg-amber-100 text-amber-700',
  closed: 'bg-gray-200 text-gray-600',
  cancelled: 'bg-red-100 text-red-700'
};

export default function CampsTable({ camps }: { camps: any[] }) {
  const [toDelete, setToDelete] = useState<any | null>(null);

  if (camps.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
        Aucun événement dans cette section.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-180 text-sm">
          <thead className="border-b border-black/5 bg-resa-gray/40">
            <tr className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
              <th className="px-5 py-2.5 text-left">Événement</th>
              <th className="hidden px-5 py-2.5 text-left md:table-cell">Dates</th>
              <th className="hidden px-5 py-2.5 text-left lg:table-cell">Lieu</th>
              <th className="px-5 py-2.5 text-center">Statut</th>
              <th className="hidden px-5 py-2.5 text-center lg:table-cell">Type</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {camps.map((c) => {
              const dateStart = new Date(c.date_start).toLocaleDateString('fr-FR', {
                day: '2-digit', month: 'short', year: 'numeric'
              });
              const dateEnd = c.date_end && c.date_end !== c.date_start
                ? new Date(c.date_end).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short'
                  })
                : null;

              return (
                <tr key={c.id} className="transition hover:bg-resa-gray/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-lg ${
                          c.type === 'tryout'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-resa-navy/10 text-resa-navy'
                        }`}
                      >
                        {c.type === 'tryout' ? '🔍' : '🏕️'}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-resa-navy">
                          {c.title_fr}
                        </div>
                        <div className="truncate text-[10px] text-resa-text/40">
                          {c.slug}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-5 py-3 md:table-cell">
                    <div className="text-[12px] text-resa-text/70">
                      {dateStart}
                      {dateEnd && <span className="text-resa-text/40"> → {dateEnd}</span>}
                    </div>
                  </td>

                  <td className="hidden px-5 py-3 lg:table-cell">
                    <div className="text-[12px] text-resa-text/70">
                      {c.location ?? '—'}
                    </div>
                  </td>

                  <td className="px-5 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        STATUS_COLOR[c.status] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {STATUS_LABEL[c.status] ?? c.status}
                    </span>
                  </td>

                  <td className="hidden px-5 py-3 text-center lg:table-cell">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-resa-text/60">
                      {c.type === 'tryout' ? 'Tryout' : 'Camp'}
                    </span>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/camps/${c.id}`}
                        className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-navy transition hover:border-resa-navy/20 hover:bg-resa-gray"
                      >
                        Modifier
                      </Link>
                      <Link
                        href={`/admin/camps/${c.id}/inscriptions`}
                        className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-royal transition hover:border-resa-royal/20 hover:bg-resa-gray"
                      >
                        Inscriptions
                      </Link>
                      <button
                        onClick={() => toggleCampActive(c.id, c.is_active)}
                        className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-text/60 transition hover:bg-resa-gray"
                        title="Basculer actif/inactif"
                      >
                        {c.is_active ? '⏸️' : '▶️'}
                      </button>
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

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteCamp(toDelete.id);
          setToDelete(null);
        }}
        title="Supprimer cet événement ?"
        message={`"${toDelete?.title_fr ?? ''}" sera définitivement supprimé, ainsi que toutes ses inscriptions associées. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  );
}