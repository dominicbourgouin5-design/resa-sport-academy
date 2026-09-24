'use client';

import { useState } from 'react';
import Modal from '@/components/admin/Modal';
import {
  updateRegistrationStatus,
  saveAdminNotes,
  sendParentEmailInscription
} from './actions';
import {
  REGISTRATION_TEMPLATES,
  fillTemplate
} from '@/lib/email-templates-config';

type Step = 1 | 2 | 3 | 4;
type Action = 'review' | 'accept' | 'waitlist' | 'reject' | null;

export default function RegistrationWizard({
  registration,
  onClose
}: {
  registration: any;
  onClose: () => void;
}) {
  const isSchool = registration.type === 'school';
  const [step, setStep] = useState<Step>(1);
  const [action, setAction] = useState<Action>(null);
  const [notes, setNotes] = useState(registration.admin_notes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; error?: string } | null>(null);

  // ─── Variables de template ───
  const templateVars = {
    parent_name: registration.contact_name ?? '',
    school_or_player_line: isSchool
      ? registration.school_name
        ? ` pour l'établissement « ${registration.school_name} »`
        : ''
      : registration.player_first_name
      ? ` pour ${registration.player_first_name}`
      : ''
  };

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    if (tplId === '__custom__') {
      setSubject('');
      setBody('');
      return;
    }
    const tpl = REGISTRATION_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    setSubject(tpl.subject);
    setBody(fillTemplate(tpl.body, templateVars));
  };

  const applyAction = (a: Action) => {
    setAction(a);
    let preselect = '';
    if (a === 'review') preselect = 'reviewing';
    else if (a === 'accept') preselect = 'approved';
    else if (a === 'waitlist') preselect = 'waitlist';
    else if (a === 'reject') preselect = 'rejected';
    if (preselect) handleTemplateChange(preselect);
    setStep(3);
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setSendResult({ ok: false, error: 'Sujet et message obligatoires.' });
      return;
    }
    if (!registration.contact_email) {
      setSendResult({ ok: false, error: 'Pas d\'email disponible pour ce demandeur.' });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const res = await sendParentEmailInscription(registration.id, subject, body);
      if (!res.ok) {
        setSendResult({ ok: false, error: res.error ?? 'Erreur inconnue' });
        setSending(false);
        return;
      }

      const tpl = REGISTRATION_TEMPLATES.find((t) => t.id === selectedTemplateId);
      const newStatus = tpl?.targetStatus;
      if (newStatus) {
        await updateRegistrationStatus(registration.id, newStatus);
      }

      if (notes !== (registration.admin_notes ?? '')) {
        await saveAdminNotes(registration.id, notes);
      }

      setStep(4);
    } catch (err: any) {
      setSendResult({ ok: false, error: err.message ?? 'Erreur inconnue' });
    }
    setSending(false);
  };

  return (
    <Modal open onClose={onClose}>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md anim-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] anim-fade-up">
        <div className="h-1 bg-gradient-to-r from-resa-red via-resa-royal to-resa-red" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-resa-red">
              {isSchool ? 'Inscription école' : 'Détection individuelle'}
            </div>
            <div className="hidden text-xs text-resa-text/40 sm:block">
              Réf. {registration.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-resa-text/40 transition hover:bg-resa-gray hover:text-resa-navy"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 border-b border-black/5 bg-resa-gray/40 px-6 py-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`grid h-7 w-7 place-items-center rounded-full text-[11px] font-black transition ${
                  step === n
                    ? 'bg-resa-red text-white'
                    : step > n
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-resa-text/40 ring-1 ring-black/5'
                }`}
              >
                {step > n ? '✓' : n}
              </div>
              <span
                className={`hidden text-[11px] font-bold uppercase tracking-wider sm:block ${
                  step >= n ? 'text-resa-navy' : 'text-resa-text/30'
                }`}
              >
                {n === 1 ? 'Demande' : n === 2 ? 'Action' : 'Réponse'}
              </span>
              {n < 3 && <div className="mx-1 h-px w-6 bg-black/10" />}
            </div>
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">

          {/* ═══ ÉTAPE 1 ═══ */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-black text-resa-navy">
                  {registration.contact_name}
                </h2>
                {registration.contact_email && (
                  <a
                    href={`mailto:${registration.contact_email}`}
                    className="text-sm text-resa-text/60 underline-offset-2 hover:text-resa-red hover:underline"
                  >
                    {registration.contact_email}
                  </a>
                )}
              </div>

              {/* Identité du demandeur */}
              <div className="grid gap-4 sm:grid-cols-2">
                {registration.contact_phone && (
                  <Card label="Téléphone" icon="📞">
                    <a
                      href={`tel:${registration.contact_phone}`}
                      className="font-semibold text-resa-navy underline-offset-2 hover:underline"
                    >
                      {registration.contact_phone}
                    </a>
                  </Card>
                )}
                <Card label="Type" icon={isSchool ? '🏫' : '👤'}>
                  <span className="font-semibold text-resa-navy">
                    {isSchool ? 'École' : 'Détection individuelle'}
                  </span>
                </Card>
                <Card label="Reçue le" icon="📅">
                  <span className="font-semibold text-resa-navy">
                    {new Date(registration.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </Card>
              </div>

              {/* Détails école */}
              {isSchool && (
                <div>
                  <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-resa-text/40">
                    Établissement
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {registration.school_name && (
                      <Card label="Nom" icon="🏫">
                        <span className="font-semibold text-resa-navy">
                          {registration.school_name}
                        </span>
                      </Card>
                    )}
                    {registration.school_city && (
                      <Card label="Ville" icon="📍">
                        <span className="font-semibold text-resa-navy">
                          {registration.school_city}
                        </span>
                      </Card>
                    )}
                  </div>
                  {registration.category_codes?.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-resa-text/40">
                        Catégories souhaitées
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {registration.category_codes.map((c: string) => (
                          <span
                            key={c}
                            className="rounded-md bg-resa-navy/5 px-2.5 py-1 text-[11px] font-bold text-resa-navy"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Détails joueur */}
              {!isSchool && (
                <div>
                  <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-resa-text/40">
                    Joueur
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {registration.player_first_name && (
                      <Card label="Prénom" icon="👤">
                        <span className="font-semibold text-resa-navy">
                          {registration.player_first_name}
                        </span>
                      </Card>
                    )}
                    {registration.player_birth_date && (
                      <Card label="Date de naissance" icon="🎂">
                        <span className="font-semibold text-resa-navy">
                          {new Date(registration.player_birth_date).toLocaleDateString('fr-FR')}
                        </span>
                      </Card>
                    )}
                    {registration.player_position && (
                      <Card label="Poste" icon="⚽">
                        <span className="font-semibold text-resa-navy">
                          {registration.player_position}
                        </span>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Message */}
              {registration.message && (
                <Card label="Message du demandeur" icon="💬">
                  <p className="whitespace-pre-line text-sm text-resa-text/75">
                    {registration.message}
                  </p>
                </Card>
              )}

              {/* Notes */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-resa-text/50">
                  📝 Notes internes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Ex : Dossier validé, en attente du règlement…"
                  className="w-full rounded-lg border border-black/10 bg-resa-gray/30 px-3 py-2.5 text-[13px] text-resa-navy outline-none transition focus:border-resa-navy/40 focus:bg-white focus:ring-2 focus:ring-resa-navy/10"
                />
              </div>
            </div>
          )}

          {/* ═══ ÉTAPE 2 : ACTION ═══ */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-black text-resa-navy">
                  Que voulez-vous faire ?
                </h2>
                <p className="mt-1 text-sm text-resa-text/60">
                  Choisissez une action — vous pourrez personnaliser l'email à l'étape suivante.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ActionCard
                  icon="👀"
                  title="Mettre en cours d'examen"
                  desc="Notifier que le dossier est étudié"
                  onClick={() => applyAction('review')}
                  accent="royal"
                />
                <ActionCard
                  icon="✅"
                  title="Accepter l'inscription"
                  desc="Confirmer la place dans la Ligue"
                  onClick={() => applyAction('accept')}
                  accent="emerald"
                />
                <ActionCard
                  icon="⏳"
                  title="Mettre en liste d'attente"
                  desc="Placer en attente d'une place"
                  onClick={() => applyAction('waitlist')}
                  accent="navy"
                />
                <ActionCard
                  icon="✕"
                  title="Refuser la demande"
                  desc="Impossible de donner suite"
                  onClick={() => applyAction('reject')}
                  accent="red"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setAction(null);
                  handleTemplateChange('__custom__');
                  setStep(3);
                }}
                className="w-full rounded-xl border-2 border-dashed border-black/10 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-resa-text/50 transition hover:border-resa-navy/30 hover:bg-resa-gray/30 hover:text-resa-navy"
              >
                📝 Rédiger un email personnalisé (sans action sur le statut)
              </button>
            </div>
          )}

          {/* ═══ ÉTAPE 3 : EMAIL ═══ */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-black text-resa-navy">
                  Rédiger la réponse
                </h2>
                <p className="mt-1 text-sm text-resa-text/60">
                  Choisissez un modèle ou écrivez un message personnalisé.
                </p>
              </div>

              <div className="rounded-lg border border-black/5 bg-resa-gray/40 px-4 py-3 text-sm">
                <span className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                  À :
                </span>{' '}
                <span className="font-semibold text-resa-navy">
                  {registration.contact_email || '— pas d\'email —'}
                </span>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                  Modèle d'email
                </label>
                <div className="grid gap-2">
                  {REGISTRATION_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleTemplateChange(tpl.id)}
                      className={`rounded-lg border px-4 py-2.5 text-left text-sm transition ${
                        selectedTemplateId === tpl.id
                          ? 'border-resa-red bg-resa-red/5 font-bold text-resa-navy'
                          : 'border-black/10 bg-white text-resa-text/70 hover:bg-resa-gray/50'
                      }`}
                    >
                      {tpl.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleTemplateChange('__custom__')}
                    className={`rounded-lg border px-4 py-2.5 text-left text-sm transition ${
                      selectedTemplateId === '__custom__'
                        ? 'border-resa-red bg-resa-red/5 font-bold text-resa-navy'
                        : 'border-black/10 bg-white text-resa-text/70 hover:bg-resa-gray/50'
                    }`}
                  >
                    📝 Message personnalisé (vide)
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                  Sujet
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                  Message
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] leading-relaxed text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
                />
                <div className="mt-1 text-[10px] text-resa-text/40">
                  Les sauts de ligne seront conservés. Le message sera envoyé avec la charte RESA.
                </div>
              </div>

              {sendResult?.error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {sendResult.error}
                </div>
              )}
            </div>
          )}

          {/* ═══ ÉTAPE 4 : SUCCÈS ═══ */}
          {step === 4 && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-emerald-500 text-3xl text-white shadow-lg">
                ✓
              </div>
              <h2 className="font-display text-2xl font-black text-resa-navy">
                Email envoyé avec succès
              </h2>
              <p className="mt-2 text-sm text-resa-text/60">
                La demande de <strong>{registration.contact_name}</strong> a été traitée.
              </p>
              <p className="mt-1 text-xs text-resa-text/40">
                Le statut a été mis à jour automatiquement.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-black/5 bg-resa-gray/40 px-6 py-4">
          {step === 1 && (
            <>
              <button
                onClick={onClose}
                className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
              >
                Fermer
              </button>
              <button
                onClick={async () => {
                  if (notes !== (registration.admin_notes ?? '')) {
                    setSavingNotes(true);
                    await saveAdminNotes(registration.id, notes);
                    setSavingNotes(false);
                  }
                  setStep(2);
                }}
                disabled={savingNotes}
                className="rounded-full bg-resa-navy px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-resa-royal disabled:opacity-60"
              >
                {savingNotes ? 'Enregistrement…' : 'Suivant →'}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
              >
                ← Retour
              </button>
              <div />
            </>
          )}

          {step === 3 && (
            <>
              <button
                onClick={() => setStep(2)}
                disabled={sending}
                className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray disabled:opacity-50"
              >
                ← Retour
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !registration.contact_email}
                className="inline-flex items-center gap-2 rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-50"
              >
                {sending ? 'Envoi…' : 'Envoyer l\'email'}
                {!sending && <span>→</span>}
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <div />
              <button
                onClick={onClose}
                className="rounded-full bg-resa-navy px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-resa-royal"
              >
                Terminer
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ─── Card info ──────────────────────────────────────────────
function Card({
  label,
  icon,
  children
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-white p-4 shadow-resa">
      <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
        <span>{icon}</span>
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

// ─── Carte d'action ─────────────────────────────────────────
function ActionCard({
  icon,
  title,
  desc,
  onClick,
  accent
}: {
  icon: string;
  title: string;
  desc: string;
  onClick: () => void;
  accent: 'royal' | 'emerald' | 'red' | 'navy';
}) {
  const colors: Record<string, string> = {
    royal: 'hover:border-resa-royal/40 hover:bg-resa-royal/5',
    emerald: 'hover:border-emerald-500/40 hover:bg-emerald-50',
    red: 'hover:border-resa-red/40 hover:bg-resa-red/5',
    navy: 'hover:border-resa-navy/40 hover:bg-resa-navy/5'
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-start gap-3 rounded-xl border-2 border-black/5 bg-white p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-resa-lg ${colors[accent]}`}
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-resa-gray text-2xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-base font-black text-resa-navy">
          {title}
        </div>
        <div className="mt-0.5 text-xs text-resa-text/60">{desc}</div>
      </div>
      <span className="text-resa-text/30 transition group-hover:translate-x-1 group-hover:text-resa-red">
        →
      </span>
    </button>
  );
}