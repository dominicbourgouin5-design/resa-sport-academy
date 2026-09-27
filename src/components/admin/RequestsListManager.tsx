'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import TrainingRequestsTable from '@/app/admin/demandes-training/TrainingRequestsTable';
import CampRegistrationsTable from '@/app/admin/camps/[id]/inscriptions/CampRegistrationsTable';

type Section = 'pending' | 'contacted' | 'reserved' | 'cancelled';

export default function RequestsListManager({
  type,
  campId,
  camp,
  initialCounts
}: {
  type: 'training' | 'camp';
  campId?: string;
  camp?: any;
  initialCounts: Record<Section, number>;
}) {
  const [active, setActive] = useState<Section>('pending');
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(initialCounts.pending);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  // Filtres période
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [appliedFrom, setAppliedFrom] = useState<string>('');
  const [appliedTo, setAppliedTo] = useState<string>('');

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const load = useCallback(
    async (section: Section, offset: number) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);

      try {
        const params = new URLSearchParams({
          type,
          section,
          offset: String(offset),
          limit: '100'
        });
        if (campId) params.set('campId', campId);
        if (appliedFrom) params.set('dateFrom', appliedFrom);
        if (appliedTo) params.set('dateTo', appliedTo);

        const res = await fetch(`/api/admin/requests?${params.toString()}`);
        const json = await res.json();

        const batch = json.data ?? [];
        if (offset === 0) {
          setItems(batch);
        } else {
          setItems((prev) => [...prev, ...batch]);
        }
        setTotal(json.total ?? 0);
        setHasMore(batch.length === 100);
      } catch (err) {
        console.error('[RequestsListManager] fetch error:', err);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [type, campId, appliedFrom, appliedTo]
  );

  // Changement d'onglet / dates / reload → reset
  useEffect(() => {
    setItems([]);
    setHasMore(true);
    load(active, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reloadKey, appliedFrom, appliedTo]);

  // Scroll infini
  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingRef.current) {
          load(active, items.length);
        }
      },
      { rootMargin: '300px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, items.length, active]);

  const applyDates = () => {
    setAppliedFrom(dateFrom);
    setAppliedTo(dateTo);
  };

  const clearDates = () => {
    setDateFrom('');
    setDateTo('');
    setAppliedFrom('');
    setAppliedTo('');
  };

  const exportCsv = () => {
    const params = new URLSearchParams({
      type,
      section: active
    });
    if (campId) params.set('campId', campId);
    if (appliedFrom) params.set('dateFrom', appliedFrom);
    if (appliedTo) params.set('dateTo', appliedTo);

    window.open(`/api/admin/requests/export?${params.toString()}`, '_blank');
  };

  const hasDateFilter = !!(appliedFrom || appliedTo);

  const sections: { key: Section; label: string; icon: string }[] = [
    { key: 'pending',   label: 'En attente', icon: '⏳' },
    { key: 'contacted', label: 'Contactés',  icon: '📞' },
    { key: 'reserved',  label: 'Réservés',   icon: '✅' },
    { key: 'cancelled', label: 'Annulés',    icon: '✕' }
  ];

  return (
    <div>
      {/* ═══ Barre filtre + export ═══ */}
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
          onClick={applyDates}
          disabled={!dateFrom && !dateTo}
          className="rounded-full bg-resa-navy px-5 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-resa-royal disabled:opacity-50"
        >
          Appliquer
        </button>

        {hasDateFilter && (
          <button
            onClick={clearDates}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
          >
            Effacer
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-xs font-bold uppercase tracking-wide text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100"
          >
            ⬇️ Exporter CSV
          </button>
        </div>
      </div>

      {hasDateFilter && (
        <p className="mb-3 text-[11px] text-resa-text/50">
          Filtre actif :
          {appliedFrom && <> du <strong>{new Date(appliedFrom).toLocaleDateString('fr-FR')}</strong></>}
          {appliedTo && <> au <strong>{new Date(appliedTo).toLocaleDateString('fr-FR')}</strong></>}
        </p>
      )}

      {/* ═══ Onglets ═══ */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-black/5 pb-3">
        {sections.map((s) => {
          const count = initialCounts[s.key] ?? 0;
          const isActive = active === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold transition ${
                isActive
                  ? 'bg-resa-navy text-white shadow-resa'
                  : 'bg-white text-resa-text/60 border border-black/10 hover:border-resa-navy/30'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-resa-gray text-resa-navy'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mb-3 text-[11px] text-resa-text/50">
        {total} résultat(s) — {items.length} affiché(s)
      </p>

      {items.length === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-black/10 p-12 text-center">
          <p className="text-sm text-resa-text/60">Aucun résultat dans cette section.</p>
        </div>
      ) : type === 'training' ? (
        <TrainingRequestsTable
          requests={items}
          onMutate={() => setReloadKey((k) => k + 1)}
        />
      ) : (
        <CampRegistrationsTable
          registrations={items}
          camp={camp}
          onMutate={() => setReloadKey((k) => k + 1)}
        />
      )}

      {hasMore && (
        <div ref={sentinelRef} className="py-8 text-center">
          {loading && <p className="text-xs text-resa-text/50">Chargement…</p>}
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <p className="py-6 text-center text-[11px] italic text-resa-text/40">
          — Fin de la liste —
        </p>
      )}
    </div>
  );
}