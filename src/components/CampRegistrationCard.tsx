'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import CampRegistrationModal from './CampRegistrationModal';

export default function CampRegistrationCard({
  camp,
  initialValues
}: {
  camp: any;
  initialValues: Record<string, string> | null;
}) {
  const locale = useLocale();
  const isFr = locale === 'fr';

  // Ouvre automatiquement le modal si on arrive avec ?rebook=
  const [open, setOpen] = useState(!!initialValues);

  const isClosed = camp.status !== 'open';
  const hasPrice = !!camp.price_amount;

  const dateStart = new Date(camp.date_start).toLocaleDateString(
    isFr ? 'fr-FR' : 'en-GB',
    { day: '2-digit', month: 'short', year: 'numeric' }
  );

  return (
    <>
      {/* Carte compacte sticky */}
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa-lg">
        <div className="h-1 bg-linear-to-r from-resa-red via-resa-royal to-resa-red" />

        <div className="p-6">
          {/* Type */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-resa-navy/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-resa-navy">
            {camp.type === 'tryout' ? '🔍 Tryout' : '🏕️ Camp'}
          </div>

          {/* Titre */}
          <h3 className="mt-3 font-display text-xl font-black leading-tight text-resa-navy">
            {isFr ? camp.title_fr : camp.title_en}
          </h3>

          {/* Infos */}
          <div className="mt-5 space-y-2.5 text-[13px]">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 text-base">📅</span>
              <span className="font-semibold text-resa-navy">{dateStart}</span>
            </div>
            {camp.location && (
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 text-base">📍</span>
                <span className="font-semibold text-resa-navy">{camp.location}</span>
              </div>
            )}
            {camp.age_min && camp.age_max && (
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 text-base">👤</span>
                <span className="font-semibold text-resa-navy">
                  {camp.age_min} – {camp.age_max} {isFr ? 'ans' : 'years'}
                </span>
              </div>
            )}
          </div>

          {/* Prix */}
          {hasPrice && (
            <div className="mt-5 rounded-xl border border-resa-navy/10 bg-resa-gray/40 p-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                {isFr ? 'Tarif' : 'Price'}
              </div>
              <div className="mt-1 font-display text-2xl font-black text-resa-red">
                {isFr ? camp.price_fr : camp.price_en}
              </div>
            </div>
          )}

          {/* CTA principal */}
          <button
            type="button"
            disabled={isClosed}
            onClick={() => setOpen(true)}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-resa-red px-6 py-4 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isClosed
              ? isFr ? 'Inscriptions fermées' : 'Registration closed'
              : isFr ? "S'inscrire maintenant" : 'Register now'}
          </button>

          {/* CTA secondaire */}
          <a
            href="https://wa.me/2250700000000"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-resa-navy/10 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-resa-navy transition hover:border-resa-navy/30"
          >
            💬 {isFr ? 'Une question ?' : 'Questions?'}
          </a>
        </div>
      </div>

      {/* Modal */}
      <CampRegistrationModal
        camp={camp}
        initialValues={initialValues}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}