import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getNewsBySlug } from '@/lib/queries';

export default async function NewsArticlePage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = await getNewsBySlug(slug);
  if (!article) notFound();
  return <ArticleContent article={article} locale={locale} />;
}

function ArticleContent({ article, locale }: { article: any; locale: string }) {
  const t = useTranslations('news');
  const isFr = locale === 'fr';

  const dateStr = article.published_at
    ? new Date(article.published_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : '';

  const title = isFr ? article.title_fr : (article.title_en || article.title_fr);
  const excerpt = isFr ? article.excerpt_fr : (article.excerpt_en || article.excerpt_fr);
  const body = isFr ? article.body_fr : (article.body_en || article.body_fr);

  // Détecte HTML (Tiptap) ou texte brut (ancien format) → convertit au besoin
  const isHtml = /<\/?[a-z][\s\S]*>/i.test(body ?? '');
  const htmlContent = isHtml
    ? (body ?? '')
    : (body ?? '')
        .split(/\n\n+/)
        .filter((p: string) => p.trim())
        .map((p: string) => `<p>${p.trim().replace(/\n/g, '<br/>')}</p>`)
        .join('');

  return (
    <>
      {/* ─── HERO ARTICLE ─── */}
      <section className="relative overflow-hidden bg-resa-navy text-white">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-halo" />
        <div className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-resa-red/10 blur-3xl anim-float" />

        <div className="relative mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-20">
          {/* Lien retour */}
          <Link
            href="/actualites"
            className="group mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:text-white"
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            {t('backToList')}
          </Link>

          {/* Date */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/85 backdrop-blur anim-fade-up">
            <span className="h-1.5 w-1.5 rounded-full bg-resa-red" />
            {dateStr}
          </div>

          {/* Titre */}
          <h1 className="font-display text-3xl font-black leading-[1.1] tracking-tight md:text-5xl anim-fade-up delay-100">
            {title}
          </h1>

          {/* Excerpt */}
          {excerpt && (
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/75 md:text-lg anim-fade-up delay-200">
              {excerpt}
            </p>
          )}
        </div>

        <div className="h-1 gradient-line" />
      </section>

      {/* ─── IMAGE DE COUVERTURE ─── */}
      {article.cover_image_url && (
        <section className="relative">
          <div className="mx-auto max-w-5xl px-4 md:px-6">
            <div className="-mt-8 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa-lg md:-mt-12">
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={article.cover_image_url}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── CORPS DE L'ARTICLE ─── */}
      <section className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        {!htmlContent ? (
          <p className="text-resa-text/60">{body}</p>
        ) : (
          <article
            className="prose-article has-drop-cap text-base md:text-[17px]"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}

        {/* Séparateur */}
        <div className="mt-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-black/10" />
          <span className="text-xs font-bold uppercase tracking-widest text-resa-text/40">
            RESA Sport Academy
          </span>
          <div className="h-px flex-1 bg-black/10" />
        </div>

        {/* Bouton retour */}
        <div className="mt-10 text-center">
          <Link
            href="/actualites"
            className="group inline-flex items-center gap-2 rounded-full border border-resa-navy/20 bg-white px-6 py-3 text-xs font-bold uppercase tracking-wider text-resa-navy shadow-resa transition-all duration-300 hover:bg-resa-navy hover:text-white"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            {t('backToList')}
          </Link>
        </div>
      </section>
    </>
  );
}