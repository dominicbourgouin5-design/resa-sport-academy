// src/lib/partner-request-emails.ts
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import { notifyAdmins } from '@/lib/notify-admins';

const CONTACT_EMAIL = 'contact@cataria-systems.com';

function emailWrap(inner: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;background:#F4F6FA;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#0A1F44;padding:32px;text-align:center;">
<div style="color:#fff;font-size:20px;font-weight:900;letter-spacing:1px;">RESA SPORT ACADEMY</div>
</td></tr>
<tr><td style="height:4px;background:linear-gradient(90deg,#DC2626,#1E3A8A,#DC2626);"></td></tr>
${inner}
<tr><td style="background:#F4F6FA;padding:20px;text-align:center;color:#64748B;font-size:12px;">
RESA Sport Academy · Abidjan, Côte d'Ivoire<br/>
Vous recevez cet email suite à une demande sur notre site.
</td></tr>
</table></td></tr></table></body></html>`;
}

// ═══════════════════════════════════════════════════════════
// EMAIL 1 — Confirmation de réception au demandeur
// ═══════════════════════════════════════════════════════════
export async function sendPartnerRequestConfirmationEmail(
  requestId: string
): Promise<{ ok: boolean; skipped?: boolean }> {
  const supabase = createAdminClient();

  const { data: req } = await supabase
    .from('sponsor_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (!req) return { ok: false };

  const adminEmail = process.env.BREVO_SENDER_EMAIL ?? CONTACT_EMAIL;

  const inner = `
<tr><td style="padding:40px 32px;color:#0F172A;font-size:15px;line-height:1.7;">
<h1 style="font-size:24px;color:#0A1F44;margin:0 0 8px;">Merci pour votre intérêt 🤝</h1>
<p style="color:#64748B;margin:0 0 24px;font-size:14px;">Bonjour ${req.contact_name},</p>
<p style="font-size:16px;">Nous avons bien reçu votre demande de partenariat pour <strong>${req.company_name}</strong>. Toute l'équipe RESA Sport Academy est ravie de l'intérêt que vous portez à notre projet.</p>
<div style="background:#EFF6FF;border-left:4px solid #1E3A8A;padding:18px 22px;border-radius:10px;margin:28px 0;">
  <div style="font-weight:800;color:#1E3A8A;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">✓ Demande bien reçue</div>
  <div><strong>Organisation :</strong> ${req.company_name}</div>
  ${req.sector ? `<div style="margin-top:6px;"><strong>Secteur :</strong> ${req.sector}</div>` : ''}
  ${req.website_url ? `<div style="margin-top:6px;"><strong>Site :</strong> ${req.website_url}</div>` : ''}
</div>
<p><strong>Et maintenant ?</strong> Notre équipe étudie votre demande et vous recontacte <strong>sous 48h</strong> par email ou téléphone pour échanger sur les possibilités de collaboration.</p>
<p>Une question en attendant ? Répondez directement à cet email — on sera ravis d'échanger.</p>
<p style="margin-top:28px;">À très bientôt,<br/><strong>L'équipe RESA Sport Academy</strong></p>
</td></tr>`;

  try {
    await sendEmail({
      to: [{ email: req.contact_email, name: req.contact_name }],
      subject: `🤝 Bien reçu — Votre demande de partenariat`,
      htmlContent: emailWrap(inner),
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });
  } catch (err) {
    console.error('[Partner Emails] Confirmation échec:', err);
    return { ok: false };
  }

  return { ok: true };
}

// ═══════════════════════════════════════════════════════════
// EMAIL 2 — Notification admin + notif in-app
// ═══════════════════════════════════════════════════════════
export async function sendPartnerRequestAdminNotification(
  requestId: string
): Promise<{ ok: boolean }> {
  const supabase = createAdminClient();

  const { data: req } = await supabase
    .from('sponsor_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (!req) return { ok: false };

  const adminEmail = process.env.BREVO_SENDER_EMAIL ?? CONTACT_EMAIL;

  // Email admin
  try {
    const htmlAdmin = `
<div style="font-family:Arial,sans-serif;max-width:600px;">
<h2 style="color:#0A1F44;">🤝 Nouvelle demande de partenariat</h2>
<p><strong>Organisation :</strong> ${req.company_name}</p>
${req.sector ? `<p><strong>Secteur :</strong> ${req.sector}</p>` : ''}
<p><strong>Contact :</strong> ${req.contact_name} (${req.contact_email}${req.contact_phone ? ` · ${req.contact_phone}` : ''})</p>
${req.country ? `<p><strong>Pays :</strong> ${req.country}</p>` : ''}
${req.website_url ? `<p><strong>Site :</strong> ${req.website_url}</p>` : ''}
${req.partnership_type ? `<p><strong>Type souhaité :</strong> ${req.partnership_type}</p>` : ''}
${req.message ? `<p><strong>Message :</strong></p><div style="background:#F4F6FA;padding:14px;border-radius:8px;white-space:pre-line;">${req.message}</div>` : ''}
<p style="margin-top:24px;"><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/demandes-partenariat" style="background:#0A1F44;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;">Voir la demande dans l'admin</a></p>
</div>`;

    await sendEmail({
      to: [{ email: adminEmail, name: 'RESA Admin' }],
      subject: `🤝 Nouvelle demande partenariat — ${req.company_name}`,
      htmlContent: htmlAdmin,
      replyTo: { email: req.contact_email, name: req.contact_name }
    });
  } catch (err) {
    console.error('[Partner Emails] Admin email échec:', err);
  }

  // Notif in-app
  try {
    await notifyAdmins({
      type: 'partner_request',
      title: `🤝 Demande partenariat — ${req.company_name}`,
      body: `${req.contact_name} · ${req.sector ?? 'secteur non précisé'}`,
      link: `/admin/demandes-partenariat`
    });
  } catch (err) {
    console.error('[Partner Emails] Notif in-app échec:', err);
  }

  return { ok: true };
}