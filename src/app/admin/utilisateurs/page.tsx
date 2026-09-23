import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Collapsible from '@/components/admin/Collapsible';
import UsersTable from './UsersTable';

const ROLE_CONFIG: Record<string, {
  label: string;
  subtitle: string;
  accent: 'red' | 'royal' | 'navy' | 'emerald' | 'amber';
  icon: string;
  order: number;
}> = {
  admin:          { label: 'Administrateurs',       subtitle: 'Accès total à la plateforme',              accent: 'red',     icon: '👑', order: 1 },
  league_manager: { label: 'Gestionnaires Ligue',   subtitle: 'Écoles, équipes, calendrier, résultats',   accent: 'navy',    icon: '🛡️', order: 2 },
  result_entry:   { label: 'Saisie résultats',      subtitle: 'Saisie des scores et statuts de matchs',   accent: 'royal',   icon: '✍️', order: 3 },
  content_editor: { label: 'Éditeurs contenu',      subtitle: 'Actualités, photos, sponsors',             accent: 'amber',   icon: '✏️', order: 4 }
};

export default async function AdminUsersPage() {
  const me = await getCurrentProfile();
  if (!me || me.role !== 'admin') {
    redirect('/admin');
  }

  const supabase = await createClient();

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  const list = (users ?? []) as any[];

  // Grouper par rôle
  const byRole: Record<string, any[]> = {};
  for (const u of list) {
    const role = u.role ?? 'content_editor';
    (byRole[role] ??= []).push(u);
  }

  const total = list.length;
  const activeCount = list.filter((u) => u.is_active).length;

  return (
    <div className="mx-auto max-w-6xl">

      {/* Header */}
      <div className="mb-8">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-resa-red">
          Administration
        </div>
        <h1 className="font-display text-3xl font-black text-resa-navy">
          Utilisateurs & rôles
        </h1>
        <p className="mt-1 text-sm text-resa-text/50">
          {total} compte(s) · {activeCount} actif(s)
        </p>
      </div>

      {/* Info */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-resa-royal/20 bg-resa-royal/5 px-4 py-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-resa-royal text-sm text-white">
          ℹ️
        </span>
        <div className="flex-1 text-[12px] text-resa-royal">
          <div className="font-bold">
            Créer un nouveau compte
          </div>
          <div className="mt-0.5 text-resa-royal/80">
            Les comptes se créent depuis le tableau de bord Supabase → <strong>Authentication → Users</strong>.
            Un profil est automatiquement généré à la création (rôle « Éditeur contenu » par défaut).
          </div>
        </div>
      </div>

      {/* Collapsibles par rôle */}
      <div className="space-y-4">
        {Object.entries(ROLE_CONFIG)
          .sort((a, b) => a[1].order - b[1].order)
          .map(([role, config]) => {
            const list = byRole[role] ?? [];
            if (list.length === 0) return null;

            return (
              <Collapsible
                key={role}
                title={config.label}
                subtitle={config.subtitle}
                icon={config.icon}
                accent={config.accent}
                defaultOpen={role === 'admin'}
                badge={list.length}
              >
                <UsersTable users={list} myId={me.id} />
              </Collapsible>
            );
          })}
      </div>
    </div>
  );
}