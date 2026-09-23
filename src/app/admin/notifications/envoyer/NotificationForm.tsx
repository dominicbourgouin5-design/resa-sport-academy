'use client';

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendNotification } from '../actions';
import { ROLE_LABELS } from '@/lib/roles';
import { cn } from '@/lib/utils';

type User = {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
};

export default function NotificationForm({ users = [] }: { users?: User[] }) {
  const [state, formAction, pending] = useActionState(sendNotification, null);
  const router = useRouter();
  const [audience, setAudience] = useState('all');

  if (state?.ok) {
    setTimeout(() => router.push('/admin/notifications'), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-resa-navy">
          Envoyer une notification
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          Ce message sera envoyé en temps réel aux utilisateurs sélectionnés.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {/* Section 1 : Destinataires */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-navy/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-navy" />
            <h2 className="text-sm font-bold text-resa-navy">Destinataires</h2>
          </header>

          <div className="space-y-4 p-5">
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Audience
              </label>
              <select
                name="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] font-medium text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              >
                <option value="all">🌐 Tout le monde (tous les utilisateurs actifs)</option>
                <option value="admins_only">👑 Administrateurs uniquement</option>
                <option value="managers">🛡️ Admins + Gestionnaires Ligue</option>
                <option value="editors">✏️ Admins + Éditeurs contenu</option>
                <option value="specific">👤 Une personne en particulier</option>
              </select>
            </div>

            {audience === 'specific' && (
              <div>
                <label className="mb-2 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                  Destinataire <span className="text-resa-red">*</span>
                </label>
                {users.length === 0 ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-800">
                    ⚠️ Aucun autre utilisateur actif pour l'instant. Créez d'abord
                    des comptes dans Supabase → Authentication.
                  </div>
                ) : (
                  <select
                    name="specific_user_id"
                    required
                    className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] font-medium text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                  >
                    <option value="">— Sélectionner un destinataire —</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name ?? u.email} — {ROLE_LABELS[u.role] ?? u.role}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="rounded-lg border border-resa-royal/20 bg-resa-royal/5 px-3 py-2.5 text-[11px] text-resa-royal">
              💡 <strong>Vous ne recevrez pas</strong> votre propre message dans votre cloche — l'émetteur est automatiquement exclu.
            </div>
          </div>
        </section>

        {/* Section 2 : Contenu */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-red/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-red" />
            <h2 className="text-sm font-bold text-resa-navy">Contenu</h2>
          </header>
          <div className="space-y-4 p-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Titre <span className="text-resa-red">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="Ex : Nouvelle journée de matchs programmée"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Message
              </label>
              <textarea
                name="body"
                rows={4}
                placeholder="Description détaillée du message…"
                className="w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                  Lien (optionnel)
                </label>
                <input
                  type="text"
                  name="link"
                  placeholder="/admin/matchs"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                  Type
                </label>
                <select
                  name="type"
                  defaultValue="info"
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                >
                  <option value="info">ℹ️ Information</option>
                  <option value="success">✅ Succès</option>
                  <option value="warning">⚠️ Attention</option>
                  <option value="error">❌ Erreur / urgent</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {state?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {state?.ok && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
            ✓ Notification envoyée ! Redirection…
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4">
          <a
            href="/admin/notifications"
            className="rounded-full border border-black/5 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
          >
            Annuler
          </a>
          <button
            type="submit"
            disabled={pending || (audience === 'specific' && users.length === 0)}
            className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? 'Envoi…' : 'Envoyer la notification'}
          </button>
        </div>
      </form>
    </div>
  );
}