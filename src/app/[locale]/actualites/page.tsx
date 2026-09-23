import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { getNews } from '@/lib/queries';

export default async function NewsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const news = await getNews(20);
  return <NewsContent news={news} locale={locale} />;
}

function NewsContent({ news, locale }: { news: any[]; locale: string }) {
  const t = useTranslations('news');
  const isFr = locale === 'fr';

  // Groupe par mois
  const byMonth: Record<string, any[]> = {};
  for (const n of news) {
    const d = n.published_at ? new Date(n.published_at) : null;
    const key = d
      ? d.toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', { month: 'long', year: 'numeric' })
      : 'Autres';
    (byMonth[key] ??= []).push(n);
  }

  const monthsOrder = Object.keys(byMonth);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-resa-navy text-white">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-halo" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <div className="max-w-3xl">
            <span className="mb-3 inline-block rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/85 backdrop-blur anim-fade-up">
              {news.length} {isFr ? 'articles publiés' : 'published articles'}
            </span>
            <h1 className="font-display text-4xl font-black leading-tight tracking-tight md:text-5xl anim-fade-up delay-100">
              {t('title')}
            </h1>
            <p className="mt-3 text-base text-white/70 md:text-lg anim-fade-up delay-200">
              {t('subtitle')}
            </p>
          </div>
        </div>
        <div className="h-1 gradient-line" />
      </section>

      {/* ─── LISTE ─── */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        {news.length === 0 ? (
          <p className="text-center text-resa-text/60">{t('noNews')}</p>
        ) : (
          <>
            {/* Article vedette */}
            <FeaturedArticle article={news[0]} locale={locale} t={t} />

            {/* Reste groupé par mois */}
            {monthsOrder.map((month, idx) => {
              const items = byMonth[month].filter((n) => n.id !== news[0].id);
              if (items.length === 0) return null;

              return (
                <div key={month} className="mt-14">
                  {/* En-tête mois */}
                  <div className="mb-6 flex items-center gap-4">
                    <div className="h-1 w-10 bg-resa-red" />
                    <h2 className="font-display text-xl font-black uppercase tracking-wider text-resa-navy">
                      {month}
                    </h2>
                    <div className="text-xs font-bold uppercase tracking-widest text-resa-text/40">
                      {items.length} {items.length > 1 ? (isFr ? 'articles' : 'articles') : (isFr ? 'article' : 'article')}
                    </div>
                    <div className="h-px flex-1 bg-black/5" />
                  </div>

                  {/* Grille */}
                  <div className="-mx-3 flex flex-wrap">
                    {items.map((n) => (
                      <div key={n.id} className="w-full px-3 pb-6 sm:w-1/2 lg:w-1/3">
                        <NewsCard article={n} locale={locale} t={t} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </section>
    </>
  );
}

// ─── Article vedette (grande carte) ─────────────────────────
function FeaturedArticle({
  article,
  locale,
  t
}: {
  article: any;
  locale: string;
  t: any;
}) {
  const isFr = locale === 'fr';
  const dateStr = article.published_at
    ? new Date(article.published_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : '';

  return (
    <Link
      href={`/actualites/${article.slug}`}
      className="group block overflow-hidden rounded-3xl border border-black/5 bg-white shadow-resa-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_32px_64px_rgba(10,31,68,.18)]"
    >
      <div className="grid gap-0 lg:grid-cols-5">
        {/* Visuel */}
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-resa-navy via-resa-royal to-resa-navy lg:col-span-3 lg:aspect-auto lg:min-h-[380px]">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="absolute inset-0 bg-halo opacity-70" />
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-resa-red/20 blur-3xl anim-float" />

          {/* Badge À la une */}
          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-resa-red px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            {isFr ? 'À la une' : 'Featured'}
          </div>

          {/* Gros numéro décoratif */}
          <div className="absolute bottom-5 left-5 font-display text-7xl font-black leading-none text-white/15 md:text-9xl">
            01
          </div>
        </div>

        {/* Contenu */}
        <div className="flex flex-col justify-center p-8 lg:col-span-2 lg:p-10">
          <div className="mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest">
            <span className="text-resa-red">{dateStr}</span>
          </div>

          <h2 className="font-display text-2xl font-black leading-tight text-resa-navy transition-colors duration-300 group-hover:text-resa-red md:text-3xl">
            {isFr ? article.title_fr : (article.title_en || article.title_fr)}
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-resa-text/70 md:text-base line-clamp-4">
            {isFr ? article.excerpt_fr : (article.excerpt_en || article.excerpt_fr)}
          </p>

          <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-resa-royal transition-colors duration-300 group-hover:text-resa-red">
            {t('readMore')}
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Carte article standard ─────────────────────────────────
function NewsCard({ article, locale, t }: { article: any; locale: string; t: any }) {
  const isFr = locale === 'fr';
  const dateStr = article.published_at
    ? new Date(article.published_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', {
        day: '2-digit', month: 'short'
      })
    : '';

  return (
    <Link
      href={`/actualites/${article.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-300 hover:-translate-y-1 hover:shadow-resa-lg"
    >
      {/* Visuel */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-resa-navy to-resa-royal">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="pointer-events-none absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-resa-red/20 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />

        <div className="absolute bottom-3 left-3 rounded-full bg-resa-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
          {dateStr}
        </div>
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-display text-base font-bold leading-tight text-resa-navy transition-colors duration-300 group-hover:text-resa-red line-clamp-2">
          {isFr ? article.title_fr : (article.title_en || article.title_fr)}
        </h2>
        <p className="mt-3 flex-1 text-sm text-resa-text/65 line-clamp-3">
          {isFr ? article.excerpt_fr : (article.excerpt_en || article.excerpt_fr)}
        </p>
        <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-resa-royal transition-colors group-hover:text-resa-red">
          {t('readMore')}
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}