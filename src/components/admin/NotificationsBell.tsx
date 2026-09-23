'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { markAsRead, markAllAsRead } from '@/app/admin/notifications/actions';
import { cn } from '@/lib/utils';

type Notif = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);

  // ─── Chargement initial ───
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setItems((data ?? []) as Notif[]));
  }, [userId]);

  // ─── Realtime : écoute les nouvelles notifications ───
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('[Bell] Nouvelle notification reçue :', payload.new);
          setItems((prev) => [payload.new as Notif, ...prev].slice(0, 10));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('[Bell] Notification mise à jour :', payload.new);
          setItems((prev) =>
            prev.map((n) => (n.id === (payload.new as Notif).id ? (payload.new as Notif) : n))
          );
        }
      )
      .subscribe((status) => {
        console.log('[Bell] Realtime status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const unreadCount = items.filter((i) => !i.is_read).length;

  const handleMarkRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    await markAsRead(id);
  };

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllAsRead();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-9 w-9 place-items-center rounded-full text-resa-navy transition hover:bg-resa-gray"
        aria-label="Notifications"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-resa-red px-1 text-[9px] font-black text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-2 w-80 overflow-hidden rounded-xl border border-black/5 bg-white shadow-xl anim-fade-up">
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
              <div className="text-sm font-bold text-resa-navy">Notifications</div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-[10px] font-bold uppercase tracking-wider text-resa-red transition hover:text-resa-navy"
                >
                  Tout marquer lu
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs italic text-resa-text/40">
                Aucune notification
              </div>
            ) : (
              <ul className="max-h-96 divide-y divide-black/5 overflow-y-auto">
                {items.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.link ?? '/admin/notifications'}
                      onClick={() => handleMarkRead(n.id)}
                      className={cn(
                        'block px-4 py-3 transition hover:bg-resa-gray/60',
                        !n.is_read && 'bg-resa-red/5'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!n.is_read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-resa-red" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-semibold text-resa-navy">
                            {n.title}
                          </div>
                          {n.body && (
                            <div className="mt-0.5 line-clamp-2 text-[11px] text-resa-text/60">
                              {n.body}
                            </div>
                          )}
                          <div className="mt-1 text-[10px] text-resa-text/40">
                            {new Date(n.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-black/5 px-4 py-2 text-center">
              <Link
                href="/admin/notifications"
                className="text-[10px] font-bold uppercase tracking-wider text-resa-text/50 transition hover:text-resa-red"
              >
                Voir tout →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}