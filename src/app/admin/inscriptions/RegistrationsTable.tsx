'use client';

import { useState } from 'react';
import { updateRegistrationStatus, deleteRegistration } from './actions';
import Dropdown from '@/components/admin/Dropdown';


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
  const [detail, setDetail] = useState<any>(null);

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
                              {' '}({new Date(r.player_birth_date).getFullYear()})
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
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </div>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setDetail(r)}
                        className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-navy transition hover:border-resa-navy/20 hover:bg-resa-gray"
                      >
                        Voir
                      </button>
                      <StatusMenu id={r.id} current={currentStatus} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal détail */}
      {detail && (
        <DetailModal
          registration={detail}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}

 

// ... (dans StatusMenu, remplace tout le contenu)
function StatusMenu({ id, current }: { id: string; current: Status }) {
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
      await updateRegistrationStatus(id, status);
    } catch {
      alert('Erreur lors du changement de statut');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dropdown
      align="right"
      trigger={({ toggle }) => (
        <button
          onClick={toggle}
          disabled={loading}
          className="rounded-lg border border-black/5 bg-white px-2.5 py-1 text-[11px] font-bold text-resa-royal transition hover:border-resa-royal/20 hover:bg-resa-gray disabled:opacity-50"
        >
          {loading ? '…' : 'Statut ▾'}
        </button>
      )}
    >
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
      <div className="border-t border-black/5">
        <DeleteRegistrationButton id={id} />
      </div>
    </Dropdown>
  );
}

// ─── Bouton supprimer ───────────────────────────────────────
function DeleteRegistrationButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteRegistration(id);
    } catch {
      alert('Erreur lors de la suppression');
      setLoading(false);
      setConfirming(false);
    }
  };

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="block w-full px-3 py-2 text-left text-[12px] font-medium text-red-600 transition hover:bg-red-50"
      >
        🗑️ Supprimer
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-red-50 p-2">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="flex-1 rounded bg-red-600 px-2 py-1 text-[10px] font-bold uppercase text-white disabled:opacity-50"
      >
        {loading ? '…' : 'Confirmer'}
      </button>
      <button
        onClick={() => setConfirming(false)}
        disabled={loading}
        className="rounded border border-black/5 bg-white px-2 py-1 text-[10px] font-bold text-resa-text/60"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Modal détail ───────────────────────────────────────────
function DetailModal({
  registration,
  onClose
}: {
  registration: any;
  onClose: () => void;
}) {
  const r = registration;
  const isSchool = r.type === 'school';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm anim-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl anim-fade-up">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-black/5 px-6 py-4">
          <div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
              {isSchool ? 'Inscription école' : 'Détection individuelle'}
            </div>
            <h2 className="font-display text-xl font-black text-resa-navy">
              {isSchool ? r.school_name : r.player_first_name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-resa-text/40 transition hover:bg-resa-gray"
          >
            ✕
          </button>
        </div>

        {/* Contenu */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {/* Contact */}
          <section className="mb-5">
            <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest text-resa-text/40">
              Contact
            </h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Info label="Nom" value={r.contact_name} />
              <Info label="Téléphone" value={r.contact_phone} href={`tel:${r.contact_phone}`} />
              {r.contact_email && (
                <Info label="Email" value={r.contact_email} href={`mailto:${r.contact_email}`} />
              )}
              <Info
                label="Reçue le"
                value={new Date(r.created_at).toLocaleDateString('fr-FR', {
                  day: '2-digit', month: 'long', year: 'numeric'
                })}
              />
            </dl>
          </section>

          {/* École */}
          {isSchool && (
            <section className="mb-5 border-t border-black/5 pt-5">
              <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest text-resa-text/40">
                Établissement
              </h3>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Info label="Nom" value={r.school_name} />
                <Info label="Ville" value={r.school_city} />
                {r.category_codes?.length > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
                      Catégories souhaitées
                    </dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {r.category_codes.map((c: string) => (
                        <span
                          key={c}
                          className="rounded-md bg-resa-navy/5 px-2 py-0.5 text-[11px] font-bold text-resa-navy"
                        >
                          {c}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          )}

          {/* Joueur */}
          {!isSchool && (
            <section className="mb-5 border-t border-black/5 pt-5">
              <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest text-resa-text/40">
                Joueur
              </h3>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Info label="Prénom" value={r.player_first_name} />
                <Info
                  label="Date de naissance"
                  value={r.player_birth_date
                    ? new Date(r.player_birth_date).toLocaleDateString('fr-FR')
                    : '—'}
                />
                <Info label="Poste" value={r.player_position ?? '—'} />
              </dl>
            </section>
          )}

          {/* Message */}
          {r.message && (
            <section className="border-t border-black/5 pt-5">
              <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest text-resa-text/40">
                Message du demandeur
              </h3>
              <div className="rounded-lg bg-resa-gray/50 p-4 text-[13px] leading-relaxed text-resa-text/80">
                {r.message}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-black/5 bg-resa-gray/30 px-6 py-3">
          <div className="text-[10px] uppercase tracking-widest text-resa-text/40">
            ID : {r.id.slice(0, 8)}
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-black/5 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <>
      <dt className="text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
        {label}
      </dt>
      <dd className="mt-0.5 text-[13px] font-medium text-resa-navy">
        {value}
      </dd>
    </>
  );

  if (href) {
    return (
      <a href={href} className="rounded-lg border border-black/5 bg-white p-3 transition hover:border-resa-navy/20 hover:bg-resa-gray/30">
        {content}
      </a>
    );
  }
  return <div className="rounded-lg border border-black/5 bg-white p-3">{content}</div>;
}