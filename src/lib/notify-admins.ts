import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Envoie une notification in-app à tous les admins + league_managers actifs.
 * Utilise le client service_role → bypass RLS.
 * Silencieux : ne throw jamais (ne doit pas casser l'appelant).
 */
export async function notifyAdmins(params: {
  type: string;
  title: string;
  body: string;
  link?: string;
}): Promise<void> {
  try {
    const supabase = createAdminClient();

    // Récupère tous les admins + league_managers actifs
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'league_manager'])
      .eq('is_active', true);

    if (!admins || admins.length === 0) {
      console.warn('[notifyAdmins] Aucun admin actif trouvé');
      return;
    }

    const rows = admins.map((a) => ({
      user_id: a.id,
      sender_id: null,
      type: params.type,
      title: params.title,
      body: params.body,
      link: params.link ?? null,
      is_read: false,
      is_broadcast: false
    }));

    const { error } = await supabase.from('notifications').insert(rows);
    if (error) {
      console.error('[notifyAdmins] Insert error:', error);
    }
  } catch (err) {
    console.error('[notifyAdmins] Unexpected error:', err);
  }
}