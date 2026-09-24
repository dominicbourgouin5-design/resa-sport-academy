import { setRequestLocale } from 'next-intl/server';
import { useTranslations, useLocale } from 'next-intl';
import { WHATSAPP_URL } from '@/lib/utils';
import ContactHero from './ContactHero';
import ContactForm from '@/components/ContactForm';
import { getTrainingPrograms, getCoaches } from '@/lib/queries';

export default async function ContactPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ program?: string; coach?: string }>;
}) {
  const { locale } = await params;
  const { program, coach } = await searchParams;
  setRequestLocale(locale);

  const [programs, coaches] = await Promise.all([
    getTrainingPrograms(),
    getCoaches()
  ]);

  return (
    <ContactContent
      programs={programs}
      coaches={coaches}
      preselectedSlug={program ?? null}
      preselectedCoach={coach ?? null}
    />
  );
}

function ContactContent({
  programs,
  coaches,
  preselectedSlug,
  preselectedCoach
}: {
  programs: any[];
  coaches: any[];
  preselectedSlug: string | null;
  preselectedCoach: string | null;
}) {
  const t = useTranslations('contact');
  const locale = useLocale();
  const isFr = locale === 'fr';

  const items = [
    { key: 'address', value: t('addressText'), icon: '📍' },
    { key: 'phone',   value: '+225 07 00 00 00 00',   icon: '📞' },
    { key: 'email',   value: 'contact@resasportacademy.ci', icon: '✉️' },
    { key: 'hours',   value: t('hoursText'),          icon: '🕘' }
  ];

  const sortedPrograms = [...programs].sort((a, b) => {
    if (a.slug === preselectedSlug) return -1;
    if (b.slug === preselectedSlug) return 1;
    return 0;
  });

  return (
    <>
      <ContactHero />

      {/* ─── Bandeau coordonnées ─── */}
      <section className="border-b border-black/5 bg-resa-gray">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            {items.map((it) => (
              <div key={it.key} className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-xl shadow-resa">
                  {it.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-resa-text/45">
                    {t(it.key)}
                  </div>
                  <div className="mt-0.5 truncate text-sm font-semibold text-resa-navy">
                    {it.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Formulaire centré ─── */}
      <section className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
        <ContactForm
          programs={sortedPrograms}
          coaches={coaches}
          preselectedSlug={preselectedSlug}
          preselectedCoach={preselectedCoach}
        />

        <div className="mt-8 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
          <span className="text-sm text-resa-text/55">
            {isFr
              ? 'Ou discutez directement avec nous :'
              : 'Or chat with us directly:'}
          </span>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:brightness-110"
          >
            💬 WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}