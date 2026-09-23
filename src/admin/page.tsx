import { getAdminStats, getRecentAudit } from '@/lib/queries';
import { getCurrentProfile } from '@/lib/auth';
import Link from 'next/link';

export default async function AdminDashboard() {
  const [stats, audit, profile] = await Promise.all([
    getAdminStats(),
    getRecentAudit(8),
    getCurrentProfile()
  ]);

  const cards = [
    { label: 'Écoles actives',       value: stats.schools,             icon: '🏫', href: '/admin/ecoles',       accent: 'from-resa-navy to-resa-royal' },
    { label: 'Équipes',              value: stats.teams,               icon: '🛡️', href: '/admin/equipes',      accent: 'from-resa-royal to-resa-navy' },
    { label: 'Matchs programmés',    value: stats.matches,             icon: '⚽', href: '/admin/matchs',       accent: 'from-resa-red to-red-800' },
    { label: 'Matchs joués',         value: stats.playedMatches,       icon: '✅', href: '/admin/matchs',       accent: 'from-emerald-500 to-emerald-700' },
    { label: 'Actualités',           value: stats.news,                icon: '📰', href: '/admin/actualites',   accent: 'from-slate-600 to-slate-800' },
    { label: 'Sponsors actifs',      value: stats.sponsors,            icon: '🤝', href: '/admin/sponsors',     accent: 'from-amber-500 to-amber-700' },
    { label: 'Inscriptions à traiter', value: stats.pendingRegistrations, icon: '📥', href: '/admin/inscriptions', accent: 'from-purple-500 to-purple-700' },
    { label: 'Utilisateurs',         value: stats.users,               icon: '👥', href: '/admin/utilisateurs', accent: 'from-cyan-500 to-cyan-700' }
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
          Bienvenue, {profile?.full_name ?? profile?.email}
        </div>
        <h1 className="font-display text-3xl font-black text-resa-navy md:text-4xl">
          Tableau de bord
        </h1>
        <p className="mt-2 text-sm text-resa-text/60">
          Vue d'ensemble de la Ligue Scolaire Primaire et de RESA Sport Academy.
        </p>
      </div>

      {/* Cartes stats */}
      <div className="-mx-2 flex flex-wrap">
        {cards.map((c) => (
          <div key={c.label} className="w-full px-2 pb-4 sm:w-1/2 lg:w-1/4">
            <Link
              href={c.href}
              className="group block overflow-hidden rounded-2xl border border-black/5 bg-white shadow-resa transition-all duration-300 hover:-translate-y-1 hover:shadow-resa-lg"
            >
              <div className={`h-1 w-full bg-gradient-to-r ${c.accent}`} />
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{c.icon}</span>
                  <span className="text-resa-text/20 transition-colors group-hover:text-resa-red">→</span>
                </div>
                <div className="mt-3 font-display text-3xl font-black text-resa-navy">
                  {c.value}
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
                  {c.label}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Actions rapides + audit */}
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {/* Actions rapides */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-resa">
            <h2 className="font-display text-lg font-black text-resa-navy">
              Actions rapides
            </h2>
            <div className="mt-4 space-y-2">
              <Link
                href="/admin/matchs/nouveau"
                className="flex items-center gap-3 rounded-xl border border-black/5 bg-resa-gray px-4 py-3 text-sm font-semibold text-resa-navy transition hover:border-resa-navy/20 hover:bg-white"
              >
                <span className="text-lg">⚽</span> Créer un match
              </Link>
              <Link
                href="/admin/matchs"
                className="flex items-center gap-3 rounded-xl border border-black/5 bg-resa-gray px-4 py-3 text-sm font-semibold text-resa-navy transition hover:border-resa-navy/20 hover:bg-white"
              >
                <span className="text-lg">📝</span> Saisir un score
              </Link>
              <Link
                href="/admin/actualites/nouveau"
                className="flex items-center gap-3 rounded-xl border border-black/5 bg-resa-gray px-4 py-3 text-sm font-semibold text-resa-navy transition hover:border-resa-navy/20 hover:bg-white"
              >
                <span className="text-lg">📰</span> Publier une actu
              </Link>
              <Link
                href="/admin/inscriptions"
                className="flex items-center gap-3 rounded-xl border border-black/5 bg-resa-gray px-4 py-3 text-sm font-semibold text-resa-navy transition hover:border-resa-navy/20 hover:bg-white"
              >
                <span className="text-lg">📥</span> Voir les inscriptions
                {stats.pendingRegistrations > 0 && (
                  <span className="ml-auto rounded-full bg-resa-red px-2 py-0.5 text-[10px] font-black text-white">
                    {stats.pendingRegistrations}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Journal d'audit récent */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-resa">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-black text-resa-navy">
                Activité récente
              </h2>
              <Link
                href="/admin/audit"
                className="text-xs font-bold uppercase tracking-widest text-resa-red transition hover:text-resa-navy"
              >
                Tout voir →
              </Link>
            </div>

            {audit.length === 0 ? (
              <p className="py-8 text-center text-xs italic text-resa-text/40">
                Aucune activité enregistrée.
              </p>
            ) : (
              <ul className="divide-y divide-black/5">
                {audit.map((a: any) => (
                  <li key={a.id} className="flex items-center gap-3 py-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-resa-gray text-xs">
                      {a.action === 'match_score_updated' ? '⚽' :
                       a.action === 'school_deleted' ? '🏫' :
                       a.action === 'rules_changed' ? '⚙️' :
                       a.action === 'role_changed' ? '👥' : '📋'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-resa-navy">
                        {a.action}
                      </div>
                      <div className="truncate text-[11px] text-resa-text/50">
                        {a.user_email ?? 'Système'} · {a.entity_type}
                      </div>
                    </div>
                    <div className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-resa-text/40">
                      {new Date(a.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}