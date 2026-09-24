import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { notifyAdmins } from '@/lib/notify-admins';

// ═══════════════════════════════════════════════════════════
// EMAILS DE SUCCÈS
// Envoyé quand :
//   - Réservation simple (sans paiement en ligne)
//   - OU paiement FedaPay validé
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
    const htmlParent = `
<!DOCTYPE html><html><body style="margin:0;background:#F4F6FA;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#0A1F44;padding:32px;text-align:center;">
<div style="color:#fff;font-size:20px;font-weight:900;">RESA SPORT ACADEMY</div>
</td></tr>
<tr><td style="height:4px;background:linear-gradient(90deg,#DC2626,#1E3A8A,#DC2626);"></td></tr>
<tr><td style="padding:40px 32px;color:#0F172A;font-size:15px;line-height:1.7;">
<h1 style="font-size:22px;color:#0A1F44;margin:0 0 16px;">Bonjour ${reg.parent_name},</h1>
<p>${isPaid
  ? `Votre paiement a été <strong>validé</strong> et votre inscription à <strong>${campTitle}</strong> est confirmée.`
  : `Votre inscription à <strong>${campTitle}</strong> a bien été enregistrée.`}</p>
<div style="background:#ECFDF5;border-left:4px solid #10B981;padding:16px 20px;border-radius:8px;margin:24px 0;">
<div style="font-weight:800;color:#10B981;font-size:11px;text-transform:uppercase;margin-bottom:8px;">✓ ${isPaid ? 'Paiement confirmé' : 'Inscription enregistrée'}</div>
<div><strong>Joueur :</strong> ${reg.player_name}${reg.player_age ? ` (${reg.player_age} ans)` : ''}</div>
${camp?.date_start ? `<div style="margin-top:6px;"><strong>Date :</strong> ${new Date(camp.date_start).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>` : ''}
${camp?.location ? `<div style="margin-top:6px;"><strong>Lieu :</strong> ${camp.location}</div>` : ''}
</div>
${isPaid
  ? `<p>Votre place est réservée. Vous recevrez les informations pratiques (programme, à apporter) avant l'événement.</p>`
  : `<p>Notre équipe vous contactera très prochainement pour finaliser le paiement et confirmer votre place.</p>`
}
<p style="margin-top:24px;">À très bientôt,<br/>L'équipe RESA Sport Academy</p>
</td></tr>
<tr><td style="background:#F4F6FA;padding:20px;text-align:center;color:#64748B;font-size:12px;">
RESA Sport Academy · Abidjan, Côte d'Ivoire
</td></tr>
</table></td></tr></table></body></html>`;

    await sendEmail({
      to: [{ email: reg.parent_email, name: reg.parent_name }],
      subject: isPaid
        ? `✅ Paiement confirmé — ${campTitle}`
        : `Inscription ${campTitle} — RESA`,
      htmlContent: htmlParent,
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
// EMAILS D'ÉCHEC
// Envoyé quand :
//   - Paiement FedaPay refusé (declined)
//   - Paiement FedaPay annulé par l'utilisateur (canceled)
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

  const reasonFr =
    reason === 'canceled'
      ? "Le paiement a été <strong>annulé</strong>."
      : reason === 'error'
        ? "Une <strong>erreur technique</strong> est survenue lors du paiement."
        : "Le paiement a été <strong>refusé</strong> par l'opérateur.";

  const reasonEn =
    reason === 'canceled'
      ? 'The payment was <strong>canceled</strong>.'
      : reason === 'error'
        ? 'A <strong>technical error</strong> occurred during payment.'
        : 'The payment was <strong>declined</strong> by the provider.';

  // ─── Email parent ───
  try {
    const htmlParent = `
