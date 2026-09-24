'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  saveTestimonial,
  deleteTestimonial,
  toggleTestimonialFeatured
} from './actions';
import ImageUpload from '@/components/admin/ImageUpload';

export default function TestimonialsManager({
  coach,
  testimonials
}: {
  coach: { id: string; name: string; slug: string };
  testimonials: any[];
}) {
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const handleEdit = (t: any) => {
    setEditing(t);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleNew = () => {
    setEditing(null);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancel = () => {
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div className="mx-auto max-w-5xl">

      {/* Breadcrumb */}
      <div className="mb-6 text-[11px] text-resa-text/50">
        <Link href="/admin/coachs" className="hover:text-resa-red">
          Coachs
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/admin/coachs/${coach.id}`} className="hover:text-resa-red">
          {coach.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-bold text-resa-navy">Témoignages</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Témoignages
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            {testimonials.length} témoignage(s) pour {coach.name}
          </p>
        </div>
        <button
          onClick={handleNew}
          className="inline-flex items-center gap-2 rounded-full bg-resa-red px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700"
        >
          + Nouveau témoignage
        </button>
      </div>

      {/* Formulaire (inline) */}
      {showForm && (
        <div ref={formRef} className="mb-6">
          <TestimonialForm
            coachId={coach.id}
            testimonial={editing}
            onCancel={handleCancel}
            onSaved={() => {
              setEditing(null);
              setShowForm(false);
            }}
          />
        </div>
      )}

      {/* Liste */}
      {testimonials.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 p-12 text-center text-resa-text/50">
          Aucun témoignage. Cliquez sur <strong>+ Nouveau témoignage</strong> pour en ajouter.
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((tm) => (
            <TestimonialRow
              key={tm.id}
              testimonial={tm}
              coachId={coach.id}
              onEdit={() => handleEdit(tm)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Formulaire ─────────────────────────────────────────────
function TestimonialForm({
  coachId,
  testimonial,
  onCancel,
  onSaved
}: {
  coachId: string;
  testimonial: any | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveTestimonial, null);
  const isEdit = !!testimonial;
  const [photoUrl, setPhotoUrl] = useState<string>(
    testimonial?.author_photo_url ?? ''
  );

  useEffect(() => {
    if (state?.ok) onSaved();
  }, [state?.ok, onSaved]);

  return (
    <div className="overflow-hidden rounded-xl border border-resa-navy/20 bg-white shadow-resa-lg">
      <div className="border-b border-black/5 bg-gradient-to-r from-resa-navy/5 to-transparent px-5 py-3">
        <h2 className="text-sm font-bold text-resa-navy">
          {isEdit ? 'Modifier le témoignage' : 'Nouveau témoignage'}
        </h2>
      </div>

      <form action={formAction} className="space-y-4 p-5">
        <input type="hidden" name="coach_id" value={coachId} />
        {isEdit && <input type="hidden" name="id" value={testimonial.id} />}
        <input type="hidden" name="author_photo_url" value={photoUrl} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nom de l'auteur"
            name="author_name"
            defaultValue={testimonial?.author_name}
            required
            placeholder="Ex : Mme Kouassi"
          />
          <Field
            label="Rôle / qualité (FR)"
            name="author_role_fr"
            defaultValue={testimonial?.author_role_fr}
            placeholder="Parent de joueur U9"
          />
        </div>

        <Field
          label="Role (EN)"
          name="author_role_en"
          defaultValue={testimonial?.author_role_en}
          placeholder="Parent of U9 player"
        />

        <Field
          label="Témoignage (FR)"
          name="content_fr"
          defaultValue={testimonial?.content_fr}
          as="textarea"
          rows={4}
          required
          placeholder="Ce que dit le parent…"
        />

        <Field
          label="Testimonial (EN)"
          name="content_en"
          defaultValue={testimonial?.content_en}
          as="textarea"
          rows={4}
          placeholder="What the parent says…"
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
              Note (étoiles)
            </label>
            <select
              name="rating"
              defaultValue={testimonial?.rating?.toString() ?? '5'}
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy outline-none focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
            >
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★ (4)</option>
              <option value="3">★★★ (3)</option>
              <option value="2">★★ (2)</option>
              <option value="1">★ (1)</option>
            </select>
          </div>

          <Field
            label="Ordre d'affichage"
            name="display_order"
            type="number"
            defaultValue={testimonial?.display_order?.toString() ?? '100'}
          />

          <div className="flex flex-col justify-end gap-2">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-resa-navy">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={testimonial?.is_featured ?? false}
                className="h-4 w-4 rounded border-black/20 text-amber-500 focus:ring-amber-500/30"
              />
              En vedette
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-resa-navy">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={testimonial ? testimonial.is_active : true}
                className="h-4 w-4 rounded border-black/20 text-resa-red focus:ring-resa-red/30"
              />
              Actif
            </label>
          </div>
        </div>

        <ImageUpload
          label="Photo de l'auteur (optionnel)"
          value={photoUrl}
          onChange={setPhotoUrl}
          folder="coaches/testimonials"
          aspect="1/1"
          hint="Carré recommandé. Si absente, une initiale sera affichée."
        />

        {state?.error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-black/5 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Ligne témoignage ───────────────────────────────────────
function TestimonialRow({
  testimonial,
  coachId,
  onEdit
}: {
  testimonial: any;
  coachId: string;
  onEdit: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTestimonial(testimonial.id, coachId);
    } catch {
      alert('Erreur lors de la suppression');
      setLoading(false);
      setConfirming(false);
    }
  };

  return (
    <article className="rounded-xl border border-black/5 bg-white p-5 shadow-resa">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-resa-navy">
              {testimonial.author_name}
            </h3>
            {testimonial.author_role_fr && (
              <span className="text-[10px] uppercase tracking-wider text-resa-text/50">
                · {testimonial.author_role_fr}
              </span>
            )}
            {testimonial.is_featured && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                ★ Vedette
              </span>
            )}
            {!testimonial.is_active && (
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gray-600">
                Inactif
              </span>
            )}
            {testimonial.rating && (
              <span className="text-amber-500">
                {'★'.repeat(testimonial.rating)}
              </span>
            )}
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-resa-text/70">
            &ldquo;{testimonial.content_fr}&rdquo;
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => toggleTestimonialFeatured(testimonial.id, testimonial.is_featured, coachId)}
            className={`text-lg transition ${
              testimonial.is_featured
                ? 'text-amber-500 hover:scale-110'
                : 'text-gray-300 hover:text-amber-400'
            }`}
            title="Basculer en vedette"
          >
            {testimonial.is_featured ? '★' : '☆'}
          </button>

          <button
            onClick={onEdit}
            className="rounded-lg border border-black/5 bg-white px-3 py-1.5 text-[11px] font-bold text-resa-navy transition hover:border-resa-navy/20 hover:bg-resa-gray"
          >
            Modifier
          </button>

          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg border border-black/5 bg-white px-3 py-1.5 text-[11px] font-bold text-red-600 transition hover:border-red-200 hover:bg-red-50"
            >
              Suppr.
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="rounded-lg bg-red-600 px-2.5 py-1.5 text-[10px] font-bold uppercase text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? '…' : 'OK'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                disabled={loading}
                className="rounded-lg border border-black/5 bg-white px-2 py-1.5 text-[10px] font-bold text-resa-text/60 transition hover:bg-resa-gray"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ─── Champ générique ────────────────────────────────────────
function Field({
  label, name, defaultValue, type = 'text', required = false,
  placeholder, as = 'input', rows = 3
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
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
    </div>
  );
}