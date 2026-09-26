'use client';

import { useState } from 'react';
import Modal from '@/components/admin/Modal';
import { markTrainingRequestPaid } from '@/app/admin/demandes-training/actions';
import { markCampRegistrationPaid } from '@/app/admin/camps/actions';

type EntityType = 'camp' | 'training';

const METHODS = [
  { value: 'cash', label: '💵 Espèces' },
  { value: 'momo_offline', label: '📱 Mobile Money (hors ligne)' },
  { value: 'bank_transfer', label: '🏦 Virement bancaire' },
  { value: 'check', label: '📝 Chèque' },
  { value: 'manual', label: '✏️ Autre / Manuel' }
];

export default function MarkPaidModal({
  type,
  id,
  parentName,
  playerName,
  defaultAmount,
  defaultCurrency,
  onClose,
  onSuccess
}: {
  type: EntityType;
  id: string;
  parentName: string;
  playerName?: string;
  defaultAmount?: number | null;
  defaultCurrency?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const isCamp = type === 'camp';

  const [amount, setAmount] = useState<string>(
    defaultAmount ? String(defaultAmount) : isCamp ? '25000' : '25000'
  );
  const [currency, setCurrency] = useState<string>(
    defaultCurrency ?? 'XOF'
  );
  const [method, setMethod] = useState<string>('cash');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  const handleSubmit = async () => {
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0) {
      setResult({ ok: false, error: 'Montant invalide.' });
      return;
    }

    setSending(true);
    setResult(null);

    try {
      const res = isCamp
        ? await markCampRegistrationPaid(id, num, currency, method)
        : await markTrainingRequestPaid(id, num, currency, method);

      if (res.error) {
        setResult({ ok: false, error: res.error });
        setSending(false);
        return;
      }

      setResult({ ok: true });
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      setResult({ ok: false, error: err.message ?? 'Erreur inconnue' });
      setSending(false);
    }
  };

  // ═══ Écran succès ═══
  if (result?.ok) {
    return (
      <Modal open onClose={onClose}>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md anim-fade-in" onClick={onClose} aria-hidden="true" />
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 text-center shadow-[0_24px_80px_rgba(0,0,0,0.35)] anim-fade-up">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-3xl text-white shadow-lg">✓</div>
          <h2 className="font-display text-2xl font-black text-resa-navy">
            Paiement enregistré
          </h2>
          <p className="mt-2 text-sm text-resa-text/60">
            Email de confirmation + reçu PDF envoyés à {parentName}.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open onClose={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md anim-fade-in" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] anim-fade-up">
        <div className="h-1 bg-linear-to-r from-resa-red via-resa-royal to-resa-red" />

        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-resa-red">
            💰 Marquer comme payé
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-resa-text/40 transition hover:bg-resa-gray"
          >✕</button>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
            ⚠️ Cette action va marquer le dossier comme payé, envoyer un <strong>email de confirmation</strong> au parent, et générer un <strong>reçu PDF</strong>.
          </div>

          <div className="rounded-lg border border-black/5 bg-resa-gray/40 px-4 py-3 text-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
              Destinataire
            </div>
            <div className="mt-1 font-semibold text-resa-navy">{parentName}</div>
            {playerName && (
              <div className="mt-1 text-[12px] text-resa-text/60">Joueur : {playerName}</div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
              Montant payé *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="25000"
                min={1}
                step={currency === 'XOF' ? '1' : '0.01'}
                className="flex-1 rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[15px] font-bold text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] font-bold text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              >
                <option value="XOF">FCFA</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
              Méthode de paiement *
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] font-bold text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
            >
              {METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {result?.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {result.error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-black/5 bg-resa-gray/40 px-6 py-4">
          <button
            onClick={onClose}
            disabled={sending}
            className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={sending || !amount}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {sending ? 'Enregistrement…' : '✓ Confirmer le paiement'}
          </button>
        </div>
      </div>
    </Modal>
  );
}