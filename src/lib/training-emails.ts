// src/lib/training-emails.ts
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, type EmailAttachment } from '@/lib/email';
import { notifyAdmins } from '@/lib/notify-admins';
import { generateReceiptPDF, uint8ToBase64 } from '@/lib/pdf/receipt';

const CONTACT_EMAIL = 'contact@cataria-systems.com';

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
  const primaryIsWhatsapp = primaryUrl.includes('wa.me');

  return `
<div style="margin-top:28px;text-align:center;">
  <a href="${primaryUrl}" style="display:inline-block;background:#DC2626;color:#fff;padding:14px 30px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">${primaryLabel}</a>
</div>
<div style="margin-top:14px;text-align:center;">
  <a href="${mailto}" style="display:inline-block;background:#0A1F44;color:#fff;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">✉️ Répondre par email</a>
  ${primaryIsWhatsapp ? '' : `&nbsp;<a href="https://wa.me/2250700000000" style="display:inline-block;background:#25D366;color:#fff;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">💬 WhatsApp</a>`}
</div>
<p style="margin-top:14px;text-align:center;font-size:12px;color:#94A3B8;">Vous pouvez répondre directement à cet email ou nous joindre sur WhatsApp.</p>`;
}

// ═══════════════════════════════════════════════════════════
// 1) EMAIL — Lien de paiement (envoyé par l'admin)
// ═══════════════════════════════════════════════════════════
export async function sendTrainingPaymentLinkEmail(
  requestId: string,
  paymentUrl: string,
  isResend = false
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

  const headline = isResend ? 'Nouveau lien de paiement 🔄' : "C'est calé ! 🎉";
  const intro = isResend
    ? `Voici un <strong>nouveau lien de paiement</strong> pour finaliser votre séance${req.program_title ? ` <strong>${req.program_title}</strong>` : ''}. <em>L'ancien lien n'est plus valable.</em>`
    : `Bonne nouvelle : nous avons validé votre créneau pour la séance${req.program_title ? ` <strong>${req.program_title}</strong>` : ''}. Il ne reste plus qu'à finaliser le paiement pour bloquer définitivement la place${req.player_name ? ` de <strong>${req.player_name}</strong>` : ''}.`;

  const subject = isResend
    ? `🔄 Nouveau lien de paiement — ${req.program_title ?? 'Training RESA'}`
    : `💳 Votre lien de paiement — ${req.program_title ?? 'Training RESA'}`;

  const inner = `
<h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 8px;">${headline}</h1>
<p style="color:#64748B;margin:0 0 24px;font-size:14px;">Bonjour ${req.parent_name},</p>
<p style="font-size:16px;">${intro}</p>
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
      subject,
      htmlContent: layout(inner),
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });
    console.log(`[Training Emails] 📧 Email lien de paiement ${isResend ? '(renvoi) ' : ''}envoyé`);
    return { ok: true };
  } catch (err) {
    console.error('[Training Emails] ⚠️ Lien email échec:', err);
    return { ok: false };
  }
}

// ═══════════════════════════════════════════════════════════
// 2) EMAIL — Succès final + Reçu PDF attaché
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
<p><strong>📄 Votre reçu de paiement est attaché à cet email</strong> — conservez-le précieusement.</p>
<p>Notre équipe vous enverra sous peu les détails pratiques (adresse exacte, horaire précis, à apporter).</p>
${contactButtons(`Training confirmé - ${req.program_title ?? 'RESA'}`, "💬 Une question ? WhatsApp", "https://wa.me/2250700000000")}
<p style="margin-top:28px;">À très vite sur le terrain,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>`;

  // ─── Générer le PDF de reçu ───
  let attachments: EmailAttachment[] | undefined;
  try {
    console.log('[Training Emails] 📄 Début de génération du reçu PDF...');

    const pdfBytes = await generateReceiptPDF({
      type: 'training',
      reference: req.payment_reference ?? `RESA-${req.id.slice(0, 8).toUpperCase()}`,
      date: req.paid_at ?? new Date().toISOString(),
      amount: Number(req.payment_amount ?? 0),          // ← MODIF : cast Number
      currency: req.payment_currency ?? 'XOF',
      method: req.payment_method ?? undefined,           // ← AJOUT : moyen de paiement
      clientName: req.parent_name,
      clientEmail: req.parent_email,
      clientPhone: req.parent_phone ?? undefined,
      programTitle: req.program_title ?? undefined,
      playerName: req.player_name ?? undefined,
      playerAge: req.player_age ?? undefined,
      coach: req.preferred_coach ?? undefined,
      availability: req.availability ?? undefined
    });

    console.log(`[Training Emails] 📄 PDF généré avec succès (${pdfBytes.byteLength} octets)`);

    const base64Content = uint8ToBase64(pdfBytes);

    const safeTitle = (req.program_title ?? 'training')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .toLowerCase();

    attachments = [{
      name: `recu-${safeTitle}.pdf`,
      content: base64Content
    }];

    console.log(`[Training Emails] 📎 Pièce jointe prête: recu-${safeTitle}.pdf (${base64Content.length} chars base64)`);
  } catch (pdfErr) {
    console.error('[Training Emails] ⚠️ Génération PDF échec critique:', pdfErr);
  }

  try {
    await sendEmail({
      to: [{ email: req.parent_email, name: req.parent_name }],
      subject: `✅ Séance confirmée — ${req.program_title ?? 'Training RESA'}`,
      htmlContent: layout(inner),
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' },
      attachments
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
    ? `💬 Paiement interrompu — on vous aide ?`
    : `Le paiement n'a pas abouti — on peut vous aider`;

  const headline = isCanceled
    ? 'Votre paiement a été interrompu 💙'
    : isError
      ? 'Un petit contretemps technique 😅'
      : "Le paiement n'a pas abouti";

  const intro = isError
    ? `Une <strong>erreur technique</strong> est survenue pendant le paiement pour votre séance${req.program_title ? ` <strong>${req.program_title}</strong>` : ''}. Rien n'a été débité.`
    : isCanceled
      ? `Vous avez quitté la page de paiement avant de finaliser. Aucun débit n'a été effectué.`
      : `Votre tentative de paiement n'a pas pu aboutir — cela peut arriver pour plusieurs raisons (solde, plafond, réseau) ou parce que le paiement a été interrompu. <strong>Aucun débit n'a été effectué.</strong>`;

  const inner = `
<h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 8px;">${headline}</h1>
<p style="color:#64748B;margin:0 0 24px;font-size:14px;">Bonjour ${req.parent_name},</p>
<p>${intro}</p>
<p style="margin-top:20px;"><strong>Votre créneau n'est pas perdu.</strong> Vous pouvez :</p>
<ul style="padding-left:20px;margin:16px 0;">
  <li>Réessayer depuis le lien que vous avez reçu</li>
  <li>Répondre à cet email pour qu'on vous renvoie un nouveau lien</li>
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

// ═══════════════════════════════════════════════════════════
// EMAIL — Lien de paiement PayPal
// ═══════════════════════════════════════════════════════════
export async function sendTrainingPayPalLinkEmail(
  requestId: string,
  paymentUrl: string,
  isResend = false
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
    ? `${Number(req.payment_amount).toLocaleString('fr-FR')} ${req.payment_currency ?? 'USD'}`
    : '—';

  const headline = isResend ? 'Nouveau lien de paiement PayPal 🔄' : "C'est calé ! 🎉";
  const intro = isResend
    ? `Voici un <strong>nouveau lien de paiement PayPal</strong> pour finaliser votre séance${req.program_title ? ` <strong>${req.program_title}</strong>` : ''}. <em>L'ancien lien n'est plus valable.</em>`
    : `Bonne nouvelle : nous avons validé votre créneau pour la séance${req.program_title ? ` <strong>${req.program_title}</strong>` : ''}. Il ne reste plus qu'à finaliser le paiement pour bloquer définitivement la place${req.player_name ? ` de <strong>${req.player_name}</strong>` : ''}.`;

  const subject = isResend
    ? `🔄 Nouveau lien de paiement PayPal — ${req.program_title ?? 'Training RESA'}`
    : `💳 Votre lien de paiement PayPal — ${req.program_title ?? 'Training RESA'}`;

  const inner = `
<h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 8px;">${headline}</h1>
<p style="color:#64748B;margin:0 0 24px;font-size:14px;">Bonjour ${req.parent_name},</p>
<p style="font-size:16px;">${intro}</p>
<div style="background:#EFF6FF;border-left:4px solid #003087;padding:18px 22px;border-radius:10px;margin:28px 0;">
  <div style="font-weight:800;color:#003087;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Récapitulatif</div>
  ${req.program_title ? `<div><strong>Programme :</strong> ${req.program_title}</div>` : ''}
  ${req.player_name ? `<div style="margin-top:6px;"><strong>Joueur :</strong> ${req.player_name}${req.player_age ? ` (${req.player_age} ans)` : ''}</div>` : ''}
  <div style="margin-top:12px;font-size:20px;font-weight:900;color:#DC2626;">${amountLabel}</div>
  <div style="margin-top:6px;font-size:11px;color:#64748B;">Moyen de paiement : PayPal (carte bancaire / compte PayPal)</div>
</div>
<p>Cliquez sur le bouton ci-dessous pour régler en toute sécurité via PayPal.</p>
${contactButtons(`Paiement PayPal - ${req.program_title ?? 'RESA'}`, "💳 Payer avec PayPal", paymentUrl)}
<p style="margin-top:24px;font-size:13px;color:#64748B;">
  ⏱️ Le lien reste valable 24h. Passé ce délai, la place pourra être réattribuée.
</p>
<p style="margin-top:28px;">À très vite sur le terrain,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>`;

  try {
    await sendEmail({
      to: [{ email: req.parent_email, name: req.parent_name }],
      subject,
      htmlContent: layout(inner),
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });
    console.log(`[Training Emails] 📧 Email PayPal ${isResend ? '(renvoi) ' : ''}envoyé`);
    return { ok: true };
  } catch (err) {
    console.error('[Training Emails] ⚠️ PayPal email échec:', err);
    return { ok: false };
  }
}

// ═══════════════════════════════════════════════════════════
// EMAIL — Lien de paiement Stripe (Training)
// ═══════════════════════════════════════════════════════════
export async function sendTrainingStripeLinkEmail(
  requestId: string,
  paymentUrl: string,
  isResend = false
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

  const headline = isResend ? 'Nouveau lien de paiement 🔄' : "C'est calé ! 🎉";
  const intro = isResend
    ? `Voici un <strong>nouveau lien de paiement par carte</strong> pour finaliser votre séance${req.program_title ? ` <strong>${req.program_title}</strong>` : ''}.`
    : `Bonne nouvelle : nous avons validé votre créneau pour la séance${req.program_title ? ` <strong>${req.program_title}</strong>` : ''}. Finalisez le paiement par carte pour bloquer la place.`;

  const subject = isResend
    ? `🔄 Nouveau lien de paiement — ${req.program_title ?? 'Training RESA'}`
    : `💳 Votre lien de paiement — ${req.program_title ?? 'Training RESA'}`;

  const inner = `
<h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 8px;">${headline}</h1>
<p style="color:#64748B;margin:0 0 24px;font-size:14px;">Bonjour ${req.parent_name},</p>
<p style="font-size:16px;">${intro}</p>
<div style="background:#EFF6FF;border-left:4px solid #635BFF;padding:18px 22px;border-radius:10px;margin:28px 0;">
  <div style="font-weight:800;color:#635BFF;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Récapitulatif</div>
  ${req.program_title ? `<div><strong>Programme :</strong> ${req.program_title}</div>` : ''}
  ${req.player_name ? `<div style="margin-top:6px;"><strong>Joueur :</strong> ${req.player_name}${req.player_age ? ` (${req.player_age} ans)` : ''}</div>` : ''}
  <div style="margin-top:12px;font-size:20px;font-weight:900;color:#DC2626;">${amountLabel}</div>
  <div style="margin-top:6px;font-size:11px;color:#64748B;">Paiement sécurisé par carte bancaire (Stripe)</div>
</div>
<p>Cliquez sur le bouton ci-dessous pour payer en toute sécurité.</p>
${contactButtons(`Paiement Stripe - ${req.program_title ?? 'RESA'}`, "💳 Payer par carte", paymentUrl)}
<p style="margin-top:24px;font-size:13px;color:#64748B;">⏱️ Le lien reste valable 24h.</p>
<p style="margin-top:28px;">À très vite,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>`;

  try {
    await sendEmail({
      to: [{ email: req.parent_email, name: req.parent_name }],
      subject,
      htmlContent: layout(inner),
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });
    console.log(`[Training Emails] 📧 Email Stripe ${isResend ? '(renvoi) ' : ''}envoyé`);
    return { ok: true };
  } catch (err) {
    console.error('[Training Emails] ⚠️ Stripe email échec:', err);
    return { ok: false };
  }
}