'use client';

import { useLocale } from 'next-intl';

export type AvailabilityItem = {
  day: number;
  from: string;
  to: string;
};

const DAYS_FR = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DAYS_SHORT_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function PublicAvailability({
  availability,
  title
}: {
  availability: AvailabilityItem[];
  title?: string;
}) {
  const locale = useLocale();
  const isFr = locale === 'fr';

  const list = availability ?? [];
  if (list.length === 0) return null;

  const daysLabels = isFr ? DAYS_FR : DAYS_EN;
  const daysShort = isFr ? DAYS_SHORT_FR : DAYS_SHORT_EN;

  // Groupe par jour
  const grouped: Record<number, AvailabilityItem[]> = {};
  for (const slot of list) {
    (grouped[slot.day] ??= []).push(slot);
  }

  const daysOrder = [1, 2, 3, 4, 5, 6, 7].filter((d) => grouped[d]);

  return (
    <section>
      <div className="mb-4 h-1 w-12 bg-resa-royal" />
      <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
        {title ?? (isFr ? 'Disponibilités' : 'Availability')}
      </h2>

      <div className="mt-6 space-y-2">
        {daysOrder.map((dayNum) => {
          const slots = grouped[dayNum]
            .slice()
            .sort((a, b) => a.from.localeCompare(b.from));

          return (
            <div
              key={dayNum}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-black/5 bg-white p-3 shadow-resa"
            >
              <div className="grid h-9 w-16 shrink-0 place-items-center rounded-lg bg-resa-navy text-[11px] font-bold uppercase tracking-wider text-white">
                {daysShort[dayNum - 1]}
              </div>
              <div className="text-[12px] font-semibold text-resa-text/60 sm:hidden">
                {daysLabels[dayNum - 1]}
              </div>
              <div className="flex flex-wrap gap-2">
                {slots.map((s, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-full bg-resa-gray px-3 py-1 text-[12px] font-bold text-resa-navy"
                  >
                    🕒 {s.from} – {s.to}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] italic text-resa-text/45">
        {isFr
          ? 'Créneaux indicatifs — la réservation finale se fait par contact.'
          : 'Indicative slots — final booking via contact.'}
      </p>
    </section>
  );
}