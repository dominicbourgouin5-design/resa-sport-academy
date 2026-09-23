import { getAdminStats, getRecentAudit } from '@/lib/queries';
import { getCurrentProfile } from '@/lib/auth';
import Link from 'next/link';
import Collapsible from '@/components/admin/Collapsible';

export default async function AdminDashboard() {
  const [stats, audit, profile] = await Promise.all([
    getAdminStats(),
    getRecentAudit(6),
    getCurrentProfile()
  ]);

  const kpis = [
    { label: 'Écoles',       value: stats.schools,       href: '/admin/ecoles',     icon: '🏫', border: 'border-l-resa-navy',   gradient: 'from-resa-navy to-resa-royal' },
    { label: 'Équipes',      value: stats.teams,         href: '/admin/equipes',    icon: '🛡️', border: 'border-l-resa-royal',  gradient: 'from-resa-royal to-resa-navy' },
    { label: 'Matchs joués', value: stats.playedMatches, href: '/admin/matchs',     icon: '⚽', border: 'border-l-resa-red',    gradient: 'from-resa-red to-red-800' },
    { label: 'Actualités',   value: stats.news,          href: '/admin/actualites', icon: '📰', border: 'border-l-amber-500',   gradient: 'from-amber-500 to-amber-700' }
  ];

  const secondary = [
    { label: 'Matchs programmés',      value: stats.matches },
    { label: 'Sponsors actifs',        value: stats.sponsors },
    { label: 'Inscriptions à traiter', value: stats.pendingRegistrations, alert: stats.pendingRegistrations > 0 },
    { label: 'Utilisateurs',           value: stats.users }
  ];

  return (
    <div className="mx-auto max-w-6xl">

      {/* Header */}
      <header className="mb-8">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-resa-red">
          Saison 2027
        </div>
        <h1 className="font-display text-3xl font-black text-resa-navy">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          Vue d'ensemble de la saison en cours.
        </p>
      </header>

      {/* KPIs — toujours visibles */}
      <section className="mb-6">
        <div className="-mx-2 flex flex-wrap">
          {kpis.map((k) => (
            <div key={k.label} className="w-1/2 px-2 pb-4 md:w-1/4 md:pb-0">
              <Link
                href={k.href}
                className={`group block overflow-hidden rounded-xl border border-black/5 border-l-4 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${k.border}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{k.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-resa-text/30 transition group-hover:text-resa-red">
                    Gérer →
                  </span>
                </div>
                <div className="mt-3 font-display text-4xl font-black text-resa-navy">
                  {k.value}
                </div>
                <div className={`mt-2 h-0.5 w-8 rounded-full bg-gradient-to-r ${k.gradient}`} />
                <div className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-resa-text/50">
                  {k.label}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Sections dépliables */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">

        {/* Colonne gauche */}
        <div className="space-y-4">
          <Collapsible
            title="Actions rapides"
            subtitle="Les tâches les plus courantes"
            icon="⚡"
            accent="red"
            defaultOpen={true}
          >
            <div className="divide-y divide-black/5">
              <QuickAction href="/admin/matchs" icon="⚽" label="Saisir un score"
                desc="Mettre à jour un résultat et recalculer le classement"
                accent="bg-resa-red/10 text-resa-red" />
              <QuickAction href="/admin/ecoles/nouveau" icon="🏫" label="Ajouter une école"
                desc="Créer une nouvelle école participante"
                accent="bg-resa-navy/10 text-resa-navy" />
              <QuickAction href="/admin/actualites/nouveau" icon="📰" label="Publier une actualité"
                desc="Ajouter une news sur le site public"
                accent="bg-amber-500/10 text-amber-600" />
              <QuickAction href="/admin/inscriptions" icon="📥" label="Traiter les inscriptions"
                desc={`${stats.pendingRegistrations} demande(s) en attente`}
                badge={stats.pendingRegistrations > 0 ? stats.pendingRegistrations : undefined}
                accent="bg-resa-royal/10 text-resa-royal" />
            </div>
          </Collapsible>

          {/* NOUVEAU : raccourcis de gestion */}
          <Collapsible
            title="Gestion rapide"
            subtitle="Accès direct aux sections principales"
            icon="🗂️"
            accent="navy"
            defaultOpen={false}
          >
            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
              {[
                { href: '/admin/ecoles',       icon: '🏫', label: 'Écoles',     count: stats.schools },
                { href: '/admin/equipes',      icon: '🛡️', label: 'Équipes',    count: stats.teams },
                { href: '/admin/matchs',       icon: '⚽', label: 'Matchs',     count: stats.matches },
                { href: '/admin/actualites',   icon: '📰', label: 'Actualités', count: stats.news },
                { href: '/admin/sponsors',     icon: '🤝', label: 'Sponsors',   count: stats.sponsors },
                { href: '/admin/utilisateurs', icon: '👥', label: 'Utilisateurs', count: stats.users }
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex flex-col items-center gap-2 rounded-lg border border-black/5 bg-resa-gray/40 p-3 transition hover:border-resa-navy/20 hover:bg-white"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-resa-navy">
                    {item.label}
                  </span>
                  <span className="text-lg font-black text-resa-navy">{item.count}</span>
                </Link>
              ))}
            </div>
          </Collapsible>
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">

          <Collapsible
            title="En détail"
            icon="📊"
            accent="royal"
            defaultOpen={true}
          >
            <div className="divide-y divide-black/5">
              {secondary.map((s) => (
                <div key={s.label} className="flex items-center justify-between px-5 py-3">
                  <span className="text-[12px] text-resa-text/60">{s.label}</span>
                  <span className={`font-display text-lg font-black ${s.alert ? 'text-resa-red' : 'text-resa-navy'}`}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </Collapsible>

          <Collapsible
            title="Activité récente"
            subtitle="Dernières actions enregistrées"
            icon="🕐"
            accent="emerald"
            defaultOpen={true}
            badge={audit.length}
          >
            {audit.length === 0 ? (
              <p className="px-5 py-8 text-center text-xs text-resa-text/40">
                Aucune activité enregistrée.
              </p>
            ) : (
              <>
                <ul className="divide-y divide-black/5">
                  {audit.map((a: any) => (
                    <li key={a.id} className="flex items-center justify-between px-5 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-[12px] font-medium text-resa-navy">
                          {a.action}
                        </div>
                        <div className="text-[10px] text-resa-text/40">
                          {a.user_email ?? 'Système'}
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] text-resa-text/40">
                        {new Date(a.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'short'
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-black/5 px-5 py-3 text-center">
                  <Link
                    href="/admin/audit"
                    className="text-[10px] font-bold uppercase tracking-wider text-resa-text/40 transition hover:text-resa-red"
                  >
                    Voir tout le journal →
                  </Link>
                </div>
              </>
            )}
          </Collapsible>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href, icon, label, desc, badge, accent
}: {
  href: string; icon: string; label: string; desc: string; badge?: number; accent: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-5 py-3.5 transition hover:bg-resa-gray/50"
    >
      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-base ${accent}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold text-resa-navy">{label}</div>
        <div className="truncate text-[11px] text-resa-text/50">{desc}</div>
      </div>
      {badge !== undefined && (
        <span className="shrink-0 rounded-full bg-resa-red px-2 py-0.5 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
      <span className="shrink-0 text-resa-text/20 transition group-hover:text-resa-red">→</span>
    </Link>
  );
}