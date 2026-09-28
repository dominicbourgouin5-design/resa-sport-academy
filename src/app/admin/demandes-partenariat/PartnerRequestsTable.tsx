'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PartnerRequestWizard from './PartnerRequestWizard';
import { deletePartnerRequest } from './actions';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function PartnerRequestsTable({
  requests,
  currentStatus
}: {
  requests: any[];
  currentStatus: string;
}) {
  const [q, setQ] = useState('');
  const [wizardRequest, setWizardRequest] = useState<any | null>(null);
  const [toDelete, setToDelete] = useState<any | null>(null);
  const router = useRouter();

  const filtered = requests.filter((r) => {
    const term = q.toLowerCase();
    return (
      (r.company_name ?? '').toLowerCase().includes(term) ||
      (r.contact_name ?? '').toLowerCase().includes(term) ||
      (r.contact_email ?? '').toLowerCase().includes(term) ||
      (r.sector ?? '').toLowerCase().includes(term)
    );
  });

  if (requests.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
        Aucune demande dans cette section.
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
            placeholder="Rechercher par organisation, contact, email, secteur…"
            className="w-full rounded-lg border border-black/10 bg-resa-gray/50 py-2 pl-9 pr-3 text-[12px] outline-none transition focus:border-resa-navy/30 focus:bg-white focus:ring-2 focus:ring-resa-navy/10"
          />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
          {filtered.length} / {requests.length}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
          Aucun résultat.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-black/5 bg-resa-gray/40">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                <th className="px-5 py-2.5 text-left">Organisation</th>
                <th className="hidden px-5 py-2.5 text-left lg:table-cell">Contact</th>
                <th className="hidden px-5 py-2.5 text-left xl:table-cell">Secteur</th>
                <th className="hidden px-5 py-2.5 text-center md:table-cell">Reçue le</th>
                <th className="px-5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((r) => (
                <tr key={r.id} className="transition hover:bg-resa-gray/40">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-linear-to-br from-resa-navy to-resa-royal font-display text-[12px] font-black text-white">
                        {(r.company_name ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold text-resa-navy">
                          {r.company_name}
                        </div>
                        {r.website_url && (
                          <div className="truncate text-[10px] text-resa-text/50">
                            {r.website_url.replace(/^https?:\/\//, '')}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-5 py-3 lg:table-cell">
                    <div className="text-[12px] text-resa-text/70">
                      <div className="font-medium">{r.contact_name}</div>
                      <div className="text-[10px] text-resa-text/50">{r.contact_email}</div>
                    </div>
                  </td>

                  <td className="hidden px-5 py-3 xl:table-cell">
                    <div className="text-[11px] text-resa-text/60">
                      {r.sector ?? '—'}
                    </div>
                  </td>

                  <td className="hidden px-5 py-3 text-center md:table-cell">
                    <div className="text-[11px] text-resa-text/60">
                      {new Date(r.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      <button
                        onClick={() => setWizardRequest(r)}
                        className="rounded-lg bg-resa-navy px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-resa-royal"
                      >
                        Traiter
                      </button>

                      {currentStatus === 'validated' && (
                        <button
                          onClick={() => router.push(`/admin/sponsors/nouveau?from_request=${r.id}`)}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100"
                          title="Créer la fiche partenaire publique"
                        >
                          ✨ Créer la fiche
                        </button>
                      )}

                      <button
                        onClick={() => setToDelete(r)}
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

      {wizardRequest && (
        <PartnerRequestWizard
          request={wizardRequest}
          currentStatus={currentStatus}
          onClose={() => {
            setWizardRequest(null);
            router.refresh();
          }}
        />
      )}

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deletePartnerRequest(toDelete.id);
          setToDelete(null);
          router.refresh();
        }}
        title="Supprimer cette demande ?"
        message={`La demande de "${toDelete?.company_name ?? ''}" sera définitivement supprimée.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  );
}