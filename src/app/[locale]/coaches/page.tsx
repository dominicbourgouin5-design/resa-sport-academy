import { setRequestLocale } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import CoachesHero from './CoachesHero';
import { getCoaches } from '@/lib/queries';

export default async function CoachesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const coaches = await getCoaches();
  return <CoachesContent coaches={coaches} />;
}

function CoachesContent({ coaches }: { coaches: any[] }) {
  const t = useTranslations('coaches');
  const locale = useLocale();
  const isFr = locale === 'fr';

  return (
    <>
      <CoachesHero />

      {/* ─── GRILLE COACHS ─── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-20">
        <Reveal variant="right">
          <div className="mb-12 max-w-3xl">
            <div className="mb-3 h-1 w-14 bg-resa-red" />
            <h2 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
              {t('teamTitle')}
            </h2>
            <p className="mt-3 text-base text-resa-text/70">
              {t('teamSubtitle')}
            </p>
          </div>
        </Reveal>

        {coaches.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 p-12 text-center text-resa-text/50">
            {t('emptyList')}
          </div>
        ) : (
          <div className="-mx-3 flex flex-wrap">
            {coaches.map((c: any, i: number) => {
              const role = isFr ? c.role_fr : c.role_en;
              const specialties = (isFr ? c.specialties_fr : c.specialties_en) ?? [];
              const initials = c.initials ?? c.name.slice(0, 2).toUpperCase();
              // Fallback cascade : photo_url DB → image locale → initiales
              const photoSrc = c.photo_url ?? `/images/coaches/${c.slug}.jpg`;

              return (
                <div key={c.id} className="w-full px-3 pb-6 sm:w-1/2 lg:w-1/3">
                  <Reveal variant="up" delay={i * 80}>
                    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-500 hover:-translate-y-2 hover:shadow-resa-lg">
                      <div
                        className={`h-1.5 w-full ${
                          c.is_featured
                            ? 'bg-gradient-to-r from-amber-500 to-amber-700'
                            : 'bg-gradient-to-r from-resa-navy to-resa-royal'
                        }`}
                      />

                      {/* Photo header */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-resa-navy to-resa-royal">
                        {/* Fallback : initiales visibles si l'img ne charge pas */}
                        <div className="absolute inset-0 grid place-items-center font-display text-6xl font-black text-white/90">
                          {initials}
                        </div>

                        {/* Image (recouvre les initiales si elle charge) */}
                        <img
                          src={photoSrc}
                          alt={c.name}
                          className="relative h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />

                        {/* Overlay gradient bas pour lisibilité des badges */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-resa-navy/90 to-transparent" />

                        {/* Badge pays */}
                        {c.flag && (
                          <div className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
                            {c.flag}
                          </div>
                        )}

                        {/* Badge featured */}
                        {c.is_featured && (
                          <div className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-resa">
                            ★ {t('founderBadge')}
                          </div>
                        )}
                      </div>

                      {/* Contenu */}
                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="font-display text-xl font-black text-resa-navy transition-colors group-hover:text-resa-red">
                          {c.name}
                        </h3>
                        {role && (
                          <div className="mt-1 text-xs font-bold uppercase tracking-widest text-resa-red">
                            {role}
                          </div>
                        )}
                        {c.location && (
                          <div className="mt-2 text-xs text-resa-text/50">
                            📍 {c.location}
                          </div>
                        )}

                        {specialties.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {specialties.map((s: string) => (
                              <span
                                key={s}
                                className="rounded-full bg-resa-gray px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-resa-text/60"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-6 flex-1" />

                        <div className="flex flex-col gap-2">
                          <Link
                            href={`/coaches/${c.slug}` as any}
                            className="group/btn inline-flex items-center justify-center gap-2 rounded-full border border-resa-navy/15 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-resa-navy transition-all duration-300 hover:border-resa-navy hover:bg-resa-navy hover:text-white"
                          >
                            {t('viewProfile')}
                          </Link>
                          <Link
                            href={`/contact?coach=${c.slug}` as any}
                            className="group/btn inline-flex items-center justify-center gap-2 rounded-full bg-resa-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.03] hover:bg-resa-red"
                          >
                            {t('bookThisCoach')}
                            <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  </Reveal>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── REJOINDRE L'ÉQUIPE ─── */}
      <section className="bg-resa-gray py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 md:px-6">
          <Reveal variant="up">
            <article className="relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl bg-white p-10 text-center shadow-resa-lg md:flex-row md:p-14 md:text-left">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-resa-red/5" />
              <div className="relative grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-resa-red to-red-800 text-5xl text-white shadow-resa">
                🎓
              </div>
              <div className="relative flex-1">
                <h3 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
                  {t('joinTeamTitle')}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-resa-text/70">
                  {t('joinTeamText')}
                </p>
              </div>
              <Link
                href="/contact"
                className="group relative inline-flex items-center gap-2 rounded-full bg-resa-navy px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.04] hover:bg-resa-red"
              >
                {t('joinTeamCta')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="relative overflow-hidden bg-fade-navy py-16 text-white md:py-20">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-resa-red/10 blur-3xl anim-float" />
        <div className="relative mx-auto max-w-4xl px-4 text-center md:px-6">
          <Reveal variant="zoom">
            <h2 className="font-display text-3xl font-black md:text-5xl">
              {t('ctaTitle')}
            </h2>
          </Reveal>
          <Reveal variant="up" delay={120}>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/70 md:text-lg">
              {t('ctaText')}
            </p>
          </Reveal>
          <Reveal variant="up" delay={240}>
            <div className="mt-10">
              <Link
                href="/private-training"
                className="group inline-flex items-center gap-2 rounded-full bg-resa-red px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition-all duration-300 hover:bg-red-700 hover:scale-[1.03]"
              >
                {t('ctaBook')}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}