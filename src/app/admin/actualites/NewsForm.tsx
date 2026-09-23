'use client';

import { useActionState, useState, useMemo } from 'react';
import ImageUpload from '@/components/admin/ImageUpload';
import RichEditor from '@/components/admin/RichEditor';
import Link from 'next/link';
import { saveNews } from './actions';
import { cn } from '@/lib/utils';

type Lang = 'fr' | 'en';

export default function NewsForm({ article }: { article?: any }) {
  const [state, formAction, pending] = useActionState(saveNews, null);
  const isEdit = !!article;

  const [lang, setLang] = useState<Lang>('fr');
  const [previewOpen, setPreviewOpen] = useState(false);

  // Champs contrôlés pour le preview live
  const [slug, setSlug] = useState(article?.slug ?? '');
  const [titleFr, setTitleFr] = useState(article?.title_fr ?? '');
  const [titleEn, setTitleEn] = useState(article?.title_en ?? '');
  const [excerptFr, setExcerptFr] = useState(article?.excerpt_fr ?? '');
  const [excerptEn, setExcerptEn] = useState(article?.excerpt_en ?? '');
  const [bodyFr, setBodyFr] = useState(article?.body_fr ?? '');
  const [bodyEn, setBodyEn] = useState(article?.body_en ?? '');
  const [coverImage, setCoverImage] = useState(article?.cover_image_url ?? '');
  const [isPublished, setIsPublished] = useState(article?.is_published ?? false);

  const autoSlug = (v: string) =>
    v.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  const handleTitleFrChange = (v: string) => {
    setTitleFr(v);
    if (!isEdit && (!slug || slug === autoSlug(titleFr))) {
      setSlug(autoSlug(v));
    }
  };

  // Valeurs actuelles selon la langue active dans le preview
  const previewTitle = lang === 'fr' ? titleFr : (titleEn || titleFr);
  const previewExcerpt = lang === 'fr' ? excerptFr : (excerptEn || excerptFr);
  const previewBody = lang === 'fr' ? bodyFr : (bodyEn || bodyFr);

  return (
    <div className="mx-auto max-w-[1400px]">

      {/* Fil d'ariane + bouton aperçu mobile */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] text-resa-text/50">
          <Link href="/admin/actualites" className="hover:text-resa-red">
            Actualités
          </Link>
          <span className="mx-2">/</span>
          <span className="font-bold text-resa-navy">
            {isEdit ? 'Modifier' : 'Nouvel article'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setPreviewOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-3 py-1.5 text-[11px] font-bold text-resa-navy shadow-sm transition hover:bg-resa-gray xl:hidden"
        >
          <span>👁️</span>
          {previewOpen ? 'Fermer l\'aperçu' : 'Voir l\'aperçu'}
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-resa-navy">
          {isEdit ? 'Modifier l\'article' : 'Nouvel article'}
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          L'aperçu se met à jour au fur et à mesure que vous écrivez.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_480px]">

        {/* ─── Colonne formulaire ─── */}
        <form action={formAction} className="space-y-6">
          {isEdit && <input type="hidden" name="id" value={article.id} />}

          {/* Sélecteur de langue */}
          <div className="inline-flex rounded-full border border-black/5 bg-resa-gray p-1">
            {(['fr', 'en'] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition',
                  lang === l
                    ? 'bg-white text-resa-navy shadow-sm'
                    : 'text-resa-text/50 hover:text-resa-navy'
                )}
              >
                {l === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
              </button>
            ))}
          </div>

          {lang === 'en' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
              💡 <strong>Optionnel</strong> — Si vous laissez les champs EN vides, la version FR sera affichée aux visiteurs anglophones.
            </div>
          )}

          {/* Section 1 : Contenu */}
          <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
            <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-navy/5 to-transparent px-5 py-3">
              <div className="h-4 w-1 rounded-full bg-resa-navy" />
              <h2 className="text-sm font-bold text-resa-navy">
                Contenu {lang === 'fr' ? 'principal' : 'anglais'}
              </h2>
            </header>

            <div className="space-y-4 p-5">
              {lang === 'fr' ? (
                <>
                  <Field
                    label="Titre"
                    name="title_fr"
                    value={titleFr}
                    onChange={handleTitleFrChange}
                    required
                    placeholder="Ex : Lancement officiel de la saison 2027"
                  />

                  <Field
                    label="Chapô (résumé)"
                    name="excerpt_fr"
                    value={excerptFr}
                    onChange={setExcerptFr}
                    as="textarea"
                    rows={2}
                    placeholder="Résumé court affiché sur la liste des actualités."
                    hint="2 lignes maximum recommandé — c'est ce qui attire le lecteur."
                  />

                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                      Corps de l'article <span className="ml-1 text-resa-red">*</span>
                    </label>
                    <RichEditor
                      value={bodyFr}
                      onChange={setBodyFr}
                      placeholder="Rédigez votre article ici. Utilisez la barre d'outils pour mettre en forme…"
                    />
                    <input type="hidden" name="body_fr" value={bodyFr} />
                    <div className="mt-1 text-[10px] text-resa-text/40">
                      Vous pouvez utiliser <strong>Gras</strong>, <em>italique</em>, titres, listes, citations et liens.
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Field
                    label="Titre (EN)"
                    name="title_en"
                    value={titleEn}
                    onChange={setTitleEn}
                    placeholder="Ex : Official launch of the 2027 season"
                  />

                  <Field
                    label="Chapô (EN)"
                    name="excerpt_en"
                    value={excerptEn}
                    onChange={setExcerptEn}
                    as="textarea"
                    rows={2}
                  />

                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-resa-text/60">
                      Corps (EN)
                    </label>
                    <RichEditor
                      value={bodyEn}
                      onChange={setBodyEn}
                      placeholder="Write the article here…"
                    />
                    <input type="hidden" name="body_en" value={bodyEn} />
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Section 2 : Publication */}
          <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
            <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-resa-royal/5 to-transparent px-5 py-3">
              <div className="h-4 w-1 rounded-full bg-resa-royal" />
              <h2 className="text-sm font-bold text-resa-navy">Publication</h2>
            </header>

            <div className="space-y-4 p-5">
              <Field
                label="Slug (URL)"
                name="slug"
                value={slug}
                onChange={setSlug}
                required
                placeholder="lancement-saison-2027"
                hint={`URL publique : /actualites/${slug || 'mon-article'}`}
              />

              <ImageUpload
                label="Image de couverture"
                value={coverImage}
                onChange={setCoverImage}
                folder="covers"
                aspect="16/9"
                hint="Recommandé : 1600×900 px minimum. Format paysage."
              />

              <input type="hidden" name="cover_image_url" value={coverImage} />
            </div>
          </section>

          {/* Section 3 : Statut */}
          <section className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
            <header className="flex items-center gap-3 border-b border-black/5 bg-gradient-to-r from-emerald-500/5 to-transparent px-5 py-3">
              <div className="h-4 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold text-resa-navy">Statut</h2>
            </header>
            <div className="p-5">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-black/20 text-resa-red focus:ring-resa-red/30"
                />
                <div>
                  <div className="text-[13px] font-semibold text-resa-navy">
                    Publier l'article
                  </div>
                  <div className="text-[11px] text-resa-text/50">
                    Un article non publié reste en brouillon (visible uniquement dans l'admin).
                  </div>
                </div>
              </label>
            </div>
          </section>

          {/* Erreur / Succès */}
          {state?.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          {state?.ok && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              ✓ Article enregistré
            </div>
          )}

          {/* Actions sticky */}
          <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 bg-white/95 p-3 shadow-lg backdrop-blur">
            <Link
              href="/admin/actualites"
              className="rounded-full border border-black/5 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-text/60 transition hover:bg-resa-gray"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-resa-red px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700 disabled:opacity-60"
            >
              {pending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer l\'article'}
            </button>
          </div>
        </form>

        {/* ─── Colonne aperçu ─── */}
        <aside
          className={cn(
            'xl:sticky xl:top-4 xl:block xl:h-fit',
            previewOpen ? 'block' : 'hidden xl:block'
          )}
        >
          <Preview
            title={previewTitle}
            excerpt={previewExcerpt}
            body={previewBody}
            slug={slug}
            lang={lang}
            isPublished={isPublished}
            coverImage={coverImage}
          />
        </aside>
      </div>
    </div>
  );
}

