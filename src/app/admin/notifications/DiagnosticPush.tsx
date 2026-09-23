'use client';

import { useState } from 'react';

export default function DiagnosticPush({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const runDiag = async () => {
    setLoading(true);
    setLogs([]);
    const addLog = (msg: string) => setLogs((l) => [...l, msg]);

    try {
      if (!('serviceWorker' in navigator)) {
        addLog('❌ Service Worker non supporté');
        return;
      }
      addLog('✅ Service Worker supporté');

      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        addLog('❌ Aucun Service Worker enregistré');
        return;
      }
      addLog(`✅ SW enregistré — état : ${reg.active?.state}`);

      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        addLog('❌ Aucun abonnement push');
        return;
      }
      addLog(`✅ Abonnement actif`);
      addLog(`   Endpoint : ${sub.endpoint.slice(0, 70)}...`);
      addLog(`   Expire : ${sub.expirationTime ? new Date(sub.expirationTime).toLocaleString() : 'jamais'}`);

      addLog(`✅ Permission : ${Notification.permission}`);

      // Test : affiche une notification locale
      addLog('🔄 Test notification locale...');
      await reg.showNotification('Diagnostic', {
        body: 'Si tu vois ça, le SW peut afficher des notifs',
        icon: '/favicon-96x96.png'
      });
      addLog('✅ Notification locale affichée');

      addLog('');
      addLog('👉 Si la notif locale s\'affiche, le problème est côté VAPID ou livraison.');
      addLog('   → Teste un push réel depuis un autre compte.');
    } catch (err: any) {
      addLog(`❌ Erreur : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-black/5 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-[13px] font-bold text-resa-navy">
            🔧 Diagnostic Push
          </div>
          <div className="text-[11px] text-resa-text/50">
            Vérifie l'état du Service Worker et de l'abonnement
          </div>
        </div>
        <button
          onClick={runDiag}
          disabled={loading}
          className="rounded-full bg-resa-navy px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-resa-royal disabled:opacity-50"
        >
          {loading ? 'Diagnostic…' : 'Lancer'}
        </button>
      </div>

      {logs.length > 0 && (
        <pre className="mt-3 max-h-80 overflow-y-auto rounded-lg bg-resa-navy p-3 text-[11px] leading-relaxed text-emerald-300">
          {logs.join('\n')}
        </pre>
      )}
    </div>
  );
}