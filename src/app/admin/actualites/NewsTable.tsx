'use client';

import Link from 'next/link';
import { useState } from 'react';
import { toggleNewsPublished, deleteNews } from './actions';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function NewsTable({ articles }: { articles: any[] }) {
  const [q, setQ] = useState('');
  const [toDelete, setToDelete] = useState<any | null>(null);

  const filtered = articles.filter((a) => {
    const term = q.toLowerCase();
    return (
      a.title_fr.toLowerCase().includes(term) ||
      (a.title_en ?? '').toLowerCase().includes(term) ||
      a.slug.toLowerCase().includes(term)
    );
  });

  if (articles.length === 0) {
    return (
      <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
        Aucun article dans cette section.
      </p>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-black/5 px-5 py-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-resa-text/30">
            🔍
          </span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un article…"
            className="w-full rounded-lg border border-black/10 bg-resa-gray/50 py-2 pl-9 pr-3 text-[12px] outline-none transition focus:border-resa-navy/30 focus:bg-white focus:ring-2 focus:ring-resa-navy/10"
          />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
          {filtered.length} / {articles.length}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
          Aucun résultat.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-black/5 bg-resa-gray/40">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                <th className="px-5 py-2.5 text-left">Article</th>
                <th className="hidden px-5 py-2.5 text-left lg:table-cell">Auteur</th>
                <th className="hidden px-5 py-2.5 text-center md:table-cell">Date</th>
                <th className="px-5 py-2.5 text-center">Statut</th>
                <th className="px-5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((a) => (
                <tr key={a.id} className="transition hover:bg-resa-gray/40">
                  <td className="px-5 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-resa-navy">
                        {a.title_fr}
                      </div>
                      <div className="truncate text-[10px] uppercase tracking-wider text-resa-text/40">
                        {a.slug}
                      </div>
                    </div>
                  </td>

                  <td className="hidden px-5 py-3 lg:table-cell">
                    <div className="text-[11px] text-resa-text/60">
                      {a.author?.full_name ?? a.author?.email ?? '—'}
                    </div>
                  </td>

                  <td className="hidden px-5 py-3 text-center md:table-cell">
                    <div className="text-[11px] text-resa-text/60">
                      {a.published_at
                        ? new Date(a.published_at).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })
                        : new Date(a.created_at).toLocaleDateString('fr-FR', {
                            day: '2-digit', month: 'short'
                          })}
                    </div>
                  </td>

                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => toggleNewsPublished(a.id, a.is_published)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                        a.is_published
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                      }`}
                      title="Cliquer pour changer le statut"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {a.is_published ? 'Publié' : 'Brouillon'}
                    </button>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/actualites/${a.id}`}
                        className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-navy transition hover:border-resa-navy/20 hover:bg-resa-gray"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => setToDelete(a)}
                        className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                      >
                        Suppr.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteNews(toDelete.id);
          setToDelete(null);
        }}
        title="Supprimer cet article ?"
        message={`L'article "${toDelete?.title_fr ?? ''}" sera définitivement supprimé. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  );
}