// ─── Aperçu type "navigateur" ───────────────────────────────
function Preview({
  title, excerpt, body, slug, lang, isPublished, coverImage
}: {
  title: string;
  excerpt: string;
  body: string;
  slug: string;
  lang: Lang;
  isPublished: boolean;
  coverImage: string;
}) {
  // Détecte si le contenu est du HTML (Tiptap) ou du texte brut (ancien format)
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(body ?? '');
  const htmlContent = useMemo(() => {
    if (!body) return '';
    if (isHtml) return body;
    // Compatibilité : ancien format avec \n\n
    return body
      .split(/\n\n+/)
      .filter((p) => p.trim())
      .map((p) => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`)
      .join('');
  }, [body, isHtml]);

  const today = new Date().toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-lg">

      {/* Barre navigateur */}
      <div className="border-b border-black/5 bg-resa-gray/60 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-[10px] text-resa-text/50">
            resasportacademy.ci/{lang}/actualites/{slug || 'mon-article'}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center justify-between border-b border-black/5 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-resa-red">
            <span className="h-1.5 w-1.5 rounded-full bg-resa-red animate-pulse" />
            Aperçu en direct
          </span>
          <span className="text-[10px] uppercase tracking-widest text-resa-text/40">
            {lang === 'fr' ? 'Version FR' : 'EN version'}
          </span>
        </div>
        <div
          className={cn(
            'rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
            isPublished
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          )}
        >
          {isPublished ? 'Publié' : 'Brouillon'}
        </div>
      </div>

      {/* Contenu scrollable */}
      <div className="max-h-[calc(100vh-260px)] overflow-y-auto">

        {/* Hero */}
        <div className="relative overflow-hidden bg-resa-navy px-5 py-8 text-white">
          <div className="absolute inset-0 bg-grid opacity-40" />
          <div className="absolute inset-0 bg-halo" />
          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
              <span className="h-1 w-1 rounded-full bg-resa-red" />
              {today}
            </div>

            <h1 className="font-display text-xl font-black leading-tight tracking-tight md:text-2xl">
              {title || (
                <span className="italic text-white/30">
                  {lang === 'fr' ? 'Titre de l\'article…' : 'Article title…'}
                </span>
              )}
            </h1>

            {excerpt && (
              <p className="mt-3 text-[12px] leading-relaxed text-white/70">
                {excerpt}
              </p>
            )}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-0.5 gradient-line" />
        </div>

        {/* Couverture */}
        {coverImage && (
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={coverImage}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}

        {/* Corps */}
        <div className="px-5 py-6">
          {!htmlContent ? (
            <p className="text-[12px] italic text-resa-text/30">
              {lang === 'fr'
                ? 'Le contenu de l\'article apparaîtra ici au fur et à mesure de votre saisie.'
                : 'Article content will appear here as you type.'}
            </p>
          ) : (
            <>
              <div
                className="prose-article text-[13px] [&_h2]:text-lg [&_h3]:text-base"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-black/10" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-resa-text/30">
                  RESA Sport Academy
                </span>
                <div className="h-px flex-1 bg-black/10" />
              </div>

              <div className="rounded-full border border-black/10 bg-white py-2 text-center text-[10px] font-bold uppercase tracking-wider text-resa-navy">
                ← {lang === 'fr' ? 'Retour aux actualités' : 'Back to news'}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Champ générique ────────────────────────────────────────
function Field({
  label, name, value, onChange, type = 'text', required = false,
  placeholder, hint, as = 'input', rows = 3
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full resize-y rounded-lg border border-black/10 bg-white px-3 py-2.5 text-[13px] leading-relaxed text-resa-navy placeholder:text-resa-text/30 outline-none transition focus:border-resa-navy/40 focus:ring-2 focus:ring-resa-navy/10"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
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