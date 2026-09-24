import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import SponsorsHero from './SponsorsHero';
import { getSponsors } from '@/lib/queries';

export default async function SponsorsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sponsors = await getSponsors();
  return <SponsorsContent sponsors={sponsors} locale={locale} />;
}

function SponsorsContent({ sponsors, locale }: { sponsors: any[]; locale: string }) {
  const t = useTranslations('sponsors');
  const isFr = locale === 'fr';

  const tierLabels: Record<string, string> = {
    platinum: t('tierPlatinum'),
    gold: t('tierGold'),
    silver: t('tierSilver'),
    official: t('tierOfficial')
  };

  const tierColors: Record<string, string> = {
    platinum: 'from-slate-700 to-slate-900',
    gold: 'from-amber-500 to-amber-700',
    silver: 'from-gray-400 to-gray-600',
    official: 'from-resa-navy to-resa-royal'
  };

  const tiersOrder = ['platinum', 'gold', 'silver', 'official'];
  const grouped: Record<string, any[]> = {};
  for (const tier of tiersOrder) {
    grouped[tier] = sponsors.filter((s) => s.tier === tier);
  }

  return (
    <>
      {/* ─── HERO ─── */}
      <SponsorsHero count={sponsors.length} />

      {/* ─── SPONSORS GROUPÉS PAR NIVEAU ─── */}
      {tiersOrder.map((tier) => {
        const list = grouped[tier];
        if (!list || list.length === 0) return null;

        const tierLabel = tierLabels[tier] ?? tier;
        const isPremium = tier === 'platinum' || tier === 'gold';
        const colsClass =
          tier === 'platinum' ? 'sm:w-1/2' :
          tier === 'gold'     ? 'sm:w-1/2 lg:w-1/3' :
                                'sm:w-1/2 lg:w-1/3 xl:w-1/4';

        return (
          <section
            key={tier}
            className={tier === 'platinum' || tier === 'silver' ? 'bg-resa-gray' : 'bg-white'}
          >
            <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
              <div className="mb-10 flex items-center gap-4">
                <div className={`h-1 w-12 bg-linear-to-r ${tierColors[tier]}`} />
                <div>
                  <h2 className={`font-display font-black text-resa-navy ${
                    isPremium ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
                  }`}>
                    {tierLabel}
                  </h2>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
                    {list.length}{' '}
                    {isFr
                      ? list.length > 1 ? 'partenaires' : 'partenaire'
                      : list.length > 1 ? 'partners' : 'partner'}
                  </div>
                </div>
              </div>

              <div className="-mx-3 flex flex-wrap">
                {list.map((s) => (
                  <div key={s.id} className={`w-full px-3 pb-6 ${colsClass}`}>
                    <SponsorCard
                      sponsor={s}
                      tierColor={tierColors[tier]}
                      isPremium={isPremium}
                      isFr={isFr}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* ─── CTA DEVENIR PARTENAIRE ─── */}
      <section className="relative overflow-hidden bg-fade-navy py-14 text-white md:py-20">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-resa-red/10 blur-3xl anim-float" />
        <div className="relative mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="font-display text-3xl font-black md:text-5xl">
            {t('become')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/75 md:text-lg">
            {t('becomeText')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/inscriptions"
              className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:bg-red-700 hover:scale-[1.04]"
            >
              {t('contactUs')}
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Card sponsor (avec lien vers page dédiée)
// ═══════════════════════════════════════════════════════════
function SponsorCard({
  sponsor,
  tierColor,
  isPremium,
  isFr
}: {
  sponsor: any;
  tierColor: string;
  isPremium: boolean;
  isFr: boolean;
}) {
  const logoSize = isPremium ? 'h-20 w-20' : 'h-16 w-16';
  const nameSize = isPremium ? 'text-xl md:text-2xl' : 'text-lg';

  return (
    <Link
      href={`/sponsors/${sponsor.slug}` as any}
      className="group block h-full"
    >
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-300 hover:-translate-y-1 hover:shadow-resa-lg">
        <div className={`h-1 w-full bg-linear-to-r ${tierColor}`} />

        <div className="flex flex-1 flex-col p-6">
          {/* Logo (image ou fallback initiale) */}
          {sponsor.logo_url ? (
            <div
              className={`mb-5 flex shrink-0 items-center justify-center rounded-xl border border-black/5 bg-white shadow-resa transition-transform duration-300 group-hover:scale-105 ${logoSize}`}
            >
              <img
                src={sponsor.logo_url}
                alt={sponsor.name}
                className="h-full w-full rounded-xl object-contain p-2"
              />
            </div>
          ) : (
            <div
              className={`mb-5 grid shrink-0 place-items-center rounded-xl bg-linear-to-br from-resa-navy to-resa-royal font-display font-black text-white shadow-resa transition-transform duration-300 group-hover:scale-105 ${logoSize} ${isPremium ? 'text-3xl' : 'text-2xl'}`}
            >
              {sponsor.name.charAt(0).toUpperCase()}
            </div>
          )}

          <h3 className={`font-display font-black leading-tight text-resa-navy transition-colors duration-300 group-hover:text-resa-red ${nameSize}`}>
            {sponsor.name}
          </h3>

          <p className="mt-3 flex-1 text-sm text-resa-text/65">
            {isFr
              ? sponsor.description_fr
              : sponsor.description_en || sponsor.description_fr}
          </p>

          {/* Indicateur "voir plus" */}
          <div className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-resa-royal transition-colors group-hover:text-resa-red">
            {isFr ? 'Voir le partenaire' : 'View partner'}
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </div>
        </div>
      </article>
    </Link>
  );
}