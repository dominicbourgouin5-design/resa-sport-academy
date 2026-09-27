'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

async function requireRole(allowed: string[]) {
  const profile = await getCurrentProfile();
  if (!profile || !allowed.includes(profile.role)) {
    throw new Error('Permissions insuffisantes');
  }
  return profile;
}

// ═══════════════════════════════════════════════════════════
// Changer le statut
// ═══════════════════════════════════════════════════════════
export async function updatePartnerRequestStatus(
  id: string,
  status: 'pending' | 'contacted' | 'validated' | 'suspended' | 'rejected'
) {
  await requireRole(['admin', 'league_manager']);

  const supabase = await createClient();

  const patch: any = { status, updated_at: new Date().toISOString() };
  if (status === 'contacted') patch.contacted_at = new Date().toISOString();
  if (status === 'validated') patch.validated_at = new Date().toISOString();

  const { error } = await supabase
    .from('sponsor_requests')
    .update(patch)
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/demandes-partenariat');
}

// ═══════════════════════════════════════════════════════════
// Sauvegarder les notes internes
// ═══════════════════════════════════════════════════════════
export async function savePartnerRequestNotes(id: string, notes: string) {
  await requireRole(['admin', 'league_manager']);

  const supabase = await createClient();
  const { error } = await supabase
    .from('sponsor_requests')
    .update({ admin_notes: notes, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/demandes-partenariat');
}

// ═══════════════════════════════════════════════════════════
// Envoyer un email manuel au contact
// ═══════════════════════════════════════════════════════════
export async function sendPartnerRequestEmail(
  requestId: string,
  subject: string,
  message: string
): Promise<{ ok?: boolean; error?: string }> {
  try {
    await requireRole(['admin', 'league_manager']);

    const supabase = await createClient();
    const { data: req } = await supabase
      .from('sponsor_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!req) return { error: 'Demande introuvable.' };
    if (!req.contact_email) return { error: 'Pas d\'email disponible.' };

    const adminEmail = process.env.BREVO_SENDER_EMAIL ?? 'contact@cataria-systems.com';

    const htmlContent = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4F6FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6FA;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#0A1F44;padding:32px;text-align:center;">
          <div style="color:#fff;font-size:20px;font-weight:900;">RESA SPORT ACADEMY</div>
          <div style="color:rgba(255,255,255,.5);font-size:10px;font-weight:700;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">Partenariats</div>
        </td></tr>
        <tr><td style="height:4px;background:linear-gradient(90deg,#DC2626,#1E3A8A,#DC2626);"></td></tr>
        <tr><td style="padding:40px 32px;color:#0F172A;font-size:15px;line-height:1.7;white-space:pre-line;">
${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </td></tr>
        <tr><td style="background:#F4F6FA;padding:24px 32px;text-align:center;color:#64748B;font-size:12px;">
          <div style="font-weight:700;color:#0A1F44;">RESA Sport Academy</div>
          <div>Abidjan, Côte d'Ivoire</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    const res = await sendEmail({
      to: [{ email: req.contact_email, name: req.contact_name }],
      subject,
      htmlContent,
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });

    if (!res.sent) return { error: res.error ?? "Erreur d'envoi." };

    revalidatePath('/admin/demandes-partenariat');
    return { ok: true };
  } catch (err: any) {
    return { error: err.message ?? 'Erreur inconnue' };
  }
}

// ═══════════════════════════════════════════════════════════
// Supprimer une demande
// ═══════════════════════════════════════════════════════════
export async function deletePartnerRequest(id: string) {
  await requireRole(['admin']);
  const supabase = await createClient();
  const { error } = await supabase.from('sponsor_requests').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/demandes-partenariat');
}