'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from 'next-intl';
import CampRegistrationForm from './CampRegistrationForm';

export default function CampRegistrationModal({
  camp,
  initialValues,
  open,
  onClose
}: {
  camp: any;
  initialValues: Record<string, string> | null;
  open: boolean;
  onClose: () => void;
}) {
  const locale = useLocale();
  const isFr = locale === 'fr';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll quand ouvert
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape pour fermer
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-resa-navy/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-resa-gray text-resa-navy transition hover:bg-resa-navy hover:text-white"
          aria-label={isFr ? 'Fermer' : 'Close'}
        >
          ✕
        </button>

        <CampRegistrationForm
          camp={camp}
          initialValues={initialValues}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body
  );
}