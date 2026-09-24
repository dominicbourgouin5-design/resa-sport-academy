'use client';

export type RateItem = {
  label_fr: string;
  label_en: string;
  region: 'both' | 'africa' | 'usa';
  duration: string;
  sessions: string;
  price_fr: string;
  price_en: string;
};

export default function RatesEditor({
  value,
  onChange
}: {
  value: RateItem[];
  onChange: (v: RateItem[]) => void;
}) {
  const add = () =>
    onChange([
      ...value,
      {
        label_fr: '',
        label_en: '',
        region: 'both',
        duration: '60',
        sessions: '1',
        price_fr: '',
        price_en: ''
      }
    ]);

  const update = (i: number, field: keyof RateItem, val: string) =>
    onChange(value.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));

  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      {value.map((rate, i) => (
        <div
          key={i}
          className="rounded-lg border border-black/5 bg-resa-gray/30 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
              Tarif {i + 1}
            </span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="rounded-lg bg-red-50 px-2 py-1 text-[10px] font-bold text-red-600 transition hover:bg-red-100"
            >
              Retirer
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={rate.label_fr}
              onChange={(e) => update(i, 'label_fr', e.target.value)}
              placeholder="Libellé FR (ex : Séance 1-on-1)"
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] outline-none focus:border-resa-navy/40"
            />
            <input
              value={rate.label_en}
              onChange={(e) => update(i, 'label_en', e.target.value)}
              placeholder="Label EN (ex: 1-on-1 session)"
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] outline-none focus:border-resa-navy/40"
            />

            <select
              value={rate.region}
              onChange={(e) => update(i, 'region', e.target.value)}
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] outline-none focus:border-resa-navy/40"
            >
              <option value="both">Les deux régions</option>
              <option value="africa">Afrique uniquement</option>
              <option value="usa">USA uniquement</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={rate.duration}
                onChange={(e) => update(i, 'duration', e.target.value)}
                placeholder="Durée (min)"
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] outline-none focus:border-resa-navy/40"
              />
              <input
                type="number"
                value={rate.sessions}
                onChange={(e) => update(i, 'sessions', e.target.value)}
                placeholder="Nb séances"
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] outline-none focus:border-resa-navy/40"
              />
            </div>

            <input
              value={rate.price_fr}
              onChange={(e) => update(i, 'price_fr', e.target.value)}
              placeholder="Prix FR (ex : 25 000 FCFA)"
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] outline-none focus:border-resa-navy/40"
            />
            <input
              value={rate.price_en}
              onChange={(e) => update(i, 'price_en', e.target.value)}
              placeholder="Price EN (ex: $40)"
              className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[12px] outline-none focus:border-resa-navy/40"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="w-full rounded-lg border-2 border-dashed border-black/10 px-4 py-3 text-[12px] font-bold text-resa-navy/60 transition hover:border-resa-navy/30 hover:bg-resa-gray/30"
      >
        + Ajouter un tarif
      </button>

      {value.length === 0 && (
        <p className="text-[11px] text-resa-text/40">
          Aucun tarif renseigné. Les tarifs apparaîtront sur la page publique du coach.
        </p>
      )}
    </div>
  );
}