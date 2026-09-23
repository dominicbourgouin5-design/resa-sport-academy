'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import { saveSponsor } from './actions';
import { cn } from '@/lib/utils';

const TIERS = [
  { value: 'platinum', label: 'Platinum', desc: 'Partenaire principal', color: 'from-slate-700 to-slate-900', badge: 'bg-slate-800 text-white' },
  { value: 'gold',     label: 'Gold',     desc: 'Partenaire majeur',    color: 'from-amber-500 to-amber-700',   badge: 'bg-amber-500 text-white' },
  { value: 'silver',   label: 'Silver',   desc: 'Partenaire officiel',  color: 'from-gray-400 to-gray-600',     badge: 'bg-gray-500 text-white' },
  { value: 'official', label: 'Officiel', desc: 'Partenaire de la Ligue', color: 'from-resa-navy to-resa-royal', badge: 'bg-resa-navy text-white' }
] as const;

export default function SponsorForm({ sponsor }: { sponsor?: any }) {
  const [state, formAction, pending] = useActionState(saveSponsor, null);
  const isEdit = !!sponsor;

  const [name, setName] = useState(sponsor?.name ?? '');
  const [slug, setSlug] = useState(sponsor?.slug ?? '');
  const [tier, setTier] = useState<string>(sponsor?.tier ?? 'official');
  const [logoUrl, setLogoUrl] = useState(sponsor?.logo_url ?? '');
  const [isActive, setIsActive] = useState(sponsor?.is_active ?? true);

  const autoSlug = (v: string) =>
    v.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit && (!slug || slug === autoSlug(name))) {
      setSlug(autoSlug(v));
    }
  };

  return (
    <div className="mx-auto max-w-3xl">

      {/* Fil d'ariane */}
      <div className="mb-6 text-[11px] text-resa-text/50">
        <Link href="/admin/sponsors" className="hover:text-resa-red">
          Sponsors
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-resa-navy">
          {isEdit ? 'Modifier' : 'Nouveau partenaire'}
        </span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-resa-navy">
          {isEdit ? sponsor.name : 'Nouveau partenaire'}
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          {isEdit
            ? 'Modifier les informations du partenaire.'
            : 'Ajouter un nouveau sponsor à la Ligue.'}
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {isEdit && <input type="hidden" name="id" value={sponsor.id} />}

        {/* Section 1 : Niveau */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-navy/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-navy" />
            <h2 className="text-sm font-bold text-resa-navy">Niveau de partenariat</h2>
          </header>

          <div className="p-5">
            <input type="hidden" name="tier" value={tier} />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TIERS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTier(t.value)}
                  className={cn(
                    'group relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all duration-300',
                    tier === t.value
                      ? 'border-resa-navy bg-resa-navy/5 shadow-resa'
                      : 'border-black/10 bg-white hover:border-resa-navy/30'
                  )}
                >
                  <div className={cn('h-1 w-full rounded-full bg-gradient-to-r', t.color)} />
                  <div className="mt-2.5 font-display text-sm font-black text-resa-navy">
                    {t.label}
                  </div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wider text-resa-text/40">
                    {t.desc}
                  </div>
                  {tier === t.value && (
                    <div className="absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full bg-resa-red text-[9px] font-bold text-white">
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2 : Identité */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-royal/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-royal" />
            <h2 className="text-sm font-bold text-resa-navy">Identité</h2>
          </header>

          <div className="space-y-4 p-5">
            <Field
              label="Nom du partenaire"
              name="name"
              value={name}
              onChange={handleNameChange}
              required
              placeholder="Ex : Banque Atlantique CI"
            />

            <Field
              label="Slug (URL)"
              name="slug"
              value={slug}
              onChange={setSlug}
              required
              placeholder="banque-atlantique-ci"
              hint="Identifiant unique, minuscules et tirets."
            />

            <Field
              label="Site web"
              name="website_url"
              type="url"
              defaultValue={sponsor?.website_url}
              placeholder="https://exemple.ci"
            />
          </div>
        </section>

        {/* Section 3 : Logo */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-amber-500/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-amber-500" />
            <h2 className="text-sm font-bold text-resa-navy">Logo du partenaire</h2>
          </header>
          <div className="p-5">
            <div className="mx-auto max-w-xs">
              <ImageUpload
                label=""
                value={logoUrl}
                onChange={setLogoUrl}
                folder="logos/teams"
                aspect="1/1"
                hint="Format carré recommandé. PNG avec fond transparent idéal."
              />
              <input type="hidden" name="logo_url" value={logoUrl} />
            </div>
          </div>
        </section>

        {/* Section 4 : Description */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-red/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-resa-red" />
            <h2 className="text-sm font-bold text-resa-navy">Description</h2>
          </header>

          <div className="space-y-4 p-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Description (FR)
              </label>
              <textarea
                name="description_fr"
                defaultValue={sponsor?.description_fr ?? ''}
                rows={3}
                placeholder="Ex : Partenaire principal de la saison 2027."
                className="w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] leading-relaxed text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Description (EN)
              </label>
              <textarea
                name="description_en"
                defaultValue={sponsor?.description_en ?? ''}
                rows={3}
                placeholder="Ex : Main partner of the 2027 season."
                className="w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] leading-relaxed text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
            </div>
          </div>
        </section>

        {/* Section 5 : Paramètres */}
        <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
          <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-emerald-500/5 to-transparent px-5 py-3">
            <div className="h-4 w-1 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-resa-navy">Paramètres</h2>
          </header>

          <div className="space-y-4 p-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Ordre d'affichage
              </label>
              <input
                type="number"
                name="sort_order"
                defaultValue={sponsor?.sort_order ?? 99}
                min={1}
                max={999}
                className="w-full max-w-[140px] rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
              <div className="mt-1 text-[10px] text-resa-text/40">
                Un nombre plus petit = affiché en premier dans son niveau.
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-black/20 text-resa-red focus:ring-resa-red/30"
              />
              <div>
                <div className="text-[13px] font-semibold text-resa-navy">
                  Partenaire actif
                </div>
                <div className="text-[11px] text-resa-text/50">
                  Un partenaire inactif n'apparaît pas sur la page publique Sponsors.
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
            href="/admin/sponsors"
            className="rounded-full border border-black/5 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le partenaire'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Champ générique ────────────────────────────────────────
function Field({
  label, name, value, onChange, defaultValue, type = 'text', required = false, placeholder, hint
}: {
  label: string;
  name: string;
  value?: string;
  onChange?: (v: string) => void;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
}) {
  const isControlled = onChange !== undefined;

  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
        {label}
        {required && <span className="ml-1 text-resa-red">*</span>}
      </label>
      <input
        type={type}
        name={name}
        {...(isControlled
          ? { value: value ?? '', onChange: (e) => onChange!(e.target.value) }
          : { defaultValue: defaultValue ?? '' })}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
      />
      {hint && <div className="mt-1 text-[10px] text-resa-text/40">{hint}</div>}
    </div>
  );
}