import BallLoader from '@/components/ui/BallLoader';
import { setRequestLocale } from 'next-intl/server';

export default async function TestLoaderPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-resa-gray p-8">
      <div className="mx-auto max-w-2xl space-y-12">

        <div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Test du Ball Loader
          </h1>
          <p className="mt-2 text-sm text-resa-text/60">
            Regarde le ballon sauter de la cage bleue à la cage rouge.
          </p>
        </div>

        {/* Version small */}
        <section className="rounded-2xl border border-black/5 bg-white p-8 shadow-resa">
          <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-resa-red">
            Taille : sm
          </div>
          <BallLoader size="sm" label="Chargement rapide…" />
        </section>

        {/* Version medium */}
        <section className="rounded-2xl border border-black/5 bg-white p-8 shadow-resa">
          <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-resa-red">
            Taille : md
          </div>
          <BallLoader size="md" label="Chargement…" />
        </section>

        {/* Version large */}
        <section className="rounded-2xl border border-black/5 bg-white p-8 shadow-resa">
          <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-resa-red">
            Taille : lg
          </div>
          <BallLoader size="lg" label="Chargement en cours…" />
        </section>

        {/* Version sans label */}
        <section className="rounded-2xl border border-black/5 bg-white p-8 shadow-resa">
          <div className="mb-4 text-[10px] font-black uppercase tracking-widest text-resa-red">
            Sans label
          </div>
          <BallLoader size="md" label="" />
        </section>

      </div>
    </div>
  );
}