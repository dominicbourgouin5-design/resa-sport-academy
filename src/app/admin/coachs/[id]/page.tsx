import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CoachForm from '../CoachForm';

export default async function EditCoachPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: coach } = await supabase
    .from('coaches')
    .select('*')
    .eq('id', id)
    .single();

  if (!coach) notFound();

  // Compteurs
  const [{ count: testimonialsCount }, { count: mediaCount }] = await Promise.all([
    supabase
      .from('coach_testimonials')
      .select('*', { count: 'exact', head: true })
      .eq('coach_id', id),
    supabase
      .from('coach_media')
      .select('*', { count: 'exact', head: true })
      .eq('coach_id', id)
  ]);

  return (
    <>
      {/* ─── Navigation vers témoignages et médias ─── */}
      <div className="mx-auto mb-8 max-w-3xl">
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Témoignages */}
          <Link
            href={`/admin/coachs/${coach.id}/temoignages`}
            className="group flex items-center gap-4 rounded-xl border border-black/5 bg-white p-5 shadow-resa transition hover:-translate-y-1 hover:shadow-resa-lg"
          >
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-2xl text-white">
              💬
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
                Témoignages
              </div>
              <div className="mt-0.5 font-display text-lg font-black text-resa-navy transition-colors group-hover:text-amber-600">
                {testimonialsCount ?? 0} témoignage(s)
              </div>
              <div className="mt-1 text-xs text-resa-text/50">
                Gérer les témoignages
              </div>
            </div>
            <span className="text-resa-text/30 transition group-hover:translate-x-1 group-hover:text-amber-500">
              →
            </span>
          </Link>

          {/* Médias */}
          <Link
            href={`/admin/coachs/${coach.id}/media`}
            className="group flex items-center gap-4 rounded-xl border border-black/5 bg-white p-5 shadow-resa transition hover:-translate-y-1 hover:shadow-resa-lg"
          >
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-resa-royal to-resa-navy text-2xl text-white">
              🎥
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-resa-royal">
                Médias
              </div>
              <div className="mt-0.5 font-display text-lg font-black text-resa-navy transition-colors group-hover:text-resa-royal">
                {mediaCount ?? 0} média(s)
              </div>
              <div className="mt-1 text-xs text-resa-text/50">
                Photos et vidéos
              </div>
            </div>
            <span className="text-resa-text/30 transition group-hover:translate-x-1 group-hover:text-resa-royal">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* ─── Formulaire coach principal ─── */}
      <CoachForm coach={coach} />
    </>
  );
}