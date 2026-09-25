// src/lib/email.ts
import { BrevoClient } from '@getbrevo/brevo';

const apiKey = process.env.BREVO_API_KEY;

const client = apiKey
  ? new BrevoClient({ apiKey })
  : null;

const SENDER = {
  email: process.env.BREVO_SENDER_EMAIL ?? 'contact@cataria-systems.com',
  name: process.env.BREVO_SENDER_NAME ?? 'RESA Sport Academy'
};

export type EmailAttachment = {
  name: string;      // ex: 'recu-XXXX.pdf'
  content: string;   // base64 brut (sans 'data:application/pdf;base64,')
};

export type EmailPayload = {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  replyTo?: { email: string; name?: string };
  attachments?: EmailAttachment[];
};

export async function sendEmail(payload: EmailPayload) {
  if (!client) {
    console.error('[Email] ❌ BREVO_API_KEY manquante');
    return { sent: false, error: 'API key manquante' };
  }

  try {
    const body: any = {
      sender: SENDER,
      to: payload.to,
      subject: payload.subject,
      htmlContent: payload.htmlContent,
      replyTo: payload.replyTo
    };

    // ─── Format officiel Brevo v3 / SDK v6 : "attachment" (tableau d'objets { name, content }) ───
    if (payload.attachments && payload.attachments.length > 0) {
      body.attachment = payload.attachments.map((a) => ({
        name: a.name,
        // Sécurité : retire un éventuel préfixe Data URI s'il était présent
        content: a.content.replace(/^data:[^;]+;base64,/, '')
      }));

      const summary = body.attachment
        .map((a: any) => `${a.name} (~${Math.round((a.content?.length || 0) * 0.75 / 1024)} KB)`)
        .join(', ');
      console.log(`[Email] 📎 ${body.attachment.length} pièce(s) jointe(s) transmise(s) à Brevo: ${summary}`);
    } else {
      console.log('[Email] ℹ️ Aucun fichier attaché pour cet email');
    }

    const result = await client.transactionalEmails.sendTransacEmail(body);

    console.log('[Email] ✅ Envoyé avec succès:', result.messageId);
    return { sent: true, messageId: result.messageId };
  } catch (err: any) {
    console.error('[Email] ❌ Erreur Brevo:', err.message ?? err);
    return { sent: false, error: err.message ?? String(err) };
  }
}