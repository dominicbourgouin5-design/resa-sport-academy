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
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const load = useCallback(async (section: Section, offset: number) => {
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
  }, [type, campId]);

  // Changement d'onglet ou reload → reset
  useEffect(() => {
    setItems([]);
    setHasMore(true);
    load(active, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reloadKey]);

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

  const sections: { key: Section; label: string; icon: string }[] = [
    { key: 'pending',   label: 'En attente', icon: '⏳' },
    { key: 'contacted', label: 'Contactés',  icon: '📞' },
    { key: 'reserved',  label: 'Réservés',   icon: '✅' },
    { key: 'cancelled', label: 'Annulés',    icon: '✕' }
  ];

  return (
    <div>
      {/* Onglets */}
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

      {/* Résumé */}
      <p className="mb-3 text-[11px] text-resa-text/50">
        {total} résultat(s) — {items.length} affiché(s)
      </p>

      {/* Liste */}
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

      {/* Sentinel scroll */}
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