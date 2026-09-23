import webpush from 'web-push';
import { createClient } from './supabase/server';

// ─── Configuration VAPID ────────────────────────────────────
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const rawEmail = process.env.VAPID_EMAIL || process.env.VAPID_SUBJECT || 'admin@resasportacademy.ci';

// Formatage strict exigé par la spec Web Push (doit commencer par mailto:)
const vapidSubject = rawEmail.startsWith('mailto:') || rawEmail.startsWith('http')
  ? rawEmail
  : `mailto:${rawEmail}`;

if (publicKey && privateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, publicKey, privateKey);
    console.log('[Push] ✅ VAPID configuré avec:', vapidSubject);
  } catch (err: any) {
    console.error('[Push] ❌ Erreur initialisation VAPID:', err.message);
  }
} else {
  console.error('[Push] ⚠️ Clés VAPID manquantes dans les variables d\'environnement');
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

  // Récupère tous les appareils enregistrés pour cet utilisateur
  const { data: subs, error: subErr } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);

  if (subErr) {
    console.error('[Push] ❌ Erreur lecture abonnements:', subErr.message);
    return { sent: 0, failed: 0 };
  }

  if (!subs || subs.length === 0) {
    console.log(`[Push] ℹ️ Aucun abonnement trouvé pour l'utilisateur ${userId}`);
    return { sent: 0, failed: 0 };
  }

  console.log(`[Push] 🚀 Envoi vers ${subs.length} appareil(s) pour l'utilisateur ${userId.slice(0, 8)}`);

  let sent = 0;
  let failed = 0;

  for (const sub of subs) {
    try {
      const result = await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        },
        JSON.stringify({
          title: payload.title,
          body: payload.body ?? '',
          url: payload.url ?? '/admin/notifications',
          icon: payload.icon ?? '/favicon-96x96.png'
        })
      );

      console.log(`[Push] ✅ Notification délivrée (Status: ${result.statusCode})`);
      sent++;

      // Mise à jour de la dernière utilisation
      await supabase
        .from('push_subscriptions')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', sub.id);

    } catch (err: any) {
      failed++;
      console.error('[Push] ❌ Échec envoi appareil:', err.statusCode, err.body || err.message);

      // Si l'abonnement a expiré ou a été révoqué par le navigateur (Code 410 ou 404)
      if (err.statusCode === 410 || err.statusCode === 404) {
        console.log('[Push] 🗑️ Abonnement expiré, suppression de la base...');
        await supabase.from('push_subscriptions').delete().eq('id', sub.id);
      }
    }
  }

  console.log(`[Push] 📊 Résultat : ${sent} envoyé(s), ${failed} échec(s)`);
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