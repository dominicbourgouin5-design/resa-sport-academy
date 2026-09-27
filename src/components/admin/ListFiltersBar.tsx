'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ListFiltersBar({ entity }: { entity: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const appliedFrom = searchParams.get('dateFrom') ?? '';
  const appliedTo = searchParams.get('dateTo') ?? '';

  const [dateFrom, setDateFrom] = useState(appliedFrom);
  const [dateTo, setDateTo] = useState(appliedTo);

  // Sync si l'URL change (retour arrière navigateur)
  useEffect(() => {
    setDateFrom(appliedFrom);
    setDateTo(appliedTo);
  }, [appliedFrom, appliedTo]);

  const hasFilter = !!(appliedFrom || appliedTo);
  const pending = dateFrom !== appliedFrom || dateTo !== appliedTo;

  const apply = () => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo) params.set('dateTo', dateTo);
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`);
  };

  const clear = () => {
    setDateFrom('');
    setDateTo('');
    router.push(pathname);
  };

  const exportCsv = () => {
    const params = new URLSearchParams();
    if (appliedFrom) params.set('dateFrom', appliedFrom);
    if (appliedTo) params.set('dateTo', appliedTo);
    window.open(`/api/admin/export/${entity}?${params.toString()}`, '_blank');
  };

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-black/5 bg-white p-4">
      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
          Date début
        </label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
        />
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
          Date fin
        </label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
        />
      </div>

      <button
        onClick={apply}
        disabled={!dateFrom && !dateTo}
        className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wide shadow-resa transition disabled:opacity-50 ${
          pending
            ? 'bg-resa-red text-white hover:bg-red-700'
            : 'bg-resa-navy text-white hover:bg-resa-royal'
        }`}
      >
        {pending ? '↻ Appliquer' : 'Appliquer'}
      </button>

      {hasFilter && (
        <button
          onClick={clear}
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
        >
          Effacer
        </button>
      )}

      {hasFilter && (
        <div className="text-[11px] text-resa-text/50">
          Filtre actif :
          {appliedFrom && <> du <strong>{new Date(appliedFrom).toLocaleDateString('fr-FR')}</strong></>}
          {appliedTo && <> au <strong>{new Date(appliedTo).toLocaleDateString('fr-FR')}</strong></>}
        </div>
      )}

      <div className="ml-auto">
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-xs font-bold uppercase tracking-wide text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100"
        >
          ⬇️ Exporter CSV
        </button>
      </div>
    </div>
  );
}