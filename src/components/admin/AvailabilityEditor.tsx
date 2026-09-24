'use client';

export type AvailabilityItem = {
  day: number; // 1 = Lundi, 7 = Dimanche
  from: string; // "14:00"
  to: string;   // "18:00"
};

const DAYS = [
  { value: 1, label: 'Lundi', short: 'Lun' },
  { value: 2, label: 'Mardi', short: 'Mar' },
  { value: 3, label: 'Mercredi', short: 'Mer' },
  { value: 4, label: 'Jeudi', short: 'Jeu' },
  { value: 5, label: 'Vendredi', short: 'Ven' },
  { value: 6, label: 'Samedi', short: 'Sam' },
  { value: 7, label: 'Dimanche', short: 'Dim' }
];

export default function AvailabilityEditor({
  value,
  onChange
}: {
  value: AvailabilityItem[];
  onChange: (v: AvailabilityItem[]) => void;
}) {
  const add = (day: number) =>
    onChange([...value, { day, from: '14:00', to: '18:00' }]);

  const update = (i: number, field: keyof AvailabilityItem, val: any) =>
    onChange(value.map((a, idx) => (idx === i ? { ...a, [field]: val } : a)));

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  const slotsFor = (day: number) =>
    value
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => slot.day === day);

  return (
    <div className="space-y-3">
      {DAYS.map((d) => {
        const daySlots = slotsFor(d.value);

        return (
          <div
            key={d.value}
            className="rounded-lg border border-black/5 bg-resa-gray/30 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-14 place-items-center rounded-lg bg-resa-navy text-[11px] font-bold uppercase tracking-wider text-white">
                  {d.short}
                </div>
                {daySlots.length === 0 ? (
                  <span className="text-[11px] italic text-resa-text/40">
                    Indisponible
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-resa-navy">
                    {daySlots.length} créneau{daySlots.length > 1 ? 'x' : ''}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => add(d.value)}
                className="rounded-full border border-black/10 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-resa-navy transition hover:bg-resa-navy hover:text-white"
              >
                + Créneau
              </button>
            </div>

            {daySlots.length > 0 && (
              <div className="mt-3 space-y-2">
                {daySlots.map(({ slot, index }) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slot.from}
                      onChange={(e) => update(index, 'from', e.target.value)}
                      className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[12px] outline-none focus:border-resa-navy/40"
                    />
                    <span className="text-[11px] text-resa-text/40">à</span>
                    <input
                      type="time"
                      value={slot.to}
                      onChange={(e) => update(index, 'to', e.target.value)}
                      className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-[12px] outline-none focus:border-resa-navy/40"
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="ml-auto rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 transition hover:bg-red-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      <p className="text-[11px] text-resa-text/40">
        Les créneaux apparaîtront sur la fiche publique du coach.
      </p>
    </div>
  );
}