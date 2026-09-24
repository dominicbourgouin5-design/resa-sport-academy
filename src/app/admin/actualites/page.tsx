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
      story_type, is_published, published_at, created_at,
      author:profiles(id, full_name, email)
    `)
    .order('created_at', { ascending: false });

  const list = (news ?? []) as any[];

  // Sections
  const publishedStandard = list.filter((n) => n.is_published && !n.story_type);
  const publishedPlayer   = list.filter((n) => n.is_published && n.story_type === 'player');
  const publishedCoach    = list.filter((n) => n.is_published && n.story_type === 'coach');
  const drafts            = list.filter((n) => !n.is_published);

  return (
    <div className="mx-auto max-w-6xl">

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
            Contenu
          </div>
          <h1 className="font-display text-3xl font-black text-resa-navy">
            Actualités & Stories
          </h1>
          <p className="mt-1 text-sm text-resa-text/50">
            {list.length} contenu(s) · {publishedStandard.length + publishedPlayer.length + publishedCoach.length} publié(s) · {drafts.length} brouillon(s)
          </p>
        </div>

        <Link
          href="/admin/actualites/nouveau"
          className="inline-flex items-center gap-2 rounded-full bg-resa-red px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-resa transition hover:bg-red-700"
        >
          + Nouveau contenu
        </Link>
      </div>

      {/* Collapsibles */}
      <div className="space-y-4">
        <Collapsible
          title="Actualités"
          subtitle="Articles standards visibles sur le site"
          icon="📰"
          accent="navy"
          defaultOpen={true}
          badge={publishedStandard.length}
        >
          <NewsTable articles={publishedStandard} />
        </Collapsible>

        <Collapsible
          title="Player Stories"
          subtitle="Portraits de jeunes joueurs"
          icon="⚽"
          accent="royal"
          defaultOpen={publishedPlayer.length > 0}
          badge={publishedPlayer.length}
        >
          <NewsTable articles={publishedPlayer} />
        </Collapsible>

        <Collapsible
          title="Coach Stories"
          subtitle="Portraits de coachs"
          icon="🎓"
          accent="emerald"
          defaultOpen={publishedCoach.length > 0}
          badge={publishedCoach.length}
        >
          <NewsTable articles={publishedCoach} />
        </Collapsible>

        <Collapsible
          title="Brouillons"
          subtitle="Contenus non encore publiés"
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