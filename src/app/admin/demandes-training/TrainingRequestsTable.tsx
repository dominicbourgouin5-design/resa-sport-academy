'use client';

import { useState } from 'react';
import RequestWizard from './RequestWizard';
import { deleteTrainingRequest } from './actions';

export default function TrainingRequestsTable({ requests }: { requests: any[] }) {
  // ⚠️ state local : garde la requête même si elle sort de la liste après revalidate
  const [openRequest, setOpenRequest] = useState<any | null>(null);

  if (requests.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
        Aucune demande dans cette section.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-black/5 bg-resa-gray/40">
            <tr className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
              <th className="px-5 py-2.5 text-left">Demandeur</th>
              <th className="hidden px-5 py-2.5 text-left md:table-cell">Programme</th>
              <th className="hidden px-5 py-2.5 text-left lg:table-cell">Joueur</th>
              <th className="hidden px-5 py-2.5 text-left lg:table-cell">Date</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {requests.map((r) => (
              <tr key={r.id} className="transition hover:bg-resa-gray/40">
                <td className="px-5 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-resa-navy">
                      {r.parent_name}
                    </div>
                    <div className="truncate text-[11px] text-resa-text/50">
                      {r.parent_email}
                    </div>
                  </div>
                </td>

                <td className="hidden px-5 py-3 md:table-cell">
                  {r.program_title ? (
                    <span className="inline-flex items-center rounded-full bg-resa-navy/5 px-2.5 py-0.5 text-[11px] font-semibold text-resa-navy">
                      {r.program_title}
                    </span>
                  ) : (
                    <span className="text-[11px] text-resa-text/40">—</span>
                  )}
                </td>

                <td className="hidden px-5 py-3 lg:table-cell">
                  {r.player_name || r.player_age ? (
                    <div className="text-[12px] text-resa-text/70">
                      {r.player_name}
                      {r.player_age && (
                        <span className="text-resa-text/40"> · {r.player_age} ans</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-resa-text/30">—</span>
                  )}
                </td>

                <td className="hidden px-5 py-3 text-[12px] text-resa-text/60 lg:table-cell">
                  {new Date(r.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>

                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setOpenRequest(r)}
                      className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-navy transition hover:border-resa-navy/20 hover:bg-resa-gray"
                    >
                      Traiter
                    </button>
                    <DeleteButton id={r.id} name={r.parent_name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Wizard — state local, jamais undefined */}
      {openRequest && (
        <RequestWizard
          request={openRequest}
          onClose={() => setOpenRequest(null)}
        />
      )}
    </>
  );
}

// ─── Bouton supprimer ───────────────────────────────────────
function DeleteButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTrainingRequest(id);
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