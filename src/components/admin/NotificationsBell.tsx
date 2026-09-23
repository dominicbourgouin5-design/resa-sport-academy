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
  const [loading, setLoading] = useState(true);

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
      .then(({ data }) => {
        setItems((data ?? []) as Notif[]);
        setLoading(false);
      });
  }, [userId]);

  // ─── Realtime ───
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications-bell-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setItems((prev) => {
            if (prev.some((n) => n.id === (payload.new as Notif).id)) return prev;
            return [payload.new as Notif, ...prev].slice(0, 10);
          });
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
          setItems((prev) =>
            prev.map((n) => (n.id === (payload.new as Notif).id ? (payload.new as Notif) : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // ─── Ferme au changement de page (mobile) ───
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) setOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ─── Bloque le scroll du body sur mobile quand ouvert ───
  useEffect(() => {
    if (open && window.innerWidth < 640) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

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
    <>
      {/* Bouton cloche */}
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

      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Dropdown desktop / Drawer mobile */}
      {open && (
        <div
          className={cn(
            // Base commune
            'z-50 overflow-hidden border-black/5 bg-white shadow-2xl',
            // Mobile : plein écran
            'fixed inset-x-0 top-0 flex h-[100dvh] flex-col border-0 sm:hidden',
            // Desktop : dropdown classique
            'sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:h-auto sm:max-h-[600px] sm:w-96 sm:rounded-xl sm:border'
          )}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-black/5 bg-resa-navy px-4 py-3 text-white sm:bg-white sm:text-resa-navy">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-resa-red px-2 py-0.5 text-[10px] font-black text-white">
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-[10px] font-bold uppercase tracking-wider text-white/80 transition hover:text-white sm:text-resa-red sm:hover:text-resa-navy"
                >
                  Tout lu
                </button>
              )}
              {/* Bouton fermer — uniquement mobile */}
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white sm:hidden"
                aria-label="Fermer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Liste scrollable */}
          <div className="flex-1 overflow-y-auto overscroll-contain sm:max-h-96">
            {loading ? (
              <div className="px-4 py-12 text-center text-xs italic text-resa-text/40">
                Chargement…
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-resa-gray text-3xl">
                  📭
                </div>
                <div className="text-sm font-semibold text-resa-navy">
                  Aucune notification
                </div>
                <div className="text-xs text-resa-text/50">
                  Vous serez averti dès qu'une nouvelle arrive.
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-black/5">
                {items.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.link ?? '/admin/notifications'}
                      onClick={() => {
                        handleMarkRead(n.id);
                        setOpen(false);
                      }}
                      className={cn(
                        'block px-4 py-3 transition active:bg-resa-gray/80 hover:bg-resa-gray/60 sm:py-3',
                        !n.is_read && 'bg-resa-red/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {!n.is_read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-resa-red" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-semibold leading-tight text-resa-navy sm:text-[13px]">
                            {n.title}
                          </div>
                          {n.body && (
                            <div className="mt-1 line-clamp-2 text-[12px] text-resa-text/60 sm:text-[11px]">
                              {n.body}
                            </div>
                          )}
                          <div className="mt-1.5 text-[10px] text-resa-text/40">
                            {new Date(n.created_at).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer — Voir tout */}
          {items.length > 0 && (
            <div className="shrink-0 border-t border-black/5 bg-white px-4 py-3 text-center sm:py-2">
              <Link
                href="/admin/notifications"
                onClick={() => setOpen(false)}
                className="text-[11px] font-bold uppercase tracking-wider text-resa-text/60 transition hover:text-resa-red"
              >
                Voir tout →
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}