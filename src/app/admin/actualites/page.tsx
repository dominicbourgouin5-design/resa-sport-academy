import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Collapsible from '@/components/admin/Collapsible';
import NewsTable from './NewsTable';

export default async function AdminNewsPage() {
  const supabase = await createClient();

  const { data: news } = await supabase
    .from('news')
    .select(`
      id, slug, title_fr, title_en, excerpt_fr, excerpt_en,
      is_published, published_at, created_at,
      author:profiles(id, full_name, email)
    `)
    .order('created_at', { ascending: false });

  const list = (news ?? []) as any[];

  const published = list.filter((n) => n.is_published);
  const drafts = list.filter((n) => !n.is_published);

  return (
    <div className="mx-auto max-w-6xl">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
            Contenu
          </div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Actualités
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            {list.length} article(s) · {published.length} publié(s) · {drafts.length} brouillon(s)
          </p>
        </div>

        <Link
          href="/admin/actualites/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-resa-red px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700"
        >
          + Nouvel article
        </Link>
      </div>

      {/* Collapsibles */}
      <div className="space-y-4">
        <Collapsible
          title="Publiées"
          subtitle="Articles visibles sur le site public"
          icon="✅"
          accent="emerald"
          defaultOpen={true}
          badge={published.length}
        >
          <NewsTable articles={published} />
        </Collapsible>

        <Collapsible
          title="Brouillons"
          subtitle="Articles non encore publiés"
          icon="📝"
          accent="amber"
          defaultOpen={drafts.length > 0}
          badge={drafts.length}
        >
          <NewsTable articles={drafts} />
        </Collapsible>
      </div>
    </div>
  );
}