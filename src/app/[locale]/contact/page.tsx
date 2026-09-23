import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { WHATSAPP_URL } from '@/lib/utils';

export default async function ContactPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ContactContent />;
}

function ContactContent() {
  const t = useTranslations('contact');

  const items = [
    { key: 'address', value: t('addressText'), icon: '📍' },
    { key: 'phone',   value: '+225 07 00 00 00 00',   icon: '📞' },
    { key: 'email',   value: 'contact@resasportacademy.ci', icon: '✉️' },
    { key: 'hours',   value: t('hoursText'),          icon: '🕘' }
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-resa-navy text-white">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-halo" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-20">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl font-black leading-tight tracking-tight md:text-5xl">
              {t('title')}
            </h1>
            <p className="mt-3 text-base text-white/70 md:text-lg">{t('subtitle')}</p>
          </div>
        </div>
        <div className="h-1 gradient-line" />
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 md:px-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.key} className="rounded-2xl border border-black/5 bg-white p-6 shadow-resa">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl bg-resa-gray text-2xl">
                {it.icon}
              </div>
              <div className="text-xs font-bold uppercase tracking-widest text-resa-text/50">
                {t(it.key)}
              </div>
              <div className="mt-1 font-semibold text-resa-navy">{it.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-resa-lg transition hover:brightness-110"
          >
            💬 {t('title')} · WhatsApp
          </a>
        </div>
      </section>
    </>
  );
}