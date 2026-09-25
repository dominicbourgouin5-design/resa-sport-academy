// src/lib/camp-emails.ts

import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { notifyAdmins } from '@/lib/notify-admins';

// ═══════════════════════════════════════════════════════════
// HELPERS COMMUNS
// ═══════════════════════════════════════════════════════════
function emailHeader(): string {
  return `
<tr><td style="background:#0A1F44;padding:32px;text-align:center;">
<div style="color:#fff;font-size:20px;font-weight:900;letter-spacing:1px;">RESA SPORT ACADEMY</div>
</td></tr>
<tr><td style="height:4px;background:linear-gradient(90deg,#DC2626,#1E3A8A,#DC2626);"></td></tr>`;
}

function emailFooter(): string {
  return `
<tr><td style="background:#F4F6FA;padding:20px;text-align:center;color:#64748B;font-size:12px;">
RESA Sport Academy · Abidjan, Côte d'Ivoire<br/>
Vous recevez cet email suite à une inscription sur notre plateforme.
</td></tr>`;
}

function emailWrap(inner: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;background:#F4F6FA;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;">
${emailHeader()}
${inner}
${emailFooter()}
</table></td></tr></table></body></html>`;
}

// ═══════════════════════════════════════════════════════════
// EMAILS DE SUCCÈS
// ═══════════════════════════════════════════════════════════
export async function sendCampSuccessEmails(
  registrationId: string
): Promise<{ ok: boolean; skipped?: boolean }> {
  const supabase = createAdminClient();

  const { data: reg } = await supabase
    .from('camp_registrations')
    .select(`
      *,
      camp:camps(id, title_fr, title_en, slug, date_start, location, price_amount, price_fr)
    `)
    .eq('id', registrationId)
    .single();

  if (!reg) {
    console.warn('[Camp Emails] Inscription introuvable:', registrationId);
    return { ok: false };
  }

  if (reg.success_email_sent_at) {
    console.log('[Camp Emails] Succès déjà envoyé, skip');
    return { ok: true, skipped: true };
  }

  const camp = reg.camp as any;
  const campTitle = camp?.title_fr ?? 'Camp RESA';
  const adminEmail =
    process.env.BREVO_SENDER_EMAIL ?? 'contact@cataria-systems.com';
  const isPaid = reg.payment_status === 'paid';

  // ─── Email parent ───
  try {
    const headline = isPaid
      ? "🎉 Bravo, c'est confirmé !"
      : "🙌 Bienvenue dans la famille RESA !";

    const intro = isPaid
      ? `Nous avons le plaisir de vous confirmer que la place de <strong>${reg.player_name}</strong> au <strong>${campTitle}</strong> est <strong>officiellement réservée</strong>. Merci pour votre confiance — on a tellement hâte de vous y voir ! ⚽`
      : `Nous sommes ravis d'accueillir <strong>${reg.player_name}</strong> au <strong>${campTitle}</strong> ! Votre inscription est bien enregistrée. Notre équipe vous contactera très vite pour finaliser les derniers détails.`;

    const nextSteps = isPaid
      ? `<strong>Et maintenant ?</strong> Rien à faire de votre côté 😊 Nous vous enverrons 7 jours avant l'événement toutes les infos pratiques : programme, horaires exacts, ce qu'il faut apporter.`
      : `<strong>Et maintenant ?</strong> Nous vous rappelons sous 48h pour finaliser l'inscription. En attendant, n'hésitez pas à nous écrire si vous avez la moindre question.`;

    const inner = `
<tr><td style="padding:40px 32px;color:#0F172A;font-size:15px;line-height:1.7;">
<h1 style="font-size:24px;color:#0A1F44;margin:0 0 8px;">${headline}</h1>
<p style="color:#64748B;margin:0 0 24px;font-size:14px;">Bonjour ${reg.parent_name},</p>
<p style="font-size:16px;">${intro}</p>
<div style="background:#ECFDF5;border-left:4px solid #10B981;padding:18px 22px;border-radius:10px;margin:28px 0;">
  <div style="font-weight:800;color:#10B981;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">✓ ${isPaid ? "Paiement confirmé" : "Inscription enregistrée"}</div>
  <div><strong>Joueur :</strong> ${reg.player_name}${reg.player_age ? ` (${reg.player_age} ans)` : ""}</div>
  ${camp?.date_start ? `<div style="margin-top:6px;"><strong>Date :</strong> ${new Date(camp.date_start).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</div>` : ""}
  ${camp?.location ? `<div style="margin-top:6px;"><strong>Lieu :</strong> ${camp.location}</div>` : ""}
</div>
<p>${nextSteps}</p>
<p style="margin-top:28px;">À très vite sur le terrain,<br/><strong>L'équipe RESA Sport Academy</strong> 💙</p>
<div style="margin-top:28px;text-align:center;">
  <a href="https://wa.me/2250700000000" style="display:inline-block;background:#25D366;color:#fff;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">💬 Une question ? Écrivez-nous</a>
</div>
</td></tr>`;

    const subject = isPaid
      ? `🎉 C'est confirmé — ${reg.player_name} au ${campTitle} !`
      : `🙌 Bienvenue ${reg.parent_name} — ${campTitle}`;

    await sendEmail({
      to: [{ email: reg.parent_email, name: reg.parent_name }],
      subject,
      htmlContent: emailWrap(inner),
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });
    console.log('[Camp Emails] 📧 Email succès parent envoyé');
  } catch (err) {
    console.error('[Camp Emails] ⚠️ Email parent échec:', err);
  }

  // ─── Email admin ───
  try {
    const htmlAdmin = `
<div style="font-family:Arial,sans-serif;max-width:600px;">
<h2 style="color:#0A1F44;">📥 Nouvelle inscription camp</h2>
<p><strong>Événement :</strong> ${campTitle}</p>
<p><strong>Parent :</strong> ${reg.parent_name} (${reg.parent_email}${reg.parent_phone ? ` · ${reg.parent_phone}` : ''})</p>
<p><strong>Joueur :</strong> ${reg.player_name}${reg.player_age ? ` (${reg.player_age} ans)` : ''}</p>
${reg.notes ? `<p><strong>Notes :</strong> ${reg.notes}</p>` : ''}
<p><strong>Statut :</strong> ${isPaid ? '✅ Payé en ligne' : '📝 Réservation manuelle (à contacter)'}</p>
${isPaid && reg.payment_reference ? `<p><strong>Réf. FedaPay :</strong> ${reg.payment_reference}</p>` : ''}
<p style="margin-top:24px;"><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/camps/${camp.id}/inscriptions" style="background:#0A1F44;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;">Voir dans l'admin</a></p>
</div>`;

    await sendEmail({
      to: [{ email: adminEmail, name: 'RESA Admin' }],
      subject: `📥 Inscription ${campTitle}${isPaid ? ' — Payée' : ''}`,
      htmlContent: htmlAdmin,
      replyTo: { email: reg.parent_email, name: reg.parent_name }
    });
    console.log('[Camp Emails] 📧 Email succès admin envoyé');
  } catch (err) {
    console.error('[Camp Emails] ⚠️ Email admin échec:', err);
  }

  // ─── Notif in-app ───
  try {
    await notifyAdmins({
      type: 'camp_registration',
      title: `Inscription ${campTitle}${isPaid ? ' 💳' : ''}`,
      body: `${reg.parent_name} — ${reg.player_name}${isPaid ? ' · payé' : ''}`,
      link: `/admin/camps/${camp.id}/inscriptions`
    });
  } catch (err) {
    console.error('[Camp Emails] ⚠️ Notif in-app échec:', err);
  }

  await supabase
    .from('camp_registrations')
    .update({ success_email_sent_at: new Date().toISOString() })
    .eq('id', registrationId);

  return { ok: true };
}

