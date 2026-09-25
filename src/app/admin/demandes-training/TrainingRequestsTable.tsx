'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import RequestWizard from './RequestWizard';
import TrainingPaymentModal from '@/components/admin/TrainingPaymentModal';
import { deleteTrainingRequest } from '@/app/admin/demandes-training/actions';

export default function TrainingRequestsTable({ requests }: { requests: any[] }) {
  const [openRequest, setOpenRequest] = useState<any | null>(null);
  const [paymentRequest, setPaymentRequest] = useState<any | null>(null);
  const router = useRouter();

  // ⚠️ Auto-close : si la demande ouverte disparaît de la liste (polling refresh)
  useEffect(() => {
    if (openRequest && !requests.find((r) => r.id === openRequest.id)) {
      setOpenRequest(null);
    }
    if (paymentRequest && !requests.find((r) => r.id === paymentRequest.id)) {
      setPaymentRequest(null);
    }
  }, [requests, openRequest, paymentRequest]);

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
        <table className="w-full min-w-205 text-sm">
          <thead className="border-b border-black/5 bg-resa-gray/40">
            <tr className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
              <th className="px-5 py-2.5 text-left">Demandeur</th>
              <th className="hidden px-5 py-2.5 text-left md:table-cell">Programme</th>
              <th className="hidden px-5 py-2.5 text-left lg:table-cell">Joueur</th>
              <th className="hidden px-5 py-2.5 text-center lg:table-cell">Paiement</th>
              <th className="hidden px-5 py-2.5 text-left xl:table-cell">Date</th>
              <th className="px-5 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {requests.map((r) => {
              const showPaymentButton =
                r.status === 'booked' &&
                r.payment_status !== 'paid' &&
                !r.paid_at &&
                !r.success_email_sent_at;

              const isResend =
                r.payment_status === 'pending' || r.payment_status === 'failed';

              return (
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

                  <td className="hidden px-5 py-3 text-center lg:table-cell">
                    <PaymentBadge
                      status={
                        r.paid_at || r.success_email_sent_at
                          ? 'paid'
                          : r.payment_status
                      }
                      amount={r.payment_amount}
                      currency={r.payment_currency}
                    />
                  </td>

                  <td className="hidden px-5 py-3 text-[12px] text-resa-text/60 xl:table-cell">
                    {new Date(r.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {showPaymentButton && (
                        <button
                          onClick={() => setPaymentRequest(r)}
                          className="rounded-lg border border-resa-red/20 bg-resa-red/5 px-2.5 py-1 text-[11px] font-bold text-resa-red transition hover:border-resa-red/40 hover:bg-resa-red/10"
                        >
                          {isResend ? '🔄 Relancer' : '💳 Paiement'}
                        </button>
                      )}
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Wizard */}
      {openRequest && (
        <RequestWizard
          request={openRequest}
          onClose={() => {
            setOpenRequest(null);
            router.refresh();
          }}
        />
      )}

      {/* Modal paiement */}
      {paymentRequest && (
        <TrainingPaymentModal
          request={paymentRequest}
          onClose={() => {
            setPaymentRequest(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

// ─── Badge statut paiement ──────────────────────────────────
function PaymentBadge({
  status,
  amount,
  currency
}: {
  status?: string | null;
  amount?: number | null;
  currency?: string | null;
}) {
  if (!status || status === 'none') {
    return <span className="text-[11px] text-resa-text/30">—</span>;
  }

  const amountLabel = amount
    ? `${Number(amount).toLocaleString('fr-FR')} ${currency === 'XOF' ? 'FCFA' : currency ?? ''}`
    : null;

  const config: Record<string, { label: string; cls: string }> = {
    pending: {
      label: '🟡 En attente',
      cls: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    paid: {
      label: '🟢 Payé',
      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    failed: {
      label: '🔴 Échoué',
      cls: 'bg-red-50 text-red-700 border-red-200'
    }
  };

  const c = config[status];
  if (!c) return <span className="text-[11px] text-resa-text/30">—</span>;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${c.cls}`}>
        {c.label}
      </span>
      {amountLabel && (
        <span className="text-[10px] font-semibold text-resa-text/50">
          {amountLabel}
        </span>
      )}
    </div>
  );
}

// ─── Bouton supprimer ───────────────────────────────────────
function DeleteButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTrainingRequest(id);
      router.refresh();
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