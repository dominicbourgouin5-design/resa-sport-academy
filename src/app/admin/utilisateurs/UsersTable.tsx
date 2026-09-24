'use client';

import { useState } from 'react';
import { updateUserRole, toggleUserActive } from './actions';
import Dropdown from '@/components/admin/Dropdown';
import ConfirmModal from '@/components/admin/ConfirmModal';

const ROLE_OPTIONS = [
  { value: 'admin',          label: 'Administrateur',     icon: '👑', color: 'bg-resa-red/10 text-resa-red' },
  { value: 'league_manager', label: 'Gestionnaire Ligue', icon: '🛡️', color: 'bg-resa-navy/10 text-resa-navy' },
  { value: 'result_entry',   label: 'Saisie résultats',   icon: '✍️', color: 'bg-resa-royal/10 text-resa-royal' },
  { value: 'content_editor', label: 'Éditeur contenu',    icon: '✏️', color: 'bg-amber-500/10 text-amber-700' }
] as const;

export default function UsersTable({
  users,
  myId
}: {
  users: any[];
  myId: string;
}) {
  const [toToggle, setToToggle] = useState<any | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-160 text-sm">
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
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        u.is_active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {u.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {/* Mobile : rôle en dropdown compact */}
                      <div className="md:hidden">
                        <RoleDropdown userId={u.id} currentRole={u.role} isMe={isMe} compact />
                      </div>

                      {/* Bouton activer/désactiver */}
                      <button
                        onClick={() => setToToggle(u)}
                        disabled={isMe && u.is_active}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          u.is_active
                            ? 'border-amber-200 bg-white text-amber-700 hover:bg-amber-50'
                            : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={
                          isMe && u.is_active
                            ? 'Vous ne pouvez pas désactiver votre propre compte'
                            : u.is_active
                            ? 'Désactiver ce compte'
                            : 'Réactiver ce compte'
                        }
                      >
                        {u.is_active ? 'Désactiver' : 'Activer'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Confirmation activation/désactivation */}
      <ConfirmModal
        open={!!toToggle}
        onClose={() => setToToggle(null)}
        onConfirm={async () => {
          if (!toToggle) return;
          await toggleUserActive(toToggle.id, toToggle.is_active);
          setToToggle(null);
        }}
        title={toToggle?.is_active ? 'Désactiver ce compte ?' : 'Réactiver ce compte ?'}
        message={
          toToggle?.is_active
            ? `${toToggle?.full_name ?? toToggle?.email ?? ''} ne pourra plus se connecter à l'administration tant que le compte est désactivé.`
            : `${toToggle?.full_name ?? toToggle?.email ?? ''} pourra à nouveau se connecter avec ses identifiants.`
        }
        confirmLabel={toToggle?.is_active ? 'Désactiver' : 'Réactiver'}
        variant={toToggle?.is_active ? 'warning' : 'info'}
        icon={toToggle?.is_active ? '⏸️' : '▶️'}
      />
    </>
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
  const [loading, setLoading] = useState(false);

  const current = ROLE_OPTIONS.find((r) => r.value === currentRole) ?? ROLE_OPTIONS[3];

  const handleChange = async (role: string) => {
    if (role === currentRole) return;
    setLoading(true);
    try {
      await updateUserRole(userId, role as any);
    } catch (err: any) {
      alert(err.message ?? 'Erreur lors du changement de rôle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dropdown
      align="left"
      trigger={({ toggle }: { open: boolean; toggle: () => void }) => (
        <button
          onClick={toggle}
          disabled={loading}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition hover:opacity-80 disabled:opacity-50 ${current.color}`}
        >
          <span>{current.icon}</span>
          <span>{compact ? current.label.split(' ')[0] : current.label}</span>
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
      )}
    >
      <>
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
          Changer le rôle
        </div>
        {ROLE_OPTIONS.map((r) => {
          const isCurrent = r.value === currentRole;
          const blocked = isMe && r.value !== 'admin';
          return (
            <button
              key={r.value}
              onClick={() => !isCurrent && !blocked && handleChange(r.value)}
              disabled={isCurrent || blocked}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] font-medium transition ${
                isCurrent
                  ? 'cursor-default bg-resa-gray/50 text-resa-text/40'
                  : blocked
                  ? 'cursor-not-allowed text-resa-text/30'
                  : 'text-resa-navy hover:bg-resa-gray'
              }`}
              title={blocked ? 'Vous ne pouvez pas retirer votre propre rôle admin' : ''}
            >
              <span>{r.icon}</span>
              <span className="flex-1">{r.label}</span>
              {isCurrent && <span className="text-[10px] font-bold">✓</span>}
            </button>
          );
        })}
      </>
    </Dropdown>
  );
}