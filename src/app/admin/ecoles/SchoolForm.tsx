'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { saveSchool, declareGeneralForfeit } from './actions';
import ImageUpload from '@/components/admin/ImageUpload';
import ConfirmModal from '@/components/admin/ConfirmModal';

export default function SchoolForm({
  school,
  activeSeason,
  forfeitCount = 0
}: {
  school?: any;
  activeSeason?: { id: string; name: string } | null;
  forfeitCount?: number;
}) {
  const [state, formAction, pending] = useActionState(saveSchool, null);
  const isEdit = !!school;

  const [logoUrl, setLogoUrl] = useState<string>(school?.logo_url ?? '');

  // État pour le forfait général
  const [forfeitOpen, setForfeitOpen] = useState(false);
  const [forfeitLoading, setForfeitLoading] = useState(false);
  const [forfeitResult, setForfeitResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleForfeit = async () => {
    if (!school || !activeSeason) return;
    setForfeitLoading(true);
    try {
      const res = await declareGeneralForfeit(school.id, activeSeason.id);
      if (res.error) {
        setForfeitResult({ ok: false, message: res.error });
      } else {
        setForfeitResult({
          ok: true,
          message: `Forfait général déclaré. ${res.matches_affected ?? 0} match(s) basculé(s) en 3-0.`
        });
      }
    } catch (err: any) {
      setForfeitResult({ ok: false, message: err.message ?? 'Erreur inconnue' });
    }
    setForfeitLoading(false);
    setForfeitOpen(false);
  };

  return (
    <div className="mx-auto max-w-3xl">

      {/* Fil d'ariane */}
      <div className="mb-6 text-[11px] text-resa-text/50">
        <Link href="/admin/ecoles" className="hover:text-resa-red">
          Écoles
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-resa-navy">
          {isEdit ? 'Modifier' : 'Nouvelle école'}
        </span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-resa-navy">
          {isEdit ? school.name : 'Nouvelle école'}
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          {isEdit
            ? "Modifier les informations de l'établissement."
            : "Ajouter un nouvel établissement participant à la Ligue."}
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="id" value={school.id} />}
        <input type="hidden" name="logo_url" value={logoUrl} />

        {/* Section 1 : Identité */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-linear-to-r from-resa-navy/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-navy" />
            <h2 className="text-sm font-bold text-resa-navy">Identité de l'établissement</h2>
          </header>

          <div className="space-y-4 p-5">
            <Field
              label="Nom de l'école"
              name="name"
              defaultValue={school?.name}
              required
              placeholder="Ex : EPP Cocody Nord"
            />

            <Field
              label="Slug (identifiant URL)"
              name="slug"
              defaultValue={school?.slug}
              required
              placeholder="epp-cocody-nord"
              hint="Minuscules, tirets uniquement. Utilisé dans l'URL publique."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ville" name="city" defaultValue={school?.city} placeholder="Abidjan" />
              <Field label="Commune / Quartier" name="district" defaultValue={school?.district} placeholder="Cocody" />
            </div>

            <Field
              label="Description (FR)"
              name="description_fr"
              defaultValue={school?.description_fr}
              as="textarea"
              rows={3}
            />

            <Field
              label="Description (EN)"
              name="description_en"
              defaultValue={school?.description_en}
              as="textarea"
              rows={3}
            />

            <ImageUpload
              label="Logo de l'école"
              value={logoUrl}
              onChange={setLogoUrl}
              folder="logos/schools"
              aspect="1/1"
              hint="Carré recommandé (minimum 200×200 px). JPG, PNG ou WebP."
            />
          </div>
        </section>

        {/* Section 2 : Contact */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-linear-to-r from-resa-royal/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-royal" />
            <h2 className="text-sm font-bold text-resa-navy">Contact</h2>
          </header>

          <div className="space-y-4 p-5">
            <Field
              label="Nom du référent"
              name="contact_name"
              defaultValue={school?.contact_name}
              placeholder="Ex : Mme Kouamé Adjoua"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Téléphone"
                name="contact_phone"
                type="tel"
                defaultValue={school?.contact_phone}
                placeholder="+225 07 00 00 00 00"
              />
              <Field
                label="Email"
                name="contact_email"
                type="email"
                defaultValue={school?.contact_email}
                placeholder="contact@ecole.ci"
              />
            </div>
          </div>
        </section>

        {/* Section 3 : Statut */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-linear-to-r from-emerald-500/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-resa-navy">Statut</h2>
          </header>
          <div className="p-5">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={school ? school.is_active : true}
                className="h-4 w-4 rounded border-black/20 text-resa-red focus:ring-resa-red/30"
              />
              <div>
                <div className="text-[13px] font-semibold text-resa-navy">
                  École active
                </div>
                <div className="text-[11px] text-resa-text/50">
                  Une école inactive n'apparaît pas sur le site public.
                </div>
              </div>
            </label>
          </div>
        </section>

        {/* Erreur */}
        {state?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4">
          <Link
            href="/admin/ecoles"
            className="rounded-full border border-black/5 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : "Créer l'école"}
          </button>
        </div>
      </form>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ZONE DE DANGER — Forfait général                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {isEdit && activeSeason && (
        <section className="mt-10 overflow-hidden rounded-xl border-2 border-red-200 bg-red-50/50 shadow-sm">
          <header className="flex items-center gap-3 border-b border-red-200 bg-red-100/50 px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-red-600" />
            <h2 className="text-sm font-bold text-red-800">⚠️ Zone dangereuse</h2>
          </header>

          <div className="space-y-4 p-5">
            <div className="rounded-lg border border-red-200 bg-white p-4">
              <div className="mb-1 text-[13px] font-bold text-red-800">
                Déclarer un forfait général
              </div>
              <p className="text-[12px] leading-relaxed text-red-700/80">
                Conformément au règlement (3 forfaits → forfait général), cette action
                bascule <strong>tous les matchs passés et futurs</strong> de cette école
                en <strong>3-0 pour les adversaires</strong>. Le classement est recalculé
                automatiquement.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  forfeitCount >= 3
                    ? 'bg-red-100 text-red-700'
                    : forfeitCount >= 2
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {forfeitCount} forfait{forfeitCount !== 1 ? 's' : ''} — saison {activeSeason.name}
                </span>
              </div>
            </div>

            {forfeitResult && (
              <div className={`rounded-lg border px-4 py-3 text-sm ${
                forfeitResult.ok
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}>
                {forfeitResult.ok ? '✓ ' : '✕ '}
                {forfeitResult.message}
              </div>
            )}

            <button
              type="button"
              onClick={() => setForfeitOpen(true)}
              disabled={forfeitLoading}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
            >
              🚫 Déclarer le forfait général
            </button>
          </div>
        </section>
      )}

      {/* Confirmation forfait */}
      <ConfirmModal
        open={forfeitOpen}
        onClose={() => setForfeitOpen(false)}
        onConfirm={handleForfeit}
        title="Déclarer le forfait général ?"
        message={`Tous les matchs de "${school?.name ?? ''}" pour la saison ${activeSeason?.name ?? ''} seront basculés en 3-0 pour leurs adversaires. Le classement sera recalculé automatiquement. Cette action est irréversible.`}
        confirmLabel="Confirmer le forfait"
        variant="danger"
        icon="🚫"
      />
    </div>
  );
}

// ─── Champ générique ────────────────────────────────────────
function Field({
  label, name, defaultValue, type = 'text', required = false,
  placeholder, hint, as = 'input', rows = 3
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  as?: 'input' | 'textarea';
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
        {label}
        {required && <span className="ml-1 text-resa-red">*</span>}
      </label>

      {as === 'textarea' ? (
        <textarea
          name={name}
          defaultValue={defaultValue ?? ''}
          rows={rows}
          placeholder={placeholder}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue ?? ''}
          required={required}
          placeholder={placeholder}
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
        />
      )}

      {hint && (
        <div className="mt-1 text-[10px] text-resa-text/40">{hint}</div>
      )}
    </div>
  );
}