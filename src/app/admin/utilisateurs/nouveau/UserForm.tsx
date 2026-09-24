'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { createUser } from '../actions';

export default function UserForm() {
  const [state, formAction, pending] = useActionState(createUser, null);
  const [showPassword, setShowPassword] = useState(false);

  // Génère un mot de passe aléatoire simple
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pwd = '';
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const [password, setPassword] = useState('');

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa-lg">

      {/* Barre top */}
      <div className="h-1 bg-gradient-to-r from-resa-navy via-resa-royal to-resa-navy" />

      {/* Header */}
      <div className="border-b border-black/5 bg-gradient-to-r from-resa-navy/5 to-transparent px-6 py-5">
        <h2 className="text-sm font-bold text-resa-navy">
          Informations du compte
        </h2>
        <p className="mt-1 text-xs text-resa-text/50">
          Tous les champs marqués d'un <span className="text-resa-red">*</span> sont obligatoires.
        </p>
      </div>

      <form action={formAction} className="space-y-6 p-6 md:p-8">

        {/* Nom complet */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
            Nom complet <span className="text-resa-red">*</span>
          </label>
          <input
            type="text"
            name="full_name"
            required
            placeholder="Ex : Roger Sampah"
            className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
            Adresse email <span className="text-resa-red">*</span>
          </label>
          <input
            type="email"
            name="email"
            required
            placeholder="utilisateur@resasportacademy.ci"
            className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
          />
          <div className="mt-1 text-[10px] text-resa-text/40">
            Cet email servira d'identifiant de connexion.
          </div>
        </div>

        {/* Mot de passe */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
            Mot de passe temporaire <span className="text-resa-red">*</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 pr-10 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-resa-text/40 transition hover:text-resa-navy"
                aria-label={showPassword ? 'Cacher' : 'Afficher'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setPassword(generatePassword());
                setShowPassword(true);
              }}
              className="shrink-0 rounded-lg border border-black/10 bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-resa-navy transition hover:bg-resa-gray"
            >
              🔄 Générer
            </button>
          </div>
          <div className="mt-1 text-[10px] text-resa-text/40">
            L'utilisateur pourra modifier son mot de passe plus tard.
          </div>
        </div>

        {/* Rôle */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
            Rôle <span className="text-resa-red">*</span>
          </label>
          <select
            name="role"
            defaultValue="content_editor"
            required
            className="w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[13px] text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
          >
            <option value="admin">👑 Administrateur — Accès total</option>
            <option value="league_manager">🛡️ Gestionnaire Ligue — Écoles, matchs, résultats</option>
            <option value="result_entry">✍️ Saisie résultats — Scores uniquement</option>
            <option value="content_editor">✏️ Éditeur contenu — Actualités, photos, sponsors</option>
          </select>
          <div className="mt-2 rounded-lg border border-black/5 bg-resa-gray/50 p-3 text-[11px] leading-relaxed text-resa-text/60">
            <strong className="text-resa-navy">Permissions :</strong>
            <ul className="mt-1 space-y-0.5">
              <li>• <strong>Admin</strong> : tout (utilisateurs, règles, sponsors, matchs)</li>
              <li>• <strong>Gestionnaire Ligue</strong> : écoles, équipes, matchs, actualités (pas users/règles/sponsors)</li>
              <li>• <strong>Saisie résultats</strong> : scores et statuts de match uniquement</li>
              <li>• <strong>Éditeur contenu</strong> : actualités, photos, sponsors (pas matchs/écoles)</li>
            </ul>
          </div>
        </div>

        {/* Erreur */}
        {state?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {/* Succès */}
        {state?.ok && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <strong className="font-bold">✓ Compte créé avec succès !</strong>
            <p className="mt-1 text-emerald-600">
              L'utilisateur peut maintenant se connecter avec les identifiants fournis.
            </p>
            <Link
              href="/admin/utilisateurs"
              className="mt-3 inline-block rounded-full bg-emerald-500 px-5 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-emerald-600"
            >
              Retour à la liste
            </Link>
          </div>
        )}

        {/* Actions */}
        {!state?.ok && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4">
            <Link
              href="/admin/utilisateurs"
              className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
            >
              {pending ? 'Création…' : 'Créer le compte'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}