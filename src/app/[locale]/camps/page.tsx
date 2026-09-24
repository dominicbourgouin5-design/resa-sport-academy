import { setRequestLocale } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import CampsHero from './CampsHero';
import { getCamps } from '@/lib/queries';

export default async function CampsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { locale } = await params;
  const { type } = await searchParams;
  setRequestLocale(locale);

  const filter: 'camp' | 'tryout' | 'all' =
    type === 'camp' || type === 'tryout' ? type : 'all';

  const camps = await getCamps({
    type: filter,
    onlyUpcoming: true
  });

  return <CampsContent camps={camps} locale={locale} filter={filter} />;
}

function CampsContent({
  camps,
  locale,
  filter
}: {
  camps: any[];
  locale: string;
  filter: 'camp' | 'tryout' | 'all';
}) {
  const t = useTranslations('campsHub');
  const isFr = locale === 'fr';

  const tabs = [
    { value: 'all',    label: isFr ? 'Tous' : 'All' },
    { value: 'camp',   label: isFr ? '🏕️ Camps' : '🏕️ Camps' },
    { value: 'tryout', label: isFr ? '🔍 Tryouts' : '🔍 Tryouts' }
  ] as const;

  return (
    <>
      <CampsHero />

      {/* Filtres */}
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 md:px-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={(tab.value === 'all' ? '/camps' : `/camps?type=${tab.value}`) as any}
                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                  filter === tab.value
                    ? 'bg-resa-navy text-white shadow-resa'
                    : 'border border-black/10 bg-white text-resa-text/60 hover:bg-resa-gray hover:text-resa-navy'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Liste */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
        {camps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 p-12 text-center">
            <div className="mb-3 text-5xl">📅</div>
            <h2 className="font-display text-xl font-black text-resa-navy">
              {isFr ? 'Aucun événement à venir' : 'No upcoming events'}
            </h2>
            <p className="mt-2 text-sm text-resa-text/60">
              {isFr
                ? 'Revenez bientôt pour découvrir nos prochains camps et tryouts.'
                : 'Check back soon to discover our upcoming camps and tryouts.'}
            </p>
          </div>
        ) : (
          <div className="-mx-3 flex flex-wrap">
            {camps.map((c, i) => (
              <div key={c.id} className="w-full px-3 pb-6 sm:w-1/2 lg:w-1/3">
                <Reveal variant="up" delay={i * 80}>
                  <CampCard camp={c} isFr={isFr} />
                </Reveal>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function CampCard({ camp, isFr }: { camp: any; isFr: boolean }) {
  const title = isFr ? camp.title_fr : camp.title_en;
  const desc = isFr ? camp.description_fr : camp.description_en;
  const price = isFr ? camp.price_fr : camp.price_en;
  const image = camp.image_url ?? '/images/programs/doors/training.jpg';

  const dateStart = new Date(camp.date_start).toLocaleDateString(
    isFr ? 'fr-FR' : 'en-GB',
    { day: '2-digit', month: 'short', year: 'numeric' }
  );
  const dateEnd =
    camp.date_end && camp.date_end !== camp.date_start
      ? new Date(camp.date_end).toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', {
          day: '2-digit',
          month: 'short'
        })
      : null;

  const statusBadge = {
    open: { label: isFr ? 'Ouvert' : 'Open', color: 'bg-emerald-500' },
    full: { label: isFr ? 'Complet' : 'Full', color: 'bg-amber-500' },
    closed: { label: isFr ? 'Clôturé' : 'Closed', color: 'bg-gray-500' },
    cancelled: { label: isFr ? 'Annulé' : 'Cancelled', color: 'bg-red-500' }
  }[camp.status as string] ?? { label: camp.status, color: 'bg-gray-500' };

  return (
    <Link href={`/camps/${camp.slug}` as any} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
        <div className="relative aspect-video overflow-hidden bg-resa-navy">
          <img
            src={image}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-resa-navy/90 via-transparent to-transparent" />

          {/* Type badge */}
          <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
            {camp.type === 'tryout' ? '🔍 Tryout' : '🏕️ Camp'}
          </div>

          {/* Status badge */}
          <div className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full ${statusBadge.color} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg`}>
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
            {statusBadge.label}
          </div>

          {/* Dates */}
          <div className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-resa-navy backdrop-blur">
            📅 {dateStart}
            {dateEnd && <span className="text-resa-text/50"> → {dateEnd}</span>}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-lg font-black text-resa-navy transition-colors group-hover:text-resa-red line-clamp-2">
            {title}
          </h3>
          {desc && (
            <p className="mt-2 flex-1 text-sm text-resa-text/65 line-clamp-2">
              {desc}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-resa-text/60">
            {camp.location && <span>📍 {camp.location}</span>}
            {camp.age_min && camp.age_max && (
              <span>👤 {camp.age_min}–{camp.age_max} ans</span>
            )}
            {camp.capacity && (
              <span>👥 {camp.capacity} places</span>
            )}
          </div>

          {price && (
            <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
              <div className="font-display text-lg font-black text-resa-red">
                {price}
              </div>
              <span className="text-xs font-bold uppercase tracking-wide text-resa-royal transition-transform group-hover:translate-x-1">
                {isFr ? 'Détails →' : 'Details →'}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}