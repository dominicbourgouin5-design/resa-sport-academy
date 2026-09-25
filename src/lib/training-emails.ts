// src/lib/training-emails.ts
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { notifyAdmins } from '@/lib/notify-admins';

const CONTACT_EMAIL = 'contact@cataria-systems.com';

// ═══════════════════════════════════════════════════════════
// Layout
// ═══════════════════════════════════════════════════════════
function layout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F6FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6FA;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,31,68,.08);">
        <tr><td style="background:#0A1F44;padding:32px;text-align:center;">
          <div style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">RESA SPORT ACADEMY</div>
          <div style="color:rgba(255,255,255,.5);font-size:10px;font-weight:700;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">Private Training</div>
        </td></tr>
        <tr><td style="height:4px;background:linear-gradient(90deg,#DC2626,#1E3A8A,#DC2626);"></td></tr>
        <tr><td style="padding:40px 32px;color:#0F172A;font-size:15px;line-height:1.7;">${content}</td></tr>
        <tr><td style="background:#F4F6FA;padding:24px 32px;text-align:center;color:#64748B;font-size:12px;line-height:1.6;">
          <div style="font-weight:700;color:#0A1F44;margin-bottom:4px;">RESA Sport Academy</div>
          <div>Abidjan, Côte d'Ivoire</div>
          <div style="margin-top:12px;font-size:11px;">Vous pouvez répondre directement à cet email.</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function contactButtons(mailSubject: string, primaryLabel: string, primaryUrl: string): string {
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(mailSubject)}`;
  return `
<div style="margin-top:28px;text-align:center;">
  <a href="${primaryUrl}" style="display:inline-block;background:#DC2626;color:#fff;padding:14px 30px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">${primaryLabel}</a>
</div>
<div style="margin-top:14px;text-align:center;">
  <a href="${mailto}" style="display:inline-block;background:#0A1F44;color:#fff;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">✉️ Répondre par email</a>
  &nbsp;
  <a href="https://wa.me/2250700000000" style="display:inline-block;background:#25D366;color:#fff;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">💬 WhatsApp</a>
</div>`;
}

// ═══════════════════════════════════════════════════════════
// 1) EMAIL — Lien de paiement (envoyé par l'admin)
// ═══════════════════════════════════════════════════════════
export async function sendTrainingPaymentLinkEmail(
  requestId: string,
  paymentUrl: string
): Promise<{ ok: boolean }> {
  const supabase = createAdminClient();

  const { data: req } = await supabase
    .from('training_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (!req) return { ok: false };

  const adminEmail = process.env.BREVO_SENDER_EMAIL ?? 'contact@cataria-systems.com';
  const amountLabel = req.payment_amount
    ? `${Number(req.payment_amount).toLocaleString('fr-FR')} ${req.payment_currency ?? 'XOF'}`
    : '—';

  const inner = `
<h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 8px;">C'est calé ! 🎉</h1>
<p style="color:#64748B;margin:0 0 24px;font-size:14px;">Bonjour ${req.parent_name},</p>
<p style="font-size:16px;">
  Bonne nouvelle : nous avons validé votre créneau pour la séance${req.program_title ? ` <strong>${req.program_title}</strong>` : ''}.
  Il ne reste plus qu'à finaliser le paiement pour bloquer définitivement la place${req.player_name ? ` de <strong>${req.player_name}</strong>` : ''}.
</p>
<div style="background:#EFF6FF;border-left:4px solid #1E3A8A;padding:18px 22px;border-radius:10px;margin:28px 0;">
  <div style="font-weight:800;color:#1E3A8A;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Récapitulatif</div>
  ${req.program_title ? `<div><strong>Programme :</strong> ${req.program_title}</div>` : ''}
  ${req.player_name ? `<div style="margin-top:6px;"><strong>Joueur :</strong> ${req.player_name}${req.player_age ? ` (${req.player_age} ans)` : ''}</div>` : ''}
  <div style="margin-top:12px;font-size:20px;font-weight:900;color:#DC2626;">${amountLabel}</div>
</div>
<p>Cliquez sur le bouton ci-dessous pour régler en toute sécurité (Wave, Orange Money, MTN, Moov, carte bancaire).</p>
${contactButtons(`Paiement training - ${req.program_title ?? 'RESA'}`, "💳 Payer maintenant", paymentUrl)}
<p style="margin-top:24px;font-size:13px;color:#64748B;">
  ⏱️ Le lien reste valable 24h. Passé ce délai, la place pourra être réattribuée.
</p>
<p style="margin-top:28px;">À très vite sur le terrain,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>`;

  try {
    await sendEmail({
      to: [{ email: req.parent_email, name: req.parent_name }],
      subject: `💳 Votre lien de paiement — ${req.program_title ?? 'Training RESA'}`,
      htmlContent: layout(inner),
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });
    console.log('[Training Emails] 📧 Email lien de paiement envoyé');
    return { ok: true };
  } catch (err) {
    console.error('[Training Emails] ⚠️ Lien email échec:', err);
    return { ok: false };
  }
}

// ═══════════════════════════════════════════════════════════
// 2) EMAIL — Succès final (après paiement validé)
// ═══════════════════════════════════════════════════════════
export async function sendTrainingSuccessEmail(
  requestId: string
): Promise<{ ok: boolean; skipped?: boolean }> {
  const supabase = createAdminClient();

  const { data: req } = await supabase
    .from('training_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (!req) return { ok: false };
  if (req.success_email_sent_at) return { ok: true, skipped: true };

  const adminEmail = process.env.BREVO_SENDER_EMAIL ?? 'contact@cataria-systems.com';
  const amountLabel = req.payment_amount
    ? `${Number(req.payment_amount).toLocaleString('fr-FR')} ${req.payment_currency ?? 'XOF'}`
    : '—';

  const inner = `
