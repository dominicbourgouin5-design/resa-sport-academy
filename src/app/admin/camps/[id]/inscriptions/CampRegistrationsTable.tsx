'use client';

import { useState } from 'react';
import { deleteCampRegistration } from '../../actions';
import ConfirmModal from '@/components/admin/ConfirmModal';
import CampRegistrationsWizard from './CampRegistrationsWizard';
import CampPaymentModal from './CampPaymentModal';
import MarkPaidModal from '@/components/admin/MarkPaidModal';

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
  registrations,
  camp
}: {
  registrations: any[];
  camp: any;
}) {
  const [toDelete, setToDelete] = useState<any | null>(null);
  const [openRegistration, setOpenRegistration] = useState<any | null>(null);
  const [paymentRegistration, setPaymentRegistration] = useState<any | null>(null);
  const [markPaidRegistration, setMarkPaidRegistration] = useState<any | null>(null);

  if (registrations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/10 p-12 text-center">
        <div className="mb-3 text-4xl">📭</div>
        <p className="text-sm text-resa-text/60">Aucune inscription.</p>
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
            {registrations.map((r) => {
              const isPaid =
                r.payment_status === 'paid' ||
                !!r.paid_at;

              const showPaymentButton = !isPaid && r.status !== 'cancelled';
              const showMarkPaidButton = !isPaid;
              const isResend =
                r.payment_status === 'pending' || r.payment_status === 'failed';

              return (
                <tr key={r.id} className="transition hover:bg-resa-gray/40">
                  <td className="px-5 py-3">
                    <div className="text-[13px] font-semibold text-resa-navy">
                      {r.player_name}
                      {r.player_age && (
                        <span className="text-resa-text/40"> · {r.player_age} ans</span>
                      )}
                    </div>
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
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-700'
                        : PAYMENT_COLOR[r.payment_status] ?? 'bg-gray-100 text-gray-600'
                    }`}>
                      {isPaid ? 'Payé' : (PAYMENT_LABEL[r.payment_status] ?? r.payment_status)}
                    </span>
                    {r.payment_amount && (
                      <div className="mt-0.5 text-[9px] text-resa-text/50">
                        {Number(r.payment_amount).toLocaleString('fr-FR')} {r.payment_currency ?? 'XOF'}
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {showPaymentButton && (
                        <button
                          onClick={() => setPaymentRegistration(r)}
                          className="rounded-lg border border-resa-red/20 bg-resa-red/5 px-2.5 py-1 text-[11px] font-bold text-resa-red transition hover:bg-resa-red/10"
                        >
                          {isResend ? '🔄 Relancer' : '💳 Paiement'}
                        </button>
                      )}

                      {showMarkPaidButton && (
                        <button
                          onClick={() => setMarkPaidRegistration(r)}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100"
                          title="Marquer comme payé (paiement manuel / hors ligne)"
                        >
                          💰 Payé
                        </button>
                      )}

                      {/* Reçu PDF : toujours visible, grisé si non payé */}
                      {isPaid ? (
                        <a
                          href={`/api/admin/receipt/camp/${r.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 transition hover:border-blue-400 hover:bg-blue-100"
                          title="Voir le reçu PDF"
                        >
                          📄 Reçu
                        </a>
                      ) : (
                        <span
                          className="rounded-lg border border-black/5 bg-resa-gray/60 px-2.5 py-1 text-[11px] font-bold text-resa-text/30 cursor-not-allowed"
                          title="Disponible uniquement quand l'inscription est payée"
                        >
                          📄 Reçu
                        </span>
                      )}

                      <button
                        onClick={() => setOpenRegistration(r)}
                        className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-navy transition hover:bg-resa-gray"
                      >
                        Traiter
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
              );
            })}
          </tbody>
        </table>
      </div>

      {openRegistration && (
        <CampRegistrationsWizard
          registration={{ ...openRegistration, camp }}
          onClose={() => setOpenRegistration(null)}
        />
      )}

      {paymentRegistration && (
        <CampPaymentModal
          registration={paymentRegistration}
          camp={camp}
          onClose={() => setPaymentRegistration(null)}
        />
      )}

      {markPaidRegistration && (
        <MarkPaidModal
          type="camp"
          id={markPaidRegistration.id}
          parentName={markPaidRegistration.parent_name}
          playerName={markPaidRegistration.player_name}
          defaultAmount={markPaidRegistration.payment_amount}
          defaultCurrency={markPaidRegistration.payment_currency}
          onClose={() => setMarkPaidRegistration(null)}
          onSuccess={() => {
            // Le parent page utilise Server Component → rechargement suffit
            window.location.reload();
          }}
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