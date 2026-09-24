'use client';

import { useState } from 'react';
import {
  deleteRegistration,
  updateRegistrationStatus
} from './actions';
import Dropdown from '@/components/admin/Dropdown';
import RegistrationWizard from './RegistrationWizard';
import ConfirmModal from '@/components/admin/ConfirmModal';

type Status = 'pending' | 'reviewing' | 'approved' | 'rejected';

export default function RegistrationsTable({
  registrations,
  currentStatus
}: {
  registrations: any[];
  currentStatus: Status;
}) {
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'school' | 'individual'>('all');

  // Wizard
  const [wizardRequest, setWizardRequest] = useState<any | null>(null);

  // Confirm delete
  const [toDelete, setToDelete] = useState<any | null>(null);

  const filtered = registrations.filter((r) => {
    const term = q.toLowerCase();
    const matchText =
      (r.contact_name ?? '').toLowerCase().includes(term) ||
      (r.contact_phone ?? '').toLowerCase().includes(term) ||
      (r.contact_email ?? '').toLowerCase().includes(term) ||
      (r.school_name ?? '').toLowerCase().includes(term) ||
      (r.player_first_name ?? '').toLowerCase().includes(term);
    const matchType = typeFilter === 'all' ? true : r.type === typeFilter;
    return matchText && matchType;
  });

  return (
    <>
      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3 border-b border-black/5 px-5 py-3">
        <div className="relative min-w-[200px] flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-resa-text/30">
            🔍
          </span>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par nom, école, téléphone, email…"
            className="w-full rounded-lg border border-black/10 bg-resa-gray/50 py-2 pl-9 pr-3 text-[12px] outline-none transition focus:border-resa-navy/30 focus:bg-white focus:ring-2 focus:ring-resa-navy/10"
          />
        </div>

        <div className="flex gap-1 rounded-full border border-black/5 bg-resa-gray p-1">
          {(['all', 'school', 'individual'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition ${
                typeFilter === f
                  ? 'bg-white text-resa-navy shadow-sm'
                  : 'text-resa-text/50 hover:text-resa-navy'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'school' ? 'Écoles' : 'Individuels'}
            </button>
          ))}
        </div>

        <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
          {filtered.length} / {registrations.length}
        </div>
      </div>

      {/* Tableau */}
      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-center text-xs italic text-resa-text/40">
          Aucun résultat.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-black/5 bg-resa-gray/40">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                <th className="px-5 py-2.5 text-left">Type</th>
                <th className="px-5 py-2.5 text-left">Contact</th>
                <th className="hidden px-5 py-2.5 text-left md:table-cell">Détails</th>
                <th className="hidden px-5 py-2.5 text-center lg:table-cell">Reçue le</th>
                <th className="px-5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.map((r) => (
                <tr key={r.id} className="transition hover:bg-resa-gray/40">
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        r.type === 'school'
                          ? 'bg-resa-navy/10 text-resa-navy'
                          : 'bg-resa-red/10 text-resa-red'
                      }`}
                    >
                      {r.type === 'school' ? '🏫 École' : '👤 Individuel'}
                    </span>
                  </td>

                  <td className="px-5 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-resa-navy">
                        {r.contact_name}
                      </div>
                      <div className="truncate text-[10px] text-resa-text/50">
                        {r.contact_phone}
                        {r.contact_email && ` · ${r.contact_email}`}
                      </div>
                    </div>
                  </td>

                  <td className="hidden max-w-md px-5 py-3 md:table-cell">
                    {r.type === 'school' ? (
                      <div className="text-[12px]">
                        <div className="font-medium text-resa-navy">
                          {r.school_name}
                        </div>
                        <div className="text-[10px] text-resa-text/40">
                          {r.school_city}
                          {r.category_codes?.length > 0 && (
                            <span> · {r.category_codes.join(', ')}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[12px]">
                        <div className="font-medium text-resa-navy">
                          {r.player_first_name}
                          {r.player_birth_date && (
                            <span className="text-resa-text/50">
                              {' '}
                              ({new Date(r.player_birth_date).getFullYear()})
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-resa-text/40">
                          {r.player_position ?? 'Poste non précisé'}
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="hidden px-5 py-3 text-center lg:table-cell">
                    <div className="text-[11px] text-resa-text/60">
                      {new Date(r.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setWizardRequest(r)}
                        className="rounded-lg bg-resa-navy px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-resa-royal"
                      >
                        Traiter
                      </button>
                      <ActionsMenu
                        registration={r}
                        current={currentStatus}
                        onDelete={() => setToDelete(r)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Wizard */}
      {wizardRequest && (
        <RegistrationWizard
          registration={wizardRequest}
          onClose={() => setWizardRequest(null)}
        />
      )}

      {/* Confirm delete */}
      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteRegistration(toDelete.id);
          setToDelete(null);
        }}
        title="Supprimer cette inscription ?"
        message={`L'inscription de "${toDelete?.contact_name ?? ''}" sera définitivement supprimée. Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </>
  );
}

// ─── Menu d'actions ─────────────────────────────────────────
function ActionsMenu({
  registration,
  current,
  onDelete
}: {
  registration: any;
  current: Status;
  onDelete: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const statuses: { value: Status; label: string; color: string }[] = [
    { value: 'pending',   label: '⏳ En attente', color: 'text-amber-700' },
    { value: 'reviewing', label: '👀 En cours',   color: 'text-resa-royal' },
    { value: 'approved',  label: '✅ Approuvée',  color: 'text-emerald-700' },
    { value: 'rejected',  label: '❌ Refusée',    color: 'text-red-700' }
  ];

  const handleChange = async (status: Status) => {
    setLoading(true);
    try {
      await updateRegistrationStatus(registration.id, status);
    } catch {
      alert('Erreur lors du changement de statut');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dropdown
      align="right"
      trigger={({ toggle }: { open: boolean; toggle: () => void }) => (
        <button
          onClick={toggle}
          disabled={loading}
          className="rounded-lg border border-black/5 bg-white px-2 py-1 text-[11px] font-bold text-resa-text/60 transition hover:border-resa-navy/20 hover:bg-resa-gray disabled:opacity-50"
          aria-label="Plus d'actions"
        >
          {loading ? '…' : '⋯'}
        </button>
      )}
    >
      <>
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
          Changer le statut
        </div>
        {statuses
          .filter((s) => s.value !== current)
          .map((s) => (
            <button
              key={s.value}
              onClick={() => handleChange(s.value)}
              className={`block w-full px-3 py-2 text-left text-[12px] font-medium transition hover:bg-resa-gray ${s.color}`}
            >
              {s.label}
            </button>
          ))}

        <div className="border-t border-black/5" />

        <button
          onClick={onDelete}
          className="block w-full px-3 py-2 text-left text-[12px] font-medium text-red-600 transition hover:bg-red-50"
        >
          🗑️ Supprimer
        </button>
      </>
    </Dropdown>
  );
}