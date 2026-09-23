'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { sendPushToUser } from '@/lib/push';
import { revalidatePath } from 'next/cache';

async function requireAuth() {
  const profile = await getCurrentProfile();
  if (!profile || !profile.is_active) {
    throw new Error('Non autorisé');
  }
  return profile;
}

// ─── Marquer une notification comme lue ─────────────────────
export async function markAsRead(id: string) {
  const me = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', me.id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/notifications');
}

// ─── Tout marquer comme lu ──────────────────────────────────
export async function markAllAsRead() {
  const me = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', me.id)
    .eq('is_read', false);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/notifications');
}

// ─── Envoyer une notification ───────────────────────────────
export async function sendNotification(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  const me = await requireAuth();

  if (!['admin', 'league_manager'].includes(me.role)) {
    return { error: 'Permissions insuffisantes.' };
  }

  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim() || null;
  const link = String(formData.get('link') ?? '').trim() || null;
  const type = String(formData.get('type') ?? 'info');
  const audience = String(formData.get('audience') ?? 'all');
  const specificUserId = String(formData.get('specific_user_id') ?? '').trim();

  if (!title) return { error: 'Le titre est obligatoire.' };

  const supabase = await createClient();

  // ─── Cas 1 : Envoi à une personne précise ───
  if (audience === 'specific') {
    if (!specificUserId) {
      return { error: 'Veuillez sélectionner un destinataire.' };
    }
    if (specificUserId === me.id) {
      return { error: 'Vous ne pouvez pas vous envoyer un message à vous-même.' };
    }

    const { error } = await supabase.from('notifications').insert({
      user_id: specificUserId,
      sender_id: me.id,
      type,
      title,
      body,
      link,
      is_broadcast: false
    });

    if (error) return { error: error.message };

    // 🔔 Envoie le push à cette personne
    try {
      await sendPushToUser(specificUserId, {
        title,
        body: body ?? undefined,
        url: link ?? '/admin/notifications'
      });
      console.log(`[Push] Envoyé à l'utilisateur ${specificUserId}`);
    } catch (pushErr) {
      console.error('[Push] Erreur lors de l\'envoi :', pushErr);
      // On ne bloque pas l'envoi si le push échoue
    }

    revalidatePath('/admin/notifications');
    return { ok: true };
  }

  // ─── Cas 2 : Envoi à tous / à un groupe ───
  let recipientsQuery = supabase
    .from('profiles')
    .select('id')
    .eq('is_active', true)
    .neq('id', me.id); // ⚠️ On exclut l'émetteur

  if (audience === 'admins_only') {
    recipientsQuery = recipientsQuery.eq('role', 'admin');
  } else if (audience === 'managers') {
    recipientsQuery = recipientsQuery.in('role', ['admin', 'league_manager']);
  } else if (audience === 'editors') {
    recipientsQuery = recipientsQuery.in('role', ['admin', 'content_editor']);
  }

  const { data: recipients, error: recError } = await recipientsQuery;

  if (recError) return { error: recError.message };

  if (!recipients || recipients.length === 0) {
    return { error: 'Aucun destinataire pour ce groupe.' };
  }

  const rows = recipients.map((r) => ({
    user_id: r.id,
    sender_id: me.id,
    type,
    title,
    body,
    link,
    is_broadcast: audience === 'all'
  }));

  const { error: insertError } = await supabase.from('notifications').insert(rows);

  if (insertError) return { error: insertError.message };

  // 🔔 Envoie un push à chaque destinataire
  try {
    await Promise.all(
      recipients.map((r) =>
        sendPushToUser(r.id, {
          title,
          body: body ?? undefined,
          url: link ?? '/admin/notifications'
        })
      )
    );
    console.log(`[Push] Envoyé à ${recipients.length} utilisateur(s)`);
  } catch (pushErr) {
    console.error('[Push] Erreur lors de l\'envoi :', pushErr);
    // On ne bloque pas l'envoi si le push échoue
  }

  revalidatePath('/admin/notifications');
  return { ok: true };
}

// ─── Supprimer une notification ─────────────────────────────
export async function deleteNotification(id: string) {
  const me = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', me.id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/notifications');
}