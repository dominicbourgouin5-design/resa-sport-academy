'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NewCampRegistrationModal from './NewCampRegistrationModal';

export default function NewCampRegistrationButton({
  camp
}: {
  camp: { id: string; title_fr: string; price_amount?: number | null; price_amount_usd?: number | null };
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-resa-red px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700"
      >
        ➕ Nouvelle inscription
      </button>

      {open && (
        <NewCampRegistrationModal
          camp={camp}
          onClose={() => setOpen(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </>
  );
}