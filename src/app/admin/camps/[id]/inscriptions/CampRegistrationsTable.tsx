'use client';

import { useState } from 'react';
import { updateCampRegistration, deleteCampRegistration } from '../../actions';
import ConfirmModal from '@/components/admin/ConfirmModal';

const STATUS_LABEL: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  confirmed: 'Confirmé',
  cancelled: 'Annulé'
};

const STATUS_COLOR: Record<string, string> = {
  new: 'bg-amber-100 text-amber-700',
  contacted: 'bg-resa-royal/10 text-resa-royal',
  confirmed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700'
};

const PAYMENT_LABEL: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échoué',
  refunded: 'Remboursé',
  cancelled: 'Annulé'
};

const PAYMENT_COLOR: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-200 text-gray-600'
};

export default function CampRegistrationsTable({
  registrations
}: {
  registrations: any[];
}) {
  const [toDelete, setToDelete] = useState<any | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  if (registrations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 p-12 text-center">
        <div className="mb-3 text-4xl">📭</div>
        <p className="text-sm text-resa-text/60">
          Aucune inscription pour le moment.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-black/5 bg-resa-gray/40">
            <tr className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
              <th className="px-5 py-2.5 text-left">Joueur</th>
              <th className="hidden px-5 py-2.5 text-left md:table-cell">Parent</th>
              <th className="hidden px-5 py-2.5 text-center lg:table-cell">Date</th>
              <th className="px-5 py-2.5 text-center">Statut</th>
              <th className="px-5 py-2.5 text-center">Paiement</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {registrations.map((r) => (
              <tr key={r.id} className="transition hover:bg-resa-gray/40">
                <td className="px-5 py-3">
                  <div className="text-[13px] font-semibold text-resa-navy">
                    {r.player_name}
                    {r.player_age && (
                      <span className="text-resa-text/40"> · {r.player_age} ans</span>
                    )}
                  </div>
                  {r.parent_phone && (
                    <div className="text-[10px] text-resa-text/50 md:hidden">
                      {r.parent_phone}
                    </div>
                  )}
                </td>

                <td className="hidden px-5 py-3 md:table-cell">
                  <div className="text-[12px] font-medium text-resa-text/70">
                    {r.parent_name}
                  </div>
                  <div className="text-[10px] text-resa-text/50">{r.parent_email}</div>
                </td>

                <td className="hidden px-5 py-3 text-center lg:table-cell text-[11px] text-resa-text/60">
                  {new Date(r.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short'
                  })}
                </td>

                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_COLOR[r.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {STATUS_LABEL[r.status] ?? r.status}
                  </span>
                </td>

                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${PAYMENT_COLOR[r.payment_status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {PAYMENT_LABEL[r.payment_status] ?? r.payment_status}
                  </span>
                </td>

                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setOpenId(r.id)}
                      className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-navy transition hover:bg-resa-gray"
                    >
                      Détail
                    </button>
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

      {/* Modal détail */}
      {openId && (
        <DetailModal
          registration={registrations.find((r) => r.id === openId)!}
          onClose={() => setOpenId(null)}
        />
      )}

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteCampRegistration(toDelete.id);
          setToDelete(null);
        }}
        title="Supprimer cette inscription ?"
        message={`L'inscription de "${toDelete?.player_name ?? ''}" sera définitivement supprimée.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  );
}

function DetailModal({
  registration,
  onClose
}: {
  registration: any;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState(registration.admin_notes ?? '');
  const [saving, setSaving] = useState(false);

  const updateStatus = async (status: any) => {
    await updateCampRegistration(registration.id, { status });
  };

  const updatePayment = async (payment_status: any) => {
    await updateCampRegistration(registration.id, { payment_status });
  };

  const saveNotes = async () => {
    setSaving(true);
    await updateCampRegistration(registration.id, { admin_notes: notes });
    setSaving(false);
  };

  const statuses = ['new', 'contacted', 'confirmed', 'cancelled'];
  const payments = ['pending', 'paid', 'failed', 'refunded', 'cancelled'];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-resa-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-black/5 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-resa-red">
              Inscription camp
            </div>
            <h2 className="font-display text-xl font-black text-resa-navy">
              {registration.player_name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-resa-text/40 transition hover:bg-resa-gray"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Statuts */}
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
              Statut dossier
            </div>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                    registration.status === s
                      ? 'bg-resa-navy text-white'
                      : 'border border-black/10 bg-white text-resa-text/60 hover:bg-resa-gray'
                  }`}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
              Statut paiement
            </div>
            <div className="flex flex-wrap gap-2">
              {payments.map((p) => (
                <button
                  key={p}
                  onClick={() => updatePayment(p)}
                  className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                    registration.payment_status === p
                      ? 'bg-resa-navy text-white'
                      : 'border border-black/10 bg-white text-resa-text/60 hover:bg-resa-gray'
                  }`}
                >
                  {PAYMENT_LABEL[p]}
                </button>
              ))}
            </div>

            {/* ─── Bloc paiement : détails ─── */}
            {(registration.paid_at ||
              registration.payment_provider_id ||
              registration.payment_reference) && (
              <div className="mt-3 space-y-1.5 rounded-lg border border-black/5 bg-resa-gray/40 p-3">
                {registration.paid_at && (
                  <div className="flex items-center gap-2 text-[11px] text-emerald-700">
                    <span>✓</span>
                    <span>
                      Payé le{' '}
                      {new Date(registration.paid_at).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}

                {registration.payment_reference && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-resa-text/50">Réf. FedaPay :</span>
                    <span className="rounded bg-white px-2 py-0.5 font-mono font-bold text-resa-navy">
                      {registration.payment_reference}
                    </span>
                  </div>
                )}

                {registration.payment_provider_id && (
                  <div className="flex items-center gap-2 text-[10px] text-resa-text/40">
                    <span>ID transaction :</span>
                    <span className="font-mono">
                      #{registration.payment_provider_id}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="rounded-xl border border-black/5 bg-resa-gray/40 p-4">
            <div className="grid gap-3 sm:grid-cols-2 text-[13px]">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-resa-text/40">
                  Parent
                </div>
                <div className="font-semibold text-resa-navy">{registration.parent_name}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-resa-text/40">
                  Email
                </div>
                <a href={`mailto:${registration.parent_email}`} className="text-resa-navy underline-offset-2 hover:underline">
                  {registration.parent_email}
                </a>
              </div>
              {registration.parent_phone && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-resa-text/40">
                    Téléphone
                  </div>
                  <a href={`tel:${registration.parent_phone}`} className="text-resa-navy underline-offset-2 hover:underline">
                    {registration.parent_phone}
                  </a>
                </div>
              )}
              {registration.player_age && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-resa-text/40">
                    Âge joueur
                  </div>
                  <div className="text-resa-navy">{registration.player_age} ans</div>
                </div>
              )}
            </div>
          </div>

          {registration.notes && (
            <div>
              <div className="mb-1 text-[10px] uppercase tracking-widest text-resa-text/50">
                Notes du parent
              </div>
              <div className="rounded-lg border border-black/5 bg-resa-gray/40 p-3 text-[13px] whitespace-pre-line">
                {registration.notes}
              </div>
            </div>
          )}

          <div>
            <div className="mb-2 text-[10px] uppercase tracking-widest text-resa-text/50">
              Notes internes
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
            />
            <button
              onClick={saveNotes}
              disabled={saving}
              className="mt-2 rounded-full bg-resa-navy px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-resa-royal disabled:opacity-50"
            >
              {saving ? 'Enregistrement…' : 'Enregistrer les notes'}
            </button>
          </div>

          <div className="border-t border-black/5 pt-4 text-[11px] text-resa-text/40">
            Inscrit le {new Date(registration.created_at).toLocaleString('fr-FR')}
          </div>
        </div>
      </div>
    </div>
  );
}