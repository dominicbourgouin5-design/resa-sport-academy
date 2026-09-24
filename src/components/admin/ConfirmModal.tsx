'use client';

import { useState } from 'react';
import Modal from './Modal';

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  icon
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  icon?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    danger: {
      bg: 'bg-resa-red',
      hover: 'hover:bg-red-700',
      iconBg: 'bg-resa-red/10 text-resa-red'
    },
    warning: {
      bg: 'bg-amber-500',
      hover: 'hover:bg-amber-600',
      iconBg: 'bg-amber-500/10 text-amber-600'
    },
    info: {
      bg: 'bg-resa-navy',
      hover: 'hover:bg-resa-royal',
      iconBg: 'bg-resa-navy/10 text-resa-navy'
    }
  };
  const c = colors[variant];
  const defaultIcon =
    variant === 'info' ? 'ℹ️' : variant === 'warning' ? '⚠️' : '⚠️';

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose}>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md anim-fade-in"
        onClick={loading ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] anim-fade-up">
        <div className={`h-1 ${c.bg}`} />

        <div className="p-6 md:p-7">
          <div
            className={`mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full text-2xl ${c.iconBg}`}
          >
            {icon ?? defaultIcon}
          </div>

          <h3 className="text-center font-display text-xl font-black text-resa-navy">
            {title}
          </h3>
          <p className="mt-2 text-center text-sm leading-relaxed text-resa-text/65">
            {message}
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 rounded-full ${c.bg} ${c.hover} px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition disabled:opacity-50`}
            >
              {loading ? '…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}