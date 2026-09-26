'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PreviewForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from') ?? '/fr';

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/preview-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Mot de passe incorrect.');
        setLoading(false);
        return;
      }

      // Succès → redirection
      router.replace(from);
      router.refresh();
    } catch {
      setError('Erreur réseau. Réessayez.');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-resa-navy px-4">
      {/* Fond décoratif */}
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-10" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-resa-red/10 blur-3xl" />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">
        {/* Header navy */}
        <div className="bg-resa-navy px-8 py-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/70">
            🔒 Environnement privé
          </div>
          <div className="font-display text-2xl font-black tracking-tight text-white">
            RESA SPORT ACADEMY
          </div>
        </div>

        {/* Barre rouge */}
        <div className="h-1 gradient-line" />

        {/* Contenu */}
        <div className="px-8 py-10">
          <h1 className="font-display text-xl font-black text-resa-navy">
            Accès restreint
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-resa-text/60">
            Cet environnement est une <strong>prévisualisation privée</strong> en
            cours de développement. Il n'est pas accessible publiquement.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                required
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-3 text-[14px] text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-resa-red px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Vérification…' : 'Accéder'}
            </button>
          </form>

          <div className="mt-8 border-t border-black/5 pt-6 text-center">
            <p className="text-[11px] text-resa-text/40">
              Pour toute demande d'accès, contactez :<br />
              <a
                href="mailto:contact@cataria-systems.com"
                className="mt-1 inline-block font-semibold text-resa-navy hover:text-resa-red"
              >
                contact@cataria-systems.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}