<!DOCTYPE html><html><body style="margin:0;background:#F4F6FA;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#0A1F44;padding:32px;text-align:center;">
<div style="color:#fff;font-size:20px;font-weight:900;">RESA SPORT ACADEMY</div>
</td></tr>
<tr><td style="height:4px;background:linear-gradient(90deg,#DC2626,#1E3A8A,#DC2626);"></td></tr>
<tr><td style="padding:40px 32px;color:#0F172A;font-size:15px;line-height:1.7;">
<h1 style="font-size:22px;color:#0A1F44;margin:0 0 16px;">Bonjour ${reg.parent_name},</h1>
<p>Votre tentative de paiement pour <strong>${campTitle}</strong> n'a pas abouti.</p>
<div style="background:#FEF2F2;border-left:4px solid #DC2626;padding:16px 20px;border-radius:8px;margin:24px 0;">
<div style="font-weight:800;color:#DC2626;font-size:11px;text-transform:uppercase;margin-bottom:8px;">⚠️ ${reason === 'canceled' ? 'Paiement annulé' : reason === 'error' ? 'Erreur technique' : 'Paiement refusé'}</div>
<div>${reasonFr}</div>
</div>
<p><strong>Votre place n'est pas réservée.</strong> Vous pouvez :</p>
<ul style="padding-left:20px;">
<li>Réessayer le paiement en cliquant sur le bouton ci-dessous</li>
<li>Choisir "Réserver sans payer" et nous contacter</li>
<li>Nous joindre sur WhatsApp si le problème persiste</li>
</ul>
<div style="margin-top:24px;text-align:center;">
<a href="${process.env.NEXT_PUBLIC_SITE_URL}/fr/camps/${camp.slug}" style="display:inline-block;background:#DC2626;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">Réessayer le paiement</a>
</div>
<div style="margin-top:12px;text-align:center;">
<a href="https://wa.me/2250700000000" style="color:#25D366;font-size:13px;">💬 Nous contacter sur WhatsApp</a>
</div>
<p style="margin-top:24px;">À très bientôt,<br/>L'équipe RESA Sport Academy</p>
</td></tr>
<tr><td style="background:#F4F6FA;padding:20px;text-align:center;color:#64748B;font-size:12px;">
RESA Sport Academy · Abidjan, Côte d'Ivoire
</td></tr>
</table></td></tr></table></body></html>`;

    await sendEmail({
      to: [{ email: reg.parent_email, name: reg.parent_name }],
      subject: `⚠️ Paiement non abouti — ${campTitle}`,
      htmlContent: htmlParent,
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });
    console.log('[Camp Emails] 📧 Email échec parent envoyé');
  } catch (err) {
    console.error('[Camp Emails] ⚠️ Email parent échec:', err);
  }

  // ─── Email admin ───
  try {
    const htmlAdmin = `
<div style="font-family:Arial,sans-serif;max-width:600px;">
<h2 style="color:#DC2626;">⚠️ Paiement camp échoué</h2>
<p><strong>Événement :</strong> ${campTitle}</p>
<p><strong>Parent :</strong> ${reg.parent_name} (${reg.parent_email}${reg.parent_phone ? ` · ${reg.parent_phone}` : ''})</p>
<p><strong>Joueur :</strong> ${reg.player_name}${reg.player_age ? ` (${reg.player_age} ans)` : ''}</p>
<p><strong>Motif :</strong> ${reason === 'canceled' ? 'Annulé par l\'utilisateur' : reason === 'error' ? 'Erreur technique' : 'Refusé par l\'opérateur'}</p>
${reg.payment_reference ? `<p><strong>Réf. FedaPay :</strong> ${reg.payment_reference}</p>` : ''}
<p style="margin-top:24px;"><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/camps/${camp.id}/inscriptions" style="background:#0A1F44;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;">Voir dans l'admin</a></p>
</div>`;

    await sendEmail({
      to: [{ email: adminEmail, name: 'RESA Admin' }],
      subject: `⚠️ Paiement échoué — ${campTitle}`,
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
      title: `⚠️ Paiement échoué — ${campTitle}`,
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