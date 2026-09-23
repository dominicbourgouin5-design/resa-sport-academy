'use client';

import { useState } from 'react';
import Link from 'next/link';
import { markAsRead, markAllAsRead, deleteNotification } from './actions';

export default function NotificationsList({ notifications }: { notifications: any[] }) {
  const [items, setItems] = useState<any[]>(notifications ?? []);

  const handleRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    try {
      await markAsRead(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await markAllAsRead();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    setItems((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = (items ?? []).filter((n) => !n.is_read).length;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-12 text-center shadow-sm">
        <div className="mb-3 text-4xl">📭</div>
        <p className="text-sm text-resa-text/60">
          Aucune notification pour le moment.
        </p>
      </div>
    );
  }

  return (
    <>
      {unreadCount > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-xl border border-resa-red/20 bg-resa-red/5 px-4 py-3">
          <div className="text-sm font-bold text-resa-red">
            {unreadCount} notification(s) non lue(s)
          </div>
          <button
            onClick={handleReadAll}
            className="text-[11px] font-bold uppercase tracking-wider text-resa-red transition hover:text-resa-navy"
          >
            Tout marquer lu
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
        <ul className="divide-y divide-black/5">
          {items.map((n) => (
            <li
              key={n.id}
              className={`group relative px-5 py-4 transition hover:bg-resa-gray/40 ${
                !n.is_read ? 'bg-resa-red/5' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {!n.is_read && (
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-resa-red" />
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[14px] font-bold text-resa-navy">
                      {n.title}
                    </div>
                    {n.type && n.type !== 'info' && (
                      <span className="rounded-full bg-resa-navy/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-resa-navy">
                        {n.type}
                      </span>
                    )}
                  </div>

                  {n.body && (
                    <p className="mt-1 text-[13px] text-resa-text/70">{n.body}</p>
                  )}

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-resa-text/40">
                    <span>
                        {new Date(n.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                        })}
                    </span>

                    {n.sender && (
                        <span className="inline-flex items-center gap-1.5">
                        <span className="font-semibold text-resa-navy/70">
                            {n.sender.full_name ?? n.sender.email}
                        </span>
                        {n.is_broadcast && (
                            <span className="rounded-full bg-resa-navy/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-resa-navy">
                            Annonce
                            </span>
                        )}
                        </span>
                    )}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 opacity-0 transition group-hover:opacity-100">
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={() => handleRead(n.id)}
                      className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[10px] font-bold text-resa-navy transition hover:bg-resa-gray"
                    >
                      Voir
                    </Link>
                  )}
                  {!n.is_read && (
                    <button
                      onClick={() => handleRead(n.id)}
                      className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[10px] font-bold text-resa-royal transition hover:bg-resa-gray"
                    >
                      Lu
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[10px] font-bold text-red-600 transition hover:bg-red-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}