<h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 8px;">Paiement confirmé ✅</h1>
<p style="color:#64748B;margin:0 0 24px;font-size:14px;">Bonjour ${req.parent_name},</p>
<p style="font-size:16px;">
  Nous avons bien reçu votre paiement. La séance${req.program_title ? ` <strong>${req.program_title}</strong>` : ''} est <strong>définitivement réservée</strong>${req.player_name ? ` pour <strong>${req.player_name}</strong>` : ''} 🎉
</p>
<div style="background:#ECFDF5;border-left:4px solid #10B981;padding:18px 22px;border-radius:10px;margin:28px 0;">
  <div style="font-weight:800;color:#10B981;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">✓ Paiement confirmé</div>
  ${req.program_title ? `<div><strong>Programme :</strong> ${req.program_title}</div>` : ''}
  ${req.player_name ? `<div style="margin-top:6px;"><strong>Joueur :</strong> ${req.player_name}${req.player_age ? ` (${req.player_age} ans)` : ''}</div>` : ''}
  ${req.preferred_coach ? `<div style="margin-top:6px;"><strong>Coach :</strong> ${req.preferred_coach}</div>` : ''}
  <div style="margin-top:12px;"><strong>Montant payé :</strong> ${amountLabel}</div>
  ${req.payment_reference ? `<div style="margin-top:6px;font-size:11px;color:#64748B;">Réf. : ${req.payment_reference}</div>` : ''}
</div>
<p>Notre équipe vous enverra sous peu les détails pratiques (adresse exacte, horaire précis, à apporter).</p>
${contactButtons(`Training confirmé - ${req.program_title ?? 'RESA'}`, "💬 Une question ? WhatsApp", "https://wa.me/2250700000000")}
<p style="margin-top:28px;">À très vite sur le terrain,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>`;

  try {
    await sendEmail({
      to: [{ email: req.parent_email, name: req.parent_name }],
      subject: `✅ Séance confirmée — ${req.program_title ?? 'Training RESA'}`,
      htmlContent: layout(inner),
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });

    await notifyAdmins({
      type: 'training_paid',
      title: `💳 Paiement training reçu`,
      body: `${req.parent_name} — ${req.program_title ?? 'Training'}`,
      link: '/admin/demandes-training'
    });
  } catch (err) {
    console.error('[Training Emails] ⚠️ Succès email échec:', err);
  }

  await supabase
    .from('training_requests')
    .update({ success_email_sent_at: new Date().toISOString() })
    .eq('id', requestId);

  return { ok: true };
}

// ═══════════════════════════════════════════════════════════
// 3) EMAIL — Échec / annulation du paiement
// ═══════════════════════════════════════════════════════════
export async function sendTrainingPaymentFailedEmail(
  requestId: string,
  reason: 'declined' | 'canceled' | 'error' = 'declined'
): Promise<{ ok: boolean; skipped?: boolean }> {
  const supabase = createAdminClient();

  const { data: req } = await supabase
    .from('training_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (!req) return { ok: false };
  if (req.failure_email_sent_at) return { ok: true, skipped: true };

  const adminEmail = process.env.BREVO_SENDER_EMAIL ?? 'contact@cataria-systems.com';
  const isCanceled = reason === 'canceled';
  const isError = reason === 'error';

  const subject = isCanceled
    ? `💬 Paiement annulé — on en reparle ?`
    : `⚠️ Petit contretemps pour votre paiement`;

  const headline = isCanceled
    ? 'Pas de souci, on comprend 💙'
    : isError
      ? 'Un petit contretemps technique 😅'
      : "Le paiement n'a pas abouti";
  const intro = isCanceled
    ? `Vous avez commencé le paiement pour votre séance${req.program_title ? ` <strong>${req.program_title}</strong>` : ''} mais vous ne l'avez pas finalisé. <strong>Aucun débit n'a été effectué</strong>.`
    : isError
      ? `Une erreur technique est survenue pendant votre paiement. Rien n'a été débité.`
      : `Votre paiement a été refusé par l'opérateur. Rien n'a été débité.`;

  const inner = `
<h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 8px;">${headline}</h1>
<p style="color:#64748B;margin:0 0 24px;font-size:14px;">Bonjour ${req.parent_name},</p>
<p>${intro}</p>
<p style="margin-top:20px;"><strong>Votre créneau n'est pas perdu.</strong> Vous pouvez :</p>
<ul style="padding-left:20px;margin:16px 0;">
  <li>Réessayer depuis le lien que vous avez reçu</li>
  <li>Répondre à cet email pour qu'on vous envoie un nouveau lien</li>
  <li>Nous joindre sur WhatsApp si le problème persiste</li>
</ul>
${contactButtons(`Paiement training - ${req.program_title ?? 'RESA'}`, "💬 Nous contacter", "https://wa.me/2250700000000")}
<p style="margin-top:28px;">On reste à votre écoute,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>`;

  try {
    await sendEmail({
      to: [{ email: req.parent_email, name: req.parent_name }],
      subject,
      htmlContent: layout(inner),
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });
  } catch (err) {
    console.error('[Training Emails] ⚠️ Échec email échec:', err);
  }

  await supabase
    .from('training_requests')
    .update({ failure_email_sent_at: new Date().toISOString() })
    .eq('id', requestId);

  return { ok: true };
}