// ═══════════════════════════════════════════════════════════
// EMAILS D'ÉCHEC / ANNULATION
// ═══════════════════════════════════════════════════════════
export async function sendCampFailureEmails(
  registrationId: string,
  reason: 'declined' | 'canceled' | 'error' = 'declined'
): Promise<{ ok: boolean; skipped?: boolean }> {
  const supabase = createAdminClient();

  const { data: reg } = await supabase
    .from('camp_registrations')
    .select(`
      *,
      camp:camps(id, title_fr, title_en, slug, date_start, location, price_amount, price_fr)
    `)
    .eq('id', registrationId)
    .single();

  if (!reg) {
    console.warn('[Camp Emails] Inscription introuvable:', registrationId);
    return { ok: false };
  }

  if (reg.failure_email_sent_at) {
    console.log('[Camp Emails] Échec déjà envoyé, skip');
    return { ok: true, skipped: true };
  }

  const camp = reg.camp as any;
  const campTitle = camp?.title_fr ?? 'Camp RESA';
  const adminEmail =
    process.env.BREVO_SENDER_EMAIL ?? 'contact@cataria-systems.com';
  const campUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/fr/camps/${camp?.slug ?? ''}`;

  // Libellés pré-calculés (évite le narrowing TypeScript)
  const isCanceled = reason === 'canceled';
  const isError = reason === 'error';
  const reasonAdminLabel = isCanceled
    ? "Annulé par l'utilisateur"
    : isError
      ? 'Erreur technique'
      : "Refusé par l'opérateur";
  const subjectAdminSuffix = isCanceled ? 'annulé' : 'échoué';

  // ─── Email parent ───
  try {
    let subject = '';
    let inner = '';

    if (isCanceled) {
      subject = `💬 On peut vous aider ? — Votre inscription à ${campTitle}`;

      inner = `
<tr><td style="padding:40px 32px;color:#0F172A;font-size:15px;line-height:1.7;">
<h1 style="font-size:24px;color:#0A1F44;margin:0 0 8px;">Pas de souci, on comprend 💙</h1>
<p style="color:#64748B;margin:0 0 24px;font-size:14px;">Bonjour ${reg.parent_name},</p>
<p>Vous avez commencé une inscription pour <strong>${reg.player_name}</strong> au <strong>${campTitle}</strong>, mais vous n'avez pas finalisé le paiement. <strong>Aucun débit n'a été effectué</strong>, soyez rassuré(e).</p>
<p style="margin-top:20px;font-size:16px;"><strong>Pourriez-vous nous dire ce qui s'est passé ?</strong> Ça nous aide vraiment à améliorer l'expérience pour toutes les familles 🙏</p>
<div style="background:#FFF7ED;border-left:4px solid #F59E0B;padding:18px 22px;border-radius:10px;margin:24px 0;">
  <div style="font-weight:800;color:#B45309;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Quelques pistes possibles</div>
  <div style="margin:6px 0;">💰 <strong>Le prix</strong> ne convenait pas à votre budget</div>
  <div style="margin:6px 0;">📅 <strong>La date</strong> ne rentre pas dans votre planning</div>
  <div style="margin:6px 0;">🔧 <strong>Un souci technique</strong> pendant le paiement</div>
  <div style="margin:6px 0;">🤔 Vous avez encore <strong>des questions</strong> avant de valider</div>
</div>
<p>Quelle que soit la raison, <strong>on est là pour vous</strong>. Répondez simplement à cet email, ou écrivez-nous directement sur WhatsApp — on s'adapte à votre situation.</p>
<div style="margin-top:28px;text-align:center;">
  <a href="${campUrl}" style="display:inline-block;background:#DC2626;color:#fff;padding:14px 30px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">Reprendre mon inscription</a>
</div>
<div style="margin-top:14px;text-align:center;">
  <a href="https://wa.me/2250700000000" style="display:inline-block;background:#25D366;color:#fff;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">💬 Parler à l'équipe</a>
</div>
<p style="margin-top:32px;">À très bientôt,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>
</td></tr>`;
    } else {
      subject = isError
        ? `Petit souci technique — on vous aide à finaliser ?`
        : `Pas d'inquiétude — votre inscription à ${campTitle} n'est pas perdue`;

      const headline = isError
        ? "Un petit contretemps technique 😅"
        : "Pas d'inquiétude, on gère 💪";

      const intro = isError
        ? `Une <strong>erreur technique</strong> est survenue pendant votre paiement pour <strong>${campTitle}</strong>. Ce n'est pas de votre faute — et la place de <strong>${reg.player_name}</strong> est toujours disponible.`
        : `Votre tentative de paiement pour <strong>${campTitle}</strong> a été <strong>refusée par l'opérateur</strong>. Ce genre de chose arrive plus souvent qu'on ne le pense — et la place de <strong>${reg.player_name}</strong> est toujours disponible.`;

      inner = `
<tr><td style="padding:40px 32px;color:#0F172A;font-size:15px;line-height:1.7;">
<h1 style="font-size:24px;color:#0A1F44;margin:0 0 8px;">${headline}</h1>
<p style="color:#64748B;margin:0 0 24px;font-size:14px;">Bonjour ${reg.parent_name},</p>
<p>${intro}</p>
<p style="margin-top:20px;"><strong>Rassurez-vous : rien n'est perdu.</strong> Voici les causes les plus fréquentes :</p>
<div style="background:#FEF2F2;border-left:4px solid #DC2626;padding:18px 22px;border-radius:10px;margin:20px 0;">
  <div style="font-weight:800;color:#DC2626;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Causes possibles</div>
  <div style="margin:6px 0;">• Solde Mobile Money insuffisant</div>
  <div style="margin:6px 0;">• Plafond journalier atteint sur votre compte</div>
  <div style="margin:6px 0;">• Numéro non autorisé pour ce type de paiement</div>
  <div style="margin:6px 0;">• Erreur réseau ou délai dépassé</div>
</div>
<p>Bonne nouvelle : <strong>vous pouvez réessayer dès maintenant</strong>, ou choisir une autre option si ça ne fonctionne toujours pas.</p>
<div style="margin-top:28px;text-align:center;">
  <a href="${campUrl}" style="display:inline-block;background:#DC2626;color:#fff;padding:14px 30px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">Réessayer le paiement</a>
</div>
<div style="margin-top:14px;text-align:center;">
  <a href="https://wa.me/2250700000000" style="display:inline-block;background:#25D366;color:#fff;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">💬 On en parle sur WhatsApp ?</a>
</div>
<p style="margin-top:24px;font-size:14px;color:#64748B;">💡 Vous pouvez aussi choisir <strong>« Réserver sans payer »</strong> lors de la prochaine tentative : notre équipe vous contacte et vous réglez ensemble.</p>
<p style="margin-top:28px;">On reste à votre écoute,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>
</td></tr>`;
    }

    await sendEmail({
      to: [{ email: reg.parent_email, name: reg.parent_name }],
      subject,
      htmlContent: emailWrap(inner),
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });
    console.log(`[Camp Emails] 📧 Email ${reason} parent envoyé`);
  } catch (err) {
    console.error('[Camp Emails] ⚠️ Email parent échec:', err);
  }

  // ─── Email admin ───
  try {
    const htmlAdmin = `
<div style="font-family:Arial,sans-serif;max-width:600px;">
<h2 style="color:#DC2626;">⚠️ Paiement camp ${subjectAdminSuffix}</h2>
<p><strong>Événement :</strong> ${campTitle}</p>
<p><strong>Parent :</strong> ${reg.parent_name} (${reg.parent_email}${reg.parent_phone ? ` · ${reg.parent_phone}` : ''})</p>
<p><strong>Joueur :</strong> ${reg.player_name}${reg.player_age ? ` (${reg.player_age} ans)` : ''}</p>
<p><strong>Motif :</strong> ${reasonAdminLabel}</p>
${reg.payment_reference ? `<p><strong>Réf. FedaPay :</strong> ${reg.payment_reference}</p>` : ''}
<p style="margin-top:24px;"><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/camps/${camp.id}/inscriptions" style="background:#0A1F44;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;">Voir dans l'admin</a></p>
</div>`;

    await sendEmail({
      to: [{ email: adminEmail, name: 'RESA Admin' }],
      subject: `⚠️ Paiement ${subjectAdminSuffix} — ${campTitle}`,
      htmlContent: htmlAdmin,
      replyTo: { email: reg.parent_email, name: reg.parent_name }
    });
    console.log('[Camp Emails] 📧 Email échec admin envoyé');
  } catch (err) {
    console.error('[Camp Emails] ⚠️ Email admin échec:', err);
  }

  // ─── Notif in-app ───
  try {
    await notifyAdmins({
      type: 'camp_payment_failed',
      title: `⚠️ Paiement ${subjectAdminSuffix} — ${campTitle}`,
      body: `${reg.parent_name} — ${reg.player_name}`,
      link: `/admin/camps/${camp.id}/inscriptions`
    });
  } catch (err) {
    console.error('[Camp Emails] ⚠️ Notif in-app échec:', err);
  }

  await supabase
    .from('camp_registrations')
    .update({ failure_email_sent_at: new Date().toISOString() })
    .eq('id', registrationId);

  return { ok: true };
}