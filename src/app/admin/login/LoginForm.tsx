'use client';

import { useActionState } from 'react';
import Logo from '@/components/ui/Logo';
import { login } from './actions';

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:py-10">
      {/* ─── Image de fond PLEINEMENT VISIBLE ─── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/images/login-bg.jpg')` }}
      />

      {/* ─── Overlay LÉGER (image respire) ─── */}
      <div className="absolute inset-0 bg-resa-navy/45" />

      {/* ─── Dégradé latéral pour la lisibilité du texte ─── */}
      <div className="absolute inset-0 bg-gradient-to-br from-resa-navy/70 via-transparent to-resa-navy/60" />

      {/* ─── Vignettage cinéma (coins assombris) ─── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(120% 80% at 50% 50%, transparent 40%, rgba(10,31,68,.6) 100%)'
        }}
      />

      {/* ─── Contenu ─── */}
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">

            <div className="mb-3 flex flex-col items-center gap-3">
              <Logo size="xl" />
              <div className="text-center">
                <div className="font-display text-2xl font-black text-white">
                  RESA Sport Academy
                </div>
              </div>
            </div>
          <p className="mt-6 text-sm font-medium text-white/85 drop-shadow-lg">
            Connectez-vous pour accéder au back-office admin.
          </p>
        </div>

        <form
          action={formAction}
          className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-2xl"
        >
          <input type="hidden" name="redirect" value={redirectTo} />

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/80">
                Email
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-white/20 bg-white/20 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-sm transition focus:border-white/60 focus:bg-white/30 focus:ring-2 focus:ring-white/30"
                placeholder="admin@resasportacademy.ci"
              />
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/80">
                Mot de passe
              </label>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-white/20 bg-white/20 px-4 py-3 text-sm text-white placeholder:text-white/50 outline-none backdrop-blur-sm transition focus:border-white/60 focus:bg-white/30 focus:ring-2 focus:ring-white/30"
                placeholder="••••••••"
              />
            </div>
          </div>

          {state?.error && (
            <div className="mt-5 rounded-xl border border-red-500/40 bg-red-500/20 px-4 py-3 text-sm text-white backdrop-blur-sm">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-resa-red px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:bg-red-700 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? 'Connexion…' : 'Se connecter'}
            {!pending && <span>→</span>}
          </button>

          <p className="mt-6 text-center text-xs text-white/70">
            Accès réservé au personnel autorisé de RESA Sport Academy.
          </p>
        </form>

        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-white/60 drop-shadow-lg">
          Côte d'Ivoire · Saison 2027
        </p>
      </div>
    </div>
  );
}