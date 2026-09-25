'use client';

import { useState } from 'react';
import Modal from '@/components/admin/Modal';
import {
  updateCampRegistration,
  sendCampParentEmail
} from '../../actions';
import {
  CAMP_TEMPLATES,
  fillTemplate
} from '@/lib/email-templates-config';

type Step = 1 | 2 | 3 | 4;
type Action = 'contact' | 'confirm' | 'cancel' | 'remind' | null;

const STATUS_LABEL: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  confirmed: 'Confirmé',
  cancelled: 'Annulé'
};

const PAYMENT_LABEL: Record<string, string> = {
  pending: 'En attente',
  paid: 'Payé',
  failed: 'Échoué',
  refunded: 'Remboursé',
  cancelled: 'Annulé'
};

export default function CampRegistrationsWizard({
  registration,
  onClose
}: {
  registration: any;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [action, setAction] = useState<Action>(null);
  const [notes, setNotes] = useState(registration.admin_notes ?? '');
  const [savingNotes, setSavingNotes] = useState(false);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; error?: string } | null>(null);

  const camp = registration.camp ?? {};
  const campTitle = camp.title_fr ?? 'Camp RESA';

  // ─── Formatage des lignes de template ───
  const playerLine = `${registration.player_name ?? 'le joueur'}${registration.player_age ? ` (${registration.player_age} ans)` : ''}`;
  const dateLine = camp.date_start
    ? new Date(camp.date_start).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : '(à préciser)';
  const locationLine = camp.location ?? '(à préciser)';
  const amountLine = camp.price_fr
    ? camp.price_fr
    : camp.price_amount
      ? `${camp.price_amount.toLocaleString('fr-FR')} FCFA`
      : '(à préciser)';

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    if (tplId === '__custom__') {
      setSubject('');
      setBody('');
      return;
    }
    const tpl = CAMP_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    const vars = {
      parent_name: registration.parent_name ?? '',
      player_line: playerLine,
      camp_title: campTitle,
      date_line: dateLine,
      location_line: locationLine,
      amount_line: amountLine
    };
    setSubject(fillTemplate(tpl.subject, vars));
    setBody(fillTemplate(tpl.body, vars));
  };

  const applyAction = (a: Action) => {
    setAction(a);
    let preselect = '';
    if (a === 'contact') preselect = 'acknowledge';
    else if (a === 'confirm') preselect = 'confirm';
    else if (a === 'cancel') preselect = 'cancelled';
    else if (a === 'remind') preselect = 'reminder_payment';
    if (preselect) handleTemplateChange(preselect);
    setStep(3);
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      setSendResult({ ok: false, error: 'Sujet et message obligatoires.' });
      return;
    }
    if (!registration.parent_email) {
      setSendResult({ ok: false, error: 'Pas d\'email disponible.' });
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const res = await sendCampParentEmail(registration.id, subject, body);
      if (!res.ok) {
        setSendResult({ ok: false, error: res.error ?? 'Erreur inconnue' });
        setSending(false);
        return;
      }

      const tpl = CAMP_TEMPLATES.find((t) => t.id === selectedTemplateId);
      const newStatus = tpl?.targetStatus;
      if (newStatus) {
        await updateCampRegistration(registration.id, { status: newStatus as any });
      }

      if (notes !== (registration.admin_notes ?? '')) {
        await updateCampRegistration(registration.id, { admin_notes: notes });
      }

      setStep(4);
    } catch (err: any) {
      setSendResult({ ok: false, error: err.message ?? 'Erreur inconnue' });
    }
    setSending(false);
  };

  return (
    <Modal open onClose={onClose}>
      {/* Overlay flouté premium */}
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
              Inscription camp
            </div>
            <div className="hidden text-xs text-resa-text/40 sm:block">
              {registration.player_name}
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
                {n === 1 ? 'Inscription' : n === 2 ? 'Action' : 'Réponse'}
              </span>
              {n < 3 && <div className="mx-1 h-px w-6 bg-black/10" />}
            </div>
          ))}
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">

          {/* ═══ ÉTAPE 1 : VOIR ═══ */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-black text-resa-navy">
                  {registration.player_name}
                  {registration.player_age && (
                    <span className="ml-2 text-base font-bold text-resa-text/40">
                      · {registration.player_age} ans
                    </span>
                  )}
                </h2>
                {registration.parent_email && (
                  <a
                    href={`mailto:${registration.parent_email}`}
                    className="text-sm text-resa-text/60 underline-offset-2 hover:text-resa-red hover:underline"
                  >
                    {registration.parent_email}
                  </a>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card label="Parent" icon="👤">
                  <span className="font-semibold text-resa-navy">
                    {registration.parent_name}
                  </span>
                </Card>
                {registration.parent_phone && (
                  <Card label="Téléphone" icon="📞">
                    <a
                      href={`tel:${registration.parent_phone}`}
                      className="font-semibold text-resa-navy underline-offset-2 hover:underline"
                    >
                      {registration.parent_phone}
                    </a>
                  </Card>
                )}
                <Card label="Statut dossier" icon="📋">
                  <span className="font-semibold text-resa-navy">
                    {STATUS_LABEL[registration.status] ?? registration.status}
                  </span>
                </Card>
                <Card label="Statut paiement" icon="💳">
                  <span className="font-semibold text-resa-navy">
                    {PAYMENT_LABEL[registration.payment_status] ?? registration.payment_status}
                  </span>
                </Card>
              </div>

              {(registration.paid_at ||
                registration.payment_reference ||
                registration.payment_provider_id) && (
                <div className="space-y-1.5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                    ✓ Paiement FedaPay
                  </div>
                  {registration.paid_at && (
                    <div className="text-[12px] text-emerald-800">
                      Payé le{' '}
                      {new Date(registration.paid_at).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                  {registration.payment_reference && (
                    <div className="text-[11px] text-emerald-800">
                      Réf. : <span className="font-mono font-bold">{registration.payment_reference}</span>
                    </div>
                  )}
                  {registration.payment_provider_id && (
                    <div className="text-[10px] text-emerald-700/70">
                      ID tx : <span className="font-mono">#{registration.payment_provider_id}</span>
                    </div>
                  )}
                </div>
              )}

              {registration.notes && (
                <Card label="Notes du parent" icon="💬">
                  <p className="whitespace-pre-line text-sm text-resa-text/75">
                    {registration.notes}
                  </p>
                </Card>
              )}

              <div>
                <label className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-resa-text/50">
                  📝 Notes internes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Ex : appelé samedi, en attente de réponse…"
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
                  icon="✉️"
                  title="Accuser réception"
                  desc="Confirmer qu'on a bien reçu et qu'on traite"
                  onClick={() => applyAction('contact')}
                  accent="royal"
                />
                <ActionCard
                  icon="✅"
                  title="Confirmer l'inscription"
                  desc="Valider définitivement la place"
                  onClick={() => applyAction('confirm')}
                  accent="emerald"
                />
                <ActionCard
                  icon="💳"
                  title="Rappel de paiement"
                  desc="Relancer pour finaliser le règlement"
                  onClick={() => applyAction('remind')}
                  accent="amber"
                />
                <ActionCard
                  icon="✕"
                  title="Annuler l'inscription"
                  desc="Impossible de maintenir la place"
                  onClick={() => applyAction('cancel')}
                  accent="red"
                />
                <ActionCard
                  icon="📝"
                  title="Email personnalisé"
                  desc="Écrire un message libre"
                  onClick={() => {
                    setAction(null);
                    handleTemplateChange('__custom__');
                    setStep(3);
                  }}
                  accent="navy"
                />
              </div>
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
                  {registration.parent_email || '— pas d\'email —'}
                </span>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                  Modèle d'email
                </label>
                <div className="grid gap-2">
                  {CAMP_TEMPLATES.map((tpl) => (
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
                L'inscription de <strong>{registration.player_name}</strong> a été traitée.
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
                    await updateCampRegistration(registration.id, { admin_notes: notes });
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
                disabled={sending || !registration.parent_email}
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
  accent: 'royal' | 'emerald' | 'amber' | 'red' | 'navy';
}) {
  const colors: Record<string, string> = {
    royal: 'hover:border-resa-royal/40 hover:bg-resa-royal/5',
    emerald: 'hover:border-emerald-500/40 hover:bg-emerald-50',
    amber: 'hover:border-amber-500/40 hover:bg-amber-50',
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