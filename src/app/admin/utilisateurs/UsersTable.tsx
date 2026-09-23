'use client';

import { useState } from 'react';
import { updateUserRole, toggleUserActive } from './actions';

const ROLE_OPTIONS = [
  { value: 'admin',          label: 'Administrateur',     color: 'bg-resa-red/10 text-resa-red' },
  { value: 'league_manager', label: 'Gestionnaire Ligue', color: 'bg-resa-navy/10 text-resa-navy' },
  { value: 'result_entry',   label: 'Saisie résultats',   color: 'bg-resa-royal/10 text-resa-royal' },
  { value: 'content_editor', label: 'Éditeur contenu',    color: 'bg-amber-500/10 text-amber-700' }
] as const;

export default function UsersTable({
  users,
  myId
}: {
  users: any[];
  myId: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">        
        <thead className="border-b border-black/5 bg-resa-gray/40">
          <tr className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
            <th className="px-5 py-2.5 text-left">Utilisateur</th>
            <th className="hidden px-5 py-2.5 text-left md:table-cell">Rôle</th>
            <th className="hidden px-5 py-2.5 text-center lg:table-cell">Depuis</th>
            <th className="px-5 py-2.5 text-center">Statut</th>
            <th className="px-5 py-2.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5">
          {users.map((u) => {
            const isMe = u.id === myId;
            return (
              <tr key={u.id} className={`transition hover:bg-resa-gray/40 ${isMe ? 'bg-resa-navy/5' : ''}`}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-resa-navy to-resa-royal font-display text-[12px] font-black text-white">
                      {(u.full_name ?? u.email ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 truncate text-[13px] font-semibold text-resa-navy">
                        {u.full_name ?? u.email}
                        {isMe && (
                          <span className="shrink-0 rounded-full bg-resa-navy px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            Vous
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[11px] text-resa-text/50">
                        {u.email}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="hidden px-5 py-3 md:table-cell">
                  <RoleDropdown userId={u.id} currentRole={u.role} isMe={isMe} />
                </td>

                <td className="hidden px-5 py-3 text-center lg:table-cell">
                  <div className="text-[11px] text-resa-text/60">
                    {new Date(u.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </div>
                </td>

                <td className="px-5 py-3 text-center">
                  <button
                    onClick={() => toggleUserActive(u.id, u.is_active)}
                    disabled={isMe && u.is_active}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition ${
                      u.is_active
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    } ${isMe && u.is_active ? 'cursor-not-allowed opacity-60' : ''}`}
                    title={isMe && u.is_active ? 'Vous ne pouvez pas vous désactiver' : 'Cliquer pour changer le statut'}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {u.is_active ? 'Actif' : 'Inactif'}
                  </button>
                </td>

                <td className="px-5 py-3 text-right">
                  <div className="md:hidden">
                    <RoleDropdown userId={u.id} currentRole={u.role} isMe={isMe} compact />
                  </div>
                  <div className="hidden md:block text-[11px] text-resa-text/30">
                    {isMe ? '—' : ''}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Dropdown de changement de rôle ─────────────────────────
function RoleDropdown({
  userId,
  currentRole,
  isMe,
  compact = false
}: {
  userId: string;
  currentRole: string;
  isMe: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const current = ROLE_OPTIONS.find((r) => r.value === currentRole) ?? ROLE_OPTIONS[3];

  const handleChange = async (role: any) => {
    if (role === currentRole) {
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      await updateUserRole(userId, role);
      setOpen(false);
    } catch (err: any) {
      alert(err.message ?? 'Erreur lors du changement de rôle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition hover:opacity-80 disabled:opacity-50 ${current.color}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {compact ? current.label.split(' ')[0] : current.label}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="h-2.5 w-2.5"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-lg border border-black/5 bg-white shadow-lg anim-fade-up">
            {ROLE_OPTIONS.map((r) => {
              const isCurrent = r.value === currentRole;
              const blocked = isMe && r.value !== 'admin';
              return (
                <button
                  key={r.value}
                  onClick={() => handleChange(r.value)}
                  disabled={isCurrent || blocked}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium transition ${
                    isCurrent
                      ? 'bg-resa-gray text-resa-text/40 cursor-default'
                      : blocked
                      ? 'cursor-not-allowed text-resa-text/30'
                      : 'text-resa-navy hover:bg-resa-gray'
                  }`}
                  title={blocked ? 'Vous ne pouvez pas retirer votre propre rôle admin' : ''}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    r.value === 'admin' ? 'bg-resa-red' :
                    r.value === 'league_manager' ? 'bg-resa-navy' :
                    r.value === 'result_entry' ? 'bg-resa-royal' : 'bg-amber-500'
                  }`} />
                  {r.label}
                  {isCurrent && <span className="ml-auto text-[9px]">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}