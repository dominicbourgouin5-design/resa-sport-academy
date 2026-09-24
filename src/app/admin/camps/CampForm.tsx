'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import ImageUpload from '@/components/admin/ImageUpload';
import { saveCamp } from './actions';

export default function CampForm({ camp }: { camp?: any }) {
  const [state, formAction, pending] = useActionState(saveCamp, null);
  const isEdit = !!camp;

  const [imageUrl, setImageUrl] = useState(camp?.image_url ?? '');

  const autoSlug = (v: string) =>
    v.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  return (
    <div className="mx-auto max-w-3xl">

      <div className="mb-6 text-[11px] text-resa-text/50">
        <Link href="/admin/camps" className="hover:text-resa-red">
          Camps & Tryouts
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-resa-navy">
          {isEdit ? 'Modifier' : 'Nouveau'}
        </span>
      </div>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-resa-navy">
          {isEdit ? camp.title_fr : 'Nouveau camp / tryout'}
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          {isEdit
            ? 'Modifier les informations de l\'événement.'
            : 'Créer un stage ou une session de détection.'}
        </p>
      </div>

      <form action={formAction} className="space-y-6 pb-32">
        {isEdit && <input type="hidden" name="id" value={camp.id} />}
        <input type="hidden" name="image_url" value={imageUrl} />

        {/* Type & identité */}
        <Section title="Type & identité" accent="navy">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
              Type d'événement
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'camp',   label: '🏕️ Camp',   desc: 'Stage de vacances' },
                { value: 'tryout', label: '🔍 Tryout', desc: 'Session de détection' }
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="group flex cursor-pointer items-start gap-3 rounded-lg border-2 border-black/5 bg-white px-4 py-3 transition has-[:checked]:border-resa-red has-[:checked]:bg-resa-red/5"
                >
                  <input
                    type="radio"
                    name="type"
                    value={opt.value}
                    defaultChecked={
                      camp ? camp.type === opt.value : opt.value === 'camp'
                    }
                    className="mt-1 h-4 w-4 border-black/20 text-resa-red focus:ring-resa-red/30"
                  />
                  <div>
                    <div className="text-[13px] font-bold text-resa-navy">
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-resa-text/50">
                      {opt.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Titre (FR)"
              name="title_fr"
              defaultValue={camp?.title_fr}
              required
              placeholder="Camp de Noël 2026"
            />
            <Field
              label="Title (EN)"
              name="title_en"
              defaultValue={camp?.title_en}
              required
              placeholder="Christmas Camp 2026"
            />
          </div>

          <Field
            label="Slug (URL)"
            name="slug"
            defaultValue={camp?.slug}
            required
            placeholder="camp-noel-2026"
            hint={`URL publique : /camps/${camp?.slug ?? 'mon-camp'}`}
          />
        </Section>

        {/* Dates & lieu */}
        <Section title="Dates & lieu" accent="royal">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Date de début"
              name="date_start"
              type="date"
              defaultValue={camp?.date_start}
              required
            />
            <Field
              label="Date de fin"
              name="date_end"
              type="date"
              defaultValue={camp?.date_end}
              hint="Laisse vide si événement d'un seul jour."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Heure de début"
              name="time_start"
              type="time"
              defaultValue={camp?.time_start}
              placeholder="09:00"
            />
            <Field
              label="Heure de fin"
              name="time_end"
              type="time"
              defaultValue={camp?.time_end}
              placeholder="17:00"
            />
          </div>

          <Field
            label="Lieu"
            name="location"
            defaultValue={camp?.location}
            placeholder="Stade d'Abidjan — Cocody"
          />
        </Section>

        {/* Public */}
        <Section title="Public concerné" accent="emerald">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Âge minimum"
              name="age_min"
              type="number"
              defaultValue={camp?.age_min?.toString()}
              placeholder="8"
            />
            <Field
              label="Âge maximum"
              name="age_max"
              type="number"
              defaultValue={camp?.age_max?.toString()}
              placeholder="13"
            />
            <Field
              label="Places disponibles"
              name="capacity"
              type="number"
              defaultValue={camp?.capacity?.toString()}
              placeholder="30"
            />
          </div>
        </Section>

        {/* Tarifs */}
        <Section title="Tarifs" accent="amber">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Prix affiché (FR)"
              name="price_fr"
              defaultValue={camp?.price_fr}
              placeholder="25 000 FCFA"
            />
            <Field
              label="Price label (EN)"
              name="price_en"
              defaultValue={camp?.price_en}
              placeholder="$40"
            />
          </div>
          <Field
            label="Montant brut (pour paiement en ligne)"
            name="price_amount"
            type="number"
            defaultValue={camp?.price_amount?.toString()}
            placeholder="25000"
            hint="Montant en FCFA (entier). Utilisé pour FedaPay."
          />
        </Section>

        {/* Descriptions */}
        <Section title="Descriptions" accent="royal">
          <Field
            label="Description courte (FR)"
            name="description_fr"
            defaultValue={camp?.description_fr}
            as="textarea"
            rows={2}
          />
          <Field
            label="Short description (EN)"
            name="description_en"
            defaultValue={camp?.description_en}
            as="textarea"
            rows={2}
          />
          <Field
            label="Description longue (FR)"
            name="long_description_fr"
            defaultValue={camp?.long_description_fr}
            as="textarea"
            rows={5}
            hint="Détails du programme, ce qui est inclus, ce qu'il faut apporter…"
          />
          <Field
            label="Long description (EN)"
            name="long_description_en"
            defaultValue={camp?.long_description_en}
            as="textarea"
            rows={5}
          />
        </Section>

        {/* Visuel */}
        <Section title="Visuel" accent="navy">
          <ImageUpload
            label="Image de couverture"
            value={imageUrl}
            onChange={setImageUrl}
            folder="covers"
            aspect="16/9"
            hint="Photo du camp ou du stade. Format paysage 1600×900 recommandé."
          />
        </Section>

        {/* Publication */}
        <Section title="Publication" accent="amber">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Statut
              </label>
              <select
                name="status"
                defaultValue={camp?.status ?? 'open'}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              >
                <option value="open">Ouvert aux inscriptions</option>
                <option value="full">Complet</option>
                <option value="closed">Clôturé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                Région
              </label>
              <select
                name="region"
                defaultValue={camp?.region ?? 'both'}
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              >
                <option value="both">Les deux</option>
                <option value="africa">Afrique</option>
                <option value="usa">USA</option>
              </select>
            </div>

            <Field
              label="Ordre"
              name="display_order"
              type="number"
              defaultValue={camp?.display_order?.toString() ?? '100'}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 pt-2">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={camp ? camp.is_active : true}
              className="h-4 w-4 rounded border-black/20 text-resa-red focus:ring-resa-red/30"
            />
            <div>
              <div className="text-[13px] font-semibold text-resa-navy">
                Événement actif
              </div>
              <div className="text-[11px] text-resa-text/50">
                Un événement inactif n'apparaît pas sur le site public.
              </div>
            </div>
          </label>
        </Section>

        {state?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        {/* Barre sticky */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-black/5 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur md:left-60 md:px-8">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <Link
              href="/admin/camps"
              className="rounded-full border border-black/5 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
            >
              {pending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer l\'événement'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Section({
  title,
  accent = 'navy',
  children
}: {
  title: string;
  accent?: 'navy' | 'royal' | 'red' | 'emerald' | 'amber';
  children: React.ReactNode;
}) {
  const accents: Record<string, string> = {
    navy: 'from-resa-navy/5 bg-resa-navy',
    royal: 'from-resa-royal/5 bg-resa-royal',
    red: 'from-resa-red/5 bg-resa-red',
    emerald: 'from-emerald-500/5 bg-emerald-500',
    amber: 'from-amber-500/5 bg-amber-500'
  };
  const [gradient, bar] = accents[accent].split(' ');
  return (
    <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
      <header
        className={`flex items-center gap-3 border-b border-black/5 bg-gradient-to-r ${gradient} to-transparent px-5 py-3`}
      >
        <div className={`h-4 w-1 rounded-full ${bar}`} />
        <h2 className="text-sm font-bold text-resa-navy">{title}</h2>
      </header>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

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
      {hint && <div className="mt-1 text-[10px] text-resa-text/40">{hint}</div>}
    </div>
  );
}