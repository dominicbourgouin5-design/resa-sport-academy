import { setRequestLocale } from 'next-intl/server';
import { useLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import Reveal from '@/components/ui/Reveal';
import { getCampBySlug } from '@/lib/queries';
import { createAdminClient } from '@/lib/supabase/admin';
import CampRegistrationForm from '@/components/CampRegistrationForm';

export default async function CampDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ rebook?: string }>;
}) {
  const { locale, slug } = await params;
  const { rebook } = await searchParams;
  setRequestLocale(locale);
  const camp = await getCampBySlug(slug);
  if (!camp) notFound();

  // ─── Rebook : récupère l'inscription existante pour pré-remplir le formulaire
  let initialValues: Record<string, string> | null = null;
  if (rebook) {
    try {
      const supabase = createAdminClient();
      const { data: reg } = await supabase
        .from('camp_registrations')
        .select('parent_name, parent_email, parent_phone, player_name, player_age, player_birth_date, notes')
        .eq('id', rebook)
        .eq('camp_id', camp.id)
        .maybeSingle();

      if (reg) {
        initialValues = {
          parent_name: reg.parent_name ?? '',
          parent_email: reg.parent_email ?? '',
          parent_phone: reg.parent_phone ?? '',
          player_name: reg.player_name ?? '',
          player_age: reg.player_age ? String(reg.player_age) : '',
          player_birth_date: reg.player_birth_date ?? '',
          notes: reg.notes ?? ''
        };
      }
    } catch (err) {
      console.warn('[CampDetailPage] rebook lookup failed:', err);
    }
  }

  return <CampDetail camp={camp} initialValues={initialValues} />;
}

function CampDetail({
  camp,
  initialValues
}: {
  camp: any;
  initialValues: Record<string, string> | null;
}) {
  const locale = useLocale();
  const isFr = locale === 'fr';

  const title = isFr ? camp.title_fr : camp.title_en;
  const desc = isFr ? camp.description_fr : camp.description_en;
  const longDesc = isFr ? camp.long_description_fr : camp.long_description_en;
  const price = isFr ? camp.price_fr : camp.price_en;
  const image = camp.image_url ?? '/images/programs/doors/training.jpg';

  const dateStart = new Date(camp.date_start).toLocaleDateString(
    isFr ? 'fr-FR' : 'en-GB',
    { day: '2-digit', month: 'long', year: 'numeric' }
  );
  const dateEnd =
    camp.date_end && camp.date_end !== camp.date_start
      ? new Date(camp.date_end).toLocaleDateString(isFr ? 'fr-FR' : 'en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric'
        })
      : null;

  const statusInfo = {
    open: { label: isFr ? 'Inscriptions ouvertes' : 'Registration open', color: 'bg-emerald-500' },
    full: { label: isFr ? 'Complet' : 'Full', color: 'bg-amber-500' },
    closed: { label: isFr ? 'Clôturé' : 'Closed', color: 'bg-gray-500' },
    cancelled: { label: isFr ? 'Annulé' : 'Cancelled', color: 'bg-red-500' }
  }[camp.status as string] ?? { label: camp.status, color: 'bg-gray-500' };

  const facts = [
    { icon: '📅', label: isFr ? 'Date' : 'Date', value: dateStart + (dateEnd ? ` → ${dateEnd}` : '') },
    camp.time_start && {
      icon: '🕒',
      label: isFr ? 'Horaires' : 'Hours',
      value: `${camp.time_start}${camp.time_end ? ` – ${camp.time_end}` : ''}`
    },
    camp.location && { icon: '📍', label: isFr ? 'Lieu' : 'Location', value: camp.location },
    camp.age_min && camp.age_max && {
      icon: '👤',
      label: isFr ? 'Âge' : 'Age',
      value: `${camp.age_min} – ${camp.age_max} ${isFr ? 'ans' : 'years'}`
    },
    camp.capacity && { icon: '👥', label: isFr ? 'Places' : 'Spots', value: `${camp.capacity}` },
    price && { icon: '💰', label: isFr ? 'Tarif' : 'Price', value: price, highlight: true }
  ].filter(Boolean) as { icon: string; label: string; value: string; highlight?: boolean }[];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-resa-navy text-white">
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-resa-navy via-resa-navy/85 to-resa-navy/40" />
        <div className="absolute inset-0 bg-grid opacity-15" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="mb-6 text-[11px] text-white/50">
            <Link href="/camps" className="transition hover:text-white">
              ← {isFr ? 'Tous les camps' : 'All camps'}
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur">
              {camp.type === 'tryout' ? '🔍 Tryout' : '🏕️ Camp'}
            </span>
            <span className={`inline-flex items-center gap-1.5 rounded-full ${statusInfo.color} px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white`}>
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              {statusInfo.label}
            </span>
          </div>

          <h1 className="mt-4 font-display text-4xl font-black leading-tight md:text-5xl lg:text-6xl">
            {title}
          </h1>

          {desc && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
              {desc}
            </p>
          )}
        </div>
        <div className="h-1 gradient-line" />
      </section>

      {/* QUICK FACTS */}
      {facts.length > 0 && (
        <section className="border-b border-black/5 bg-white">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
              {facts.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 py-4 md:border-l md:border-black/5 md:pl-4 md:first:border-l-0">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-resa-gray text-base">
                    {f.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-resa-text/45">
                      {f.label}
                    </div>
                    <div className={`mt-0.5 truncate text-[12px] font-bold ${f.highlight ? 'text-resa-red' : 'text-resa-navy'}`}>
                      {f.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CONTENU + INSCRIPTION */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-12">
          {/* Colonne gauche : description */}
          <div>
            {longDesc && (
              <Reveal variant="up">
                <article>
                  <div className="mb-3 h-1 w-12 bg-resa-red" />
                  <h2 className="font-display text-2xl font-black text-resa-navy md:text-3xl">
                    {isFr ? 'À propos de cet événement' : 'About this event'}
                  </h2>
                  <div className="prose-article mt-5 text-[15px] leading-relaxed">
                    {longDesc.split('\n\n').map((p: string, i: number) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </article>
              </Reveal>
            )}
          </div>

          {/* Colonne droite : formulaire */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <CampRegistrationForm camp={camp} initialValues={initialValues} />
          </aside>
        </div>
      </section>
    </>
  );
}