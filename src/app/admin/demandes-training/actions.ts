'use server';

import { createClient } from '@/lib/supabase/server';
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

// ─── Supprimer ──────────────────────────────────────────────
export async function deleteTrainingRequest(id: string) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('training_requests')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/demandes-training');
}

// ─── Changer statut ─────────────────────────────────────────
export async function updateTrainingRequestStatus(
  id: string,
  status: 'pending' | 'contacted' | 'booked' | 'cancelled'
) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('training_requests')
    .update({ status })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/demandes-training');
}

// ─── Notes internes ─────────────────────────────────────────
export async function saveTrainingRequestNotes(id: string, notes: string) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('training_requests')
    .update({ admin_notes: notes })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/demandes-training');
}

// ─── Envoyer un email au parent (manuellement, depuis l'admin) ───
export async function sendParentEmail(
  requestId: string,
  subject: string,
  message: string
): Promise<{ ok?: boolean; error?: string }> {
  try {
    await requireRole(['admin', 'league_manager']);

    const supabase = await createClient();
    const { data: request } = await supabase
      .from('training_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) return { error: 'Demande introuvable.' };

    // Email HTML (garde la charte RESA)
    const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4F6FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6FA;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,31,68,.08);">
        <tr><td style="background:#0A1F44;padding:32px;text-align:center;">
          <div style="display:inline-block;background:#fff;border-radius:50%;padding:8px;margin-bottom:12px;">
            <img src="https://resa-preview.cataria-systems.com/favicon-96x96.png" alt="RESA" width="40" height="40" style="display:block;">
          </div>
          <div style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">RESA SPORT ACADEMY</div>
          <div style="color:rgba(255,255,255,.5);font-size:10px;font-weight:700;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">Private Training</div>
        </td></tr>
        <tr><td style="height:4px;background:linear-gradient(90deg,#DC2626,#1E3A8A,#DC2626);"></td></tr>
        <tr><td style="padding:40px 32px;color:#0F172A;font-size:15px;line-height:1.7;white-space:pre-line;">
          ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </td></tr>
        <tr><td style="background:#F4F6FA;padding:24px 32px;text-align:center;color:#64748B;font-size:12px;line-height:1.6;">
          <div style="font-weight:700;color:#0A1F44;margin-bottom:4px;">RESA Sport Academy</div>
          <div>Abidjan, Côte d'Ivoire</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const adminEmail = process.env.BREVO_SENDER_EMAIL ?? 'contact@cataria-systems.com';

    const res = await sendEmail({
      to: [{ email: request.parent_email, name: request.parent_name }],
      subject,
      htmlContent,
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });

    if (!res.sent) {
      return { error: res.error ?? 'Erreur d\'envoi de l\'email' };
    }

    // Met à jour le statut si encore en attente
    if (request.status === 'pending') {
      await supabase
        .from('training_requests')
        .update({ status: 'contacted' })
        .eq('id', requestId);
    }

    revalidatePath('/admin/demandes-training');
    return { ok: true };
  } catch (err: any) {
    return { error: err.message ?? 'Erreur inconnue' };
  }
}