import webpush from 'web-push';
import { createClient } from './supabase/server';

// ─── Configuration VAPID ────────────────────────────────────
if (
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  process.env.VAPID_EMAIL
) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log('[Push] VAPID configuré');
} else {
  console.error('[Push] ⚠️ VAPID manquant dans .env.local');
}

export type PushPayload = {
  title: string;
  body?: string;
  url?: string;
  icon?: string;
};

// ─── Envoyer un push à un utilisateur ───────────────────────
export async function sendPushToUser(userId: string, payload: PushPayload) {
  const supabase = await createClient();

  const { data: subs, error: subErr } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);

  if (subErr) {
    console.error('[Push] Erreur lecture subs:', subErr.message);
    return { sent: 0, failed: 0 };
  }

  if (!subs || subs.length === 0) {
    console.log('[Push] Aucun abonnement pour cet utilisateur');
    return { sent: 0, failed: 0 };
  }

  console.log(`[Push] ${subs.length} abonnement(s) trouvé(s) pour user ${userId.slice(0, 8)}`);
  console.log('[Push] VAPID configuré:', !!process.env.VAPID_PRIVATE_KEY);

  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      console.log('[Push] Envoi vers:', sub.endpoint.slice(0, 60) + '...');

      const result = await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        },
        JSON.stringify({
          title: payload.title,
          body: payload.body ?? '',
          url: payload.url ?? '/admin',
          icon: payload.icon ?? '/favicon-96x96.png'
        })
      );

      console.log('[Push] ✅ Succès:', result.statusCode);
      sent++;

      await supabase
        .from('push_subscriptions')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', sub.id);
    } catch (err: any) {
      failed++;
      console.error('[Push] ❌ Échec:', err.statusCode, err.body || err.message);
      console.error('[Push] Stack:', err.stack?.split('\n')[0]);

      if (err.statusCode === 410 || err.statusCode === 404) {
        console.log('[Push] Abonnement invalide, suppression...');
        await supabase.from('push_subscriptions').delete().eq('id', sub.id);
      }
    }
  }

  console.log(`[Push] Résultat final : ${sent} envoyé(s), ${failed} échec(s)`);
  return { sent, failed };
}

// ─── Envoyer un push à plusieurs utilisateurs ───────────────
export async function sendPushToUsers(userIds: string[], payload: PushPayload) {
  const results = await Promise.all(
    userIds.map((id) => sendPushToUser(id, payload))
  );

  return {
    totalSent: results.reduce((acc, r) => acc + r.sent, 0),
    totalFailed: results.reduce((acc, r) => acc + r.failed, 0)
  };
}