'use client';

import { useEffect, useState } from 'react';
import {
  subscribeToPush,
  unsubscribeFromPush,
  isPushEnabled,
  getNotificationPermission
} from '@/lib/push-client';
import { cn } from '@/lib/utils';

export default function PushToggle({ userId }: { userId: string }) {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Détection support
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window)
    ) {
      setSupported(false);
      return;
    }

    isPushEnabled().then(setEnabled);
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (enabled) {
        await unsubscribeFromPush(userId);
        setEnabled(false);
        setMessage('Notifications désactivées');
      } else {
        await subscribeToPush(userId);
        setEnabled(true);
        setMessage('Notifications activées !');
      }
    } catch (err: any) {
      setMessage(err.message ?? 'Erreur');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (!supported) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        ⚠️ Votre navigateur ne supporte pas les notifications push.
        Essayez Chrome, Edge ou Firefox.
      </div>
    );
  }

  const permission = getNotificationPermission();

  return (
    <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'grid h-10 w-10 place-items-center rounded-lg text-lg',
                enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-resa-gray text-resa-text/50'
              )}
            >
              🔔
            </div>
            <div>
              <div className="text-[14px] font-bold text-resa-navy">
                Notifications push
              </div>
              <div className="text-[11px] text-resa-text/50">
                {enabled
                  ? 'Vous recevrez les notifications sur cet appareil.'
                  : 'Recevez les alertes même quand le navigateur est fermé.'}
              </div>
            </div>
          </div>

          {permission === 'denied' && !enabled && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
              🚫 Les notifications sont bloquées par le navigateur. Autorisez-les
              dans les paramètres du site (icône 🔒 dans la barre d'adresse).
            </div>
          )}

          {message && (
            <div className="mt-3 rounded-lg border border-resa-royal/20 bg-resa-royal/5 px-3 py-2 text-[11px] text-resa-royal">
              {message}
            </div>
          )}
        </div>

        <button
          onClick={handleToggle}
          disabled={loading || permission === 'denied'}
          className={cn(
            'shrink-0 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wide transition disabled:opacity-50',
            enabled
              ? 'border border-black/10 bg-white text-red-600 hover:bg-red-50'
              : 'bg-resa-red text-white shadow-resa hover:bg-red-700'
          )}
        >
          {loading ? '…' : enabled ? 'Désactiver' : 'Activer'}
        </button>
      </div>
    </div>
  );
}