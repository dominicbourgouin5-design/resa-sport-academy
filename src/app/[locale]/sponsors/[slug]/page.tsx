import { setRequestLocale } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import { getSponsorBySlug, getSponsors } from '@/lib/queries';

export default async function SponsorDetailPage({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [sponsor, allSponsors] = await Promise.all([
    getSponsorBySlug(slug),
    getSponsors()
  ]);
  if (!sponsor) notFound();

  const sameTier = allSponsors
    .filter((s: any) => s.id !== sponsor.id && s.tier === sponsor.tier)
    .slice(0, 3);

  return (
    <SponsorDetail sponsor={sponsor} sameTier={sameTier} />
  );
}

function SponsorDetail({
  sponsor,
  sameTier
}: {
  sponsor: any;
  sameTier: any[];
}) {
  const t = useTranslations('sponsors');
  const locale = useLocale();
  const isFr = locale === 'fr';

  const name = sponsor.name;
  const sector = isFr ? sponsor.sector_fr : sponsor.sector_en;
  const desc = isFr
    ? sponsor.description_fr
    : sponsor.description_en || sponsor.description_fr;
  const longDesc = isFr
    ? sponsor.long_description_fr
    : sponsor.long_description_en || sponsor.long_description_fr;

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
  const tierLabel = tierLabels[sponsor.tier] ?? sponsor.tier;
  const tierColor = tierColors[sponsor.tier] ?? tierColors.official;

  const socials = [
    { key: 'social_linkedin',  url: sponsor.social_linkedin,  icon: 'in', label: 'LinkedIn' },
    { key: 'social_instagram', url: sponsor.social_instagram, icon: 'ig', label: 'Instagram' },
    { key: 'social_facebook',  url: sponsor.social_facebook,  icon: 'fb', label: 'Facebook' },
    { key: 'social_twitter',   url: sponsor.social_twitter,   icon: 'X',  label: 'Twitter / X' }
  ].filter((s) => !!s.url);

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-resa-navy text-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${tierColor} opacity-30`} />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-resa-red/10 blur-3xl anim-float" />

        <div className="relative mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-24">
          <div className="mb-6 text-[11px] text-white/50">
            <Link href="/sponsors" className="transition hover:text-white">
              ← {isFr ? 'Tous les partenaires' : 'All partners'}
            </Link>
          </div>

          <div className="flex flex-col items-center gap-8 md:flex-row md:items-center">
            {/* Logo */}
            <div className="grid h-32 w-32 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md md:h-40 md:w-40">
              {sponsor.logo_url ? (
                <img
                  src={sponsor.logo_url}
                  alt={name}
                  className="h-full w-full object-contain p-4"
                />
              ) : (
                <span className="font-display text-5xl font-black text-white">
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className={`mb-3 inline-block rounded-full bg-gradient-to-r ${tierColor} px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg`}>
                {tierLabel}
              </div>

              <h1 className="font-display text-4xl font-black leading-tight md:text-5xl">
                {name}
              </h1>

              {sector && (
                <div className="mt-3 text-sm font-bold uppercase tracking-widest text-white/60">
                  {sector}
                </div>
              )}

              {desc && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
                  {desc}
                </p>
              )}

              {sponsor.website_url && (
                <a
                  href={sponsor.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold uppercase tracking-wide text-resa-navy shadow-lg transition-all duration-300 hover:scale-[1.03] hover:bg-resa-red hover:text-white"
                >
                  {isFr ? 'Visiter le site' : 'Visit website'}
                  <span className="transition-transform group-hover:translate-x-0.5">↗</span>
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="h-1 gradient-line" />
      </section>

      {/* ═══ À PROPOS ═══ */}
      {longDesc && (
        <section className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
          <Reveal variant="up">
            <div className="mb-3 h-1 w-12 bg-resa-red" />
            <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
              {isFr ? 'À propos du partenaire' : 'About the partner'}
            </h2>
            <div
              className="prose-article mt-5 text-[15px] md:text-base"
              dangerouslySetInnerHTML={{ __html: longDesc }}
            />
          </Reveal>
        </section>
      )}

      {/* ═══ INFOS + SOCIALS ═══ */}
      <section className="bg-resa-gray py-14 md:py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {sponsor.since_year && (
              <Card icon="📅" label={isFr ? 'Partenaire depuis' : 'Partner since'}>
                <span className="font-semibold text-resa-navy">{sponsor.since_year}</span>
              </Card>
            )}
            {sector && (
              <Card icon="🏢" label={isFr ? 'Secteur' : 'Sector'}>
                <span className="font-semibold text-resa-navy">{sector}</span>
              </Card>
            )}
          </div>

          {socials.length > 0 && (
            <div className="mt-6">
              <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-resa-text/50">
                {isFr ? 'Réseaux sociaux' : 'Social media'}
              </div>
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold text-resa-navy transition hover:bg-resa-navy hover:text-white"
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-resa-navy text-[9px] font-black text-white">
                      {s.icon}
                    </span>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══ AUTRES PARTENAIRES DU MÊME TIER ═══ */}
      {sameTier.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-14 md:px-6 md:py-20">
          <Reveal variant="up">
            <div className="mb-8">
              <div className="mb-3 h-1 w-12 bg-resa-red" />
              <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
                {isFr ? 'Autres partenaires' : 'Other partners'}
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              {sameTier.map((s: any) => (
                <Link
                  key={s.id}
                  href={`/sponsors/${s.slug}` as any}
                  className="group block rounded-2xl border border-black/5 bg-white p-6 text-center shadow-resa transition-all duration-300 hover:-translate-y-1 hover:shadow-resa-lg"
                >
                  {s.logo_url ? (
                    <img
                      src={s.logo_url}
                      alt={s.name}
                      className="mx-auto h-16 w-16 rounded-xl object-contain"
                    />
                  ) : (
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-xl bg-gradient-to-br from-resa-navy to-resa-royal font-display text-2xl font-black text-white">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="mt-4 font-display text-base font-black text-resa-navy transition-colors group-hover:text-resa-red">
                    {s.name}
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden bg-fade-navy py-14 text-white md:py-20">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-resa-red/10 blur-3xl anim-float" />
        <div className="relative mx-auto max-w-3xl px-4 text-center md:px-6">
          <h2 className="font-display text-3xl font-black md:text-5xl">
            {isFr ? 'Devenir partenaire à votre tour' : 'Become a partner'}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/75 md:text-lg">
            {isFr
              ? 'Associez votre marque à un projet sportif et éducatif à fort impact.'
              : 'Associate your brand with a high-impact sports and educational project.'}
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:bg-red-700 hover:scale-[1.04]"
            >
              {isFr ? 'Nous contacter' : 'Contact us'}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function Card({
  icon,
  label,
  children
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-white p-4 shadow-resa">
      <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-resa-text/50">
        <span>{icon}</span>
        {label}
      </div>
      <div className="text-sm">{children}</div>
    </div>
  );
}