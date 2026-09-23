import { BrevoClient } from '@getbrevo/brevo';

// ─── Configuration client Brevo ─────────────────────────────
const apiKey = process.env.BREVO_API_KEY;

const client = apiKey
  ? new BrevoClient({ apiKey })
  : null;

const SENDER = {
  email: process.env.BREVO_SENDER_EMAIL ?? 'contact@cataria-systems.com',
  name: process.env.BREVO_SENDER_NAME ?? 'RESA Sport Academy'
};

export type EmailPayload = {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
};

// ─── Envoi générique ────────────────────────────────────────
export async function sendEmail(payload: EmailPayload) {
  if (!client) {
    console.error('[Email] BREVO_API_KEY manquante');
    return { sent: false, error: 'API key manquante' };
  }

  try {
    const result = await client.transactionalEmails.sendTransacEmail({
      sender: SENDER,
      to: payload.to,
      subject: payload.subject,
      htmlContent: payload.htmlContent,
      replyTo: payload.replyTo
    });

    console.log('[Email] ✅ Envoyé:', result.messageId);
    return { sent: true, messageId: result.messageId };
  } catch (err: any) {
    console.error('[Email] ❌ Erreur:', err.message ?? err);
    return { sent: false, error: err.message ?? String(err) };
  }
}