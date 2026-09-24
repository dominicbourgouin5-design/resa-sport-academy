'use client';

import { useLocale } from 'next-intl';

export type RateItem = {
  label_fr: string;
  label_en: string;
  region: 'both' | 'africa' | 'usa';
  duration: string;
  sessions: string;
  price_fr: string;
  price_en: string;
};

export default function PublicRates({
  rates,
  title
}: {
  rates: RateItem[];
  title?: string;
}) {
  const locale = useLocale();
  const isFr = locale === 'fr';

  // Ne garde que les tarifs valides (prix renseigné)
  const valid = (rates ?? []).filter(
    (r) => r.label_fr || r.label_en
  );
  if (valid.length === 0) return null;

  return (
    <section>
      <div className="mb-4 h-1 w-12 bg-resa-red" />
      <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
        {title ?? (isFr ? 'Tarifs' : 'Pricing')}
      </h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {valid.map((r, i) => {
          const label = isFr ? r.label_fr : r.label_en || r.label_fr;
          const price = isFr ? r.price_fr : r.price_en || r.price_fr;
          const regionLabel =
            r.region === 'usa'
              ? '🇺🇸'
              : r.region === 'africa'
              ? '🇨🇮'
              : null;

          return (
            <article
              key={i}
              className="group relative overflow-hidden rounded-2xl border border-black/5 bg-white p-5 shadow-resa transition-all duration-300 hover:-translate-y-1 hover:border-resa-red/20 hover:shadow-resa-lg"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base font-black leading-tight text-resa-navy">
                      {label}
                    </h3>
                    {regionLabel && (
                      <span className="text-sm">{regionLabel}</span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-resa-text/50">
                    {r.duration && (
                      <span>⏱️ {r.duration} min</span>
                    )}
                    {r.sessions && r.sessions !== '1' && (
                      <span>📅 {r.sessions} {isFr ? 'séances' : 'sessions'}</span>
                    )}
                  </div>
                </div>
              </div>

              {price && (
                <div className="mt-2 font-display text-2xl font-black text-resa-red">
                  {price}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}