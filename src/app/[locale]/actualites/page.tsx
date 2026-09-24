import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import NewsHero from './NewsHero';
import { getNews } from '@/lib/queries';
import { cn } from '@/lib/utils';

export default async function NewsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = await params;
  const { type } = await searchParams;
  setRequestLocale(locale);

  const filter: 'all' | 'standard' | 'player' | 'coach' =
    type === 'player' || type === 'coach'
      ? type
      : type === 'standard'
      ? 'standard'
      : 'all';

  const news = await getNews(30, { storyType: filter });

  return <NewsContent news={news} locale={locale} filter={filter} />;
}

function NewsContent({
  news,
  locale,
  filter
}: {
  news: any[];
  locale: string;
  filter: 'all' | 'standard' | 'player' | 'coach';
}) {
  const t = useTranslations('news');
  const isFr = locale === 'fr';

  const byMonth: Record<string, any[]> = {};
  for (const n of news) {
    const d = n.published_at ? new Date(n.published_at) : null;
    const key = d
      ? d.toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', { month: 'long', year: 'numeric' })
      : 'Autres';
    (byMonth[key] ??= []).push(n);
  }
  const monthsOrder = Object.keys(byMonth);

  const tabs = [
    { value: 'all',      label: isFr ? 'Tous' : 'All' },
    { value: 'standard', label: isFr ? 'Actualités' : 'News' },
    { value: 'player',   label: '⚽ Player Stories' },
    { value: 'coach',    label: '🎓 Coach Stories' }
  ] as const;

  return (
    <>
      <NewsHero count={news.length} />

      {/* ─── FILTRES ─── */}
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={
                  (tab.value === 'all'
                    ? '/actualites'
                    : `/actualites?type=${tab.value}`) as any
                }
                className={cn(
                  'rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition',
                  filter === tab.value
                    ? 'bg-resa-navy text-white shadow-resa'
                    : 'border border-black/10 bg-white text-resa-text/60 hover:bg-resa-gray hover:text-resa-navy'
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LISTE ─── */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        {news.length === 0 ? (
          <p className="text-center text-resa-text/60">{t('noNews')}</p>
        ) : (
          <>
            <FeaturedArticle article={news[0]} locale={locale} t={t} />

            {monthsOrder.map((month) => {
              const items = byMonth[month].filter((n) => n.id !== news[0].id);
              if (items.length === 0) return null;

              return (
                <div key={month} className="mt-14">
                  <div className="mb-6 flex items-center gap-4">
                    <div className="h-1 w-10 bg-resa-red" />
                    <h2 className="font-display text-xl font-black uppercase tracking-wider text-resa-navy">
                      {month}
                    </h2>
                    <div className="text-xs font-bold uppercase tracking-widest text-resa-text/40">
                      {items.length} {items.length > 1 ? 'articles' : 'article'}
                    </div>
                    <div className="h-px flex-1 bg-black/5" />
                  </div>

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

// ─── Badge Story ────────────────────────────────────────────
function StoryBadge({ type }: { type: string }) {
  if (type === 'player') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-resa-royal px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow">
        ⚽ Player Story
      </span>
    );
  }
  if (type === 'coach') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow">
        🎓 Coach Story
      </span>
    );
  }
  return null;
}

// ─── Article vedette ────────────────────────────────────────
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
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-resa-navy via-resa-royal to-resa-navy lg:col-span-3 lg:aspect-auto lg:min-h-[380px]">
          <div className="absolute inset-0 bg-grid opacity-50" />
          <div className="absolute inset-0 bg-halo opacity-70" />
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-resa-red/20 blur-3xl anim-float" />

          <div className="absolute left-5 top-5 flex items-center gap-2">
            {article.story_type ? (
              <StoryBadge type={article.story_type} />
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-resa-red px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                {isFr ? 'À la une' : 'Featured'}
              </span>
            )}
          </div>

          <div className="absolute bottom-5 left-5 font-display text-7xl font-black leading-none text-white/15 md:text-9xl">
            01
          </div>
        </div>

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

// ─── Carte article ──────────────────────────────────────────
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
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-resa-navy to-resa-royal">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="pointer-events-none absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-resa-red/20 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-60" />

        {article.story_type && (
          <div className="absolute left-3 top-3">
            <StoryBadge type={article.story_type} />
          </div>
        )}

        <div className="absolute bottom-3 left-3 rounded-full bg-resa-red px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
          {dateStr}
        </div>
      </div>

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