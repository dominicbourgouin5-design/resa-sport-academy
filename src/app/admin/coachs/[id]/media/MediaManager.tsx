'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { saveMedia, deleteMedia } from './actions';
import ImageUpload from '@/components/admin/ImageUpload';

export default function MediaManager({
  coach,
  media
}: {
  coach: { id: string; name: string; slug: string };
  media: any[];
}) {
  const [editing, setEditing] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const openForm = (item: any | null) => {
    setEditing(item);
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const closeForm = () => {
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div className="mx-auto max-w-6xl">

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
        <span className="font-bold text-resa-navy">Médias</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Médias
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            {media.length} média(s) · Photos et vidéos pour {coach.name}
          </p>
        </div>
        <button
          onClick={() => openForm(null)}
          className="inline-flex items-center gap-2 rounded-full bg-resa-red px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700"
        >
          + Nouveau média
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div ref={formRef} className="mb-6">
          <MediaForm
            coachId={coach.id}
            item={editing}
            onCancel={closeForm}
            onSaved={closeForm}
          />
        </div>
      )}

      {/* Grille médias */}
      {media.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 p-12 text-center text-resa-text/50">
          Aucun média. Cliquez sur <strong>+ Nouveau média</strong> pour en ajouter.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((m) => (
            <MediaCard
              key={m.id}
              item={m}
              coachId={coach.id}
              onEdit={() => openForm(m)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Carte média ────────────────────────────────────────────
function MediaCard({
  item,
  coachId,
  onEdit
}: {
  item: any;
  coachId: string;
  onEdit: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteMedia(item.id, coachId);
    } catch {
      alert('Erreur lors de la suppression');
      setLoading(false);
      setConfirming(false);
    }
  };

  const isVideo = item.media_type === 'video';

  return (
    <article className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa">
      {/* Aperçu */}
      <div className="relative aspect-[4/3] overflow-hidden bg-resa-navy">
        {isVideo ? (
          <div className="relative h-full w-full">
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt=""
                className="h-full w-full object-cover opacity-70"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-resa-navy to-resa-royal" />
            )}
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-resa-red text-xl text-white shadow-resa">
                ▶
              </div>
            </div>
          </div>
        ) : (
          <img src={item.url} alt="" className="h-full w-full object-cover" />
        )}

        <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
          {isVideo ? '🎥 Vidéo' : '📷 Photo'}
        </div>

        {!item.is_active && (
          <div className="absolute right-3 top-3 rounded-full bg-gray-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600">
            Inactif
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="p-4">
        {item.caption_fr && (
          <p className="line-clamp-2 text-sm font-semibold text-resa-navy">
            {item.caption_fr}
          </p>
        )}
        <div className="mt-1 text-[10px] uppercase tracking-wider text-resa-text/40">
          Ordre : {item.display_order}
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
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

// ─── Formulaire média ───────────────────────────────────────
function MediaForm({
  coachId,
  item,
  onCancel,
  onSaved
}: {
  coachId: string;
  item: any | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, formAction, pending] = useActionState(saveMedia, null);
  const isEdit = !!item;

  const [mediaType, setMediaType] = useState<'photo' | 'video'>(
    item?.media_type ?? 'photo'
  );
  const [url, setUrl] = useState<string>(item?.url ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    item?.thumbnail_url ?? ''
  );

  useEffect(() => {
    if (state?.ok) onSaved();
  }, [state?.ok, onSaved]);

  return (
    <div className="overflow-hidden rounded-xl border border-resa-navy/20 bg-white shadow-resa-lg">
      <div className="border-b border-black/5 bg-gradient-to-r from-resa-navy/5 to-transparent px-5 py-3">
        <h2 className="text-sm font-bold text-resa-navy">
          {isEdit ? 'Modifier le média' : 'Nouveau média'}
        </h2>
      </div>

      <form action={formAction} className="space-y-4 p-5">
        <input type="hidden" name="coach_id" value={coachId} />
        {isEdit && <input type="hidden" name="id" value={item.id} />}
        <input type="hidden" name="media_type" value={mediaType} />
        <input type="hidden" name="url" value={url} />
        <input type="hidden" name="thumbnail_url" value={thumbnailUrl} />

        {/* Type */}
        <div>
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
            Type de média
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { value: 'photo', label: '📷 Photo', desc: 'Image JPG/PNG/WebP' },
              { value: 'video', label: '🎥 Vidéo', desc: 'Lien YouTube / Vimeo' }
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMediaType(opt.value as 'photo' | 'video')}
                className={`rounded-lg border px-4 py-3 text-left transition ${
                  mediaType === opt.value
                    ? 'border-resa-red bg-resa-red/5'
                    : 'border-black/10 bg-white hover:bg-resa-gray/50'
                }`}
              >
                <div className="font-bold text-resa-navy">{opt.label}</div>
                <div className="mt-0.5 text-[10px] text-resa-text/50">
                  {opt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Photo → ImageUpload | Video → URL input */}
        {mediaType === 'photo' ? (
          <ImageUpload
            label="Image"
            value={url}
            onChange={setUrl}
            folder="coaches/media"
            aspect="16/9"
            hint="JPG, PNG ou WebP. 5 Mo max."
          />
        ) : (
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                URL de la vidéo
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/embed/xxxxx"
                className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
              />
              <div className="mt-1 text-[10px] text-resa-text/40">
                Utilisez le format <code>embed</code> YouTube : youtube.com/embed/ID
              </div>
            </div>

            <ImageUpload
              label="Miniature (optionnel)"
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
              folder="coaches/media"
              aspect="16/9"
              hint="Image affichée avant lecture."
            />
          </div>
        )}

        {/* Légendes */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Légende (FR)"
            name="caption_fr"
            defaultValue={item?.caption_fr}
            placeholder="Ex : Session 1-on-1 avec un U11"
          />
          <Field
            label="Caption (EN)"
            name="caption_en"
            defaultValue={item?.caption_en}
            placeholder="Ex: 1-on-1 session with a U11"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Ordre d'affichage"
            name="display_order"
            type="number"
            defaultValue={item?.display_order?.toString() ?? '100'}
          />
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-resa-navy">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={item ? item.is_active : true}
                className="h-4 w-4 rounded border-black/20 text-resa-red focus:ring-resa-red/30"
              />
              Média actif
            </label>
          </div>
        </div>

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
            disabled={pending || !url}
            className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Champ générique ────────────────────────────────────────
function Field({
  label, name, defaultValue, type = 'text', required = false, placeholder
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
        {label}
        {required && <span className="ml-1 text-resa-red">*</span>}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ''}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
      />
    </div>
  );
}