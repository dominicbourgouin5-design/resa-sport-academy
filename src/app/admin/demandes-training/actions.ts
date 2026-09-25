'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/auth';
import { sendEmail } from '@/lib/email';
import {
  createFedaPayTransaction,
  generatePaymentToken,
  buildPaymentUrl
} from '@/lib/payments/fedapay';
import { sendTrainingPaymentLinkEmail } from '@/lib/training-emails';
import { revalidatePath } from 'next/cache';

async function requireRole(allowed: string[]) {
  const profile = await getCurrentProfile();
  if (!profile || !allowed.includes(profile.role)) {
    throw new Error('Permissions insuffisantes');
  }
  return profile;
}

// ═══════════════════════════════════════════════════════════
// Récupérer le tarif par défaut d'un programme (depuis rates JSON)
// ═══════════════════════════════════════════════════════════
export async function getTrainingProgramRate(slug: string): Promise<number | null> {
  if (!slug) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from('training_programs')
    .select('rates')
    .eq('slug', slug)
    .maybeSingle();

  if (!data?.rates) return null;

  const rates = Array.isArray(data.rates) ? data.rates : [];
  for (const r of rates) {
    if (r?.price_fr) {
      // "25 000 FCFA" → 25000
      const match = String(r.price_fr).match(/([\d\s]+)/);
      if (match) {
        const num = parseInt(match[1].replace(/\s/g, ''), 10);
        if (Number.isFinite(num) && num > 0) return num;
      }
    }
  }
  return null;
}

// ─── Supprimer ──────────────────────────────────────────────
export async function deleteTrainingRequest(id: string) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase.from('training_requests').delete().eq('id', id);
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

// ─── Envoyer un email manuel au parent ──────────────────────
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

    const htmlContent = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F4F6FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6FA;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#0A1F44;padding:32px;text-align:center;">
          <div style="color:#fff;font-size:20px;font-weight:900;">RESA SPORT ACADEMY</div>
          <div style="color:rgba(255,255,255,.5);font-size:10px;font-weight:700;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">Private Training</div>
        </td></tr>
        <tr><td style="height:4px;background:linear-gradient(90deg,#DC2626,#1E3A8A,#DC2626);"></td></tr>
        <tr><td style="padding:40px 32px;color:#0F172A;font-size:15px;line-height:1.7;white-space:pre-line;">
          ${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}

          —
          Une question ? Répondez directement à cet email, on reste disponibles.
        </td></tr>
        <tr><td style="background:#F4F6FA;padding:24px 32px;text-align:center;color:#64748B;font-size:12px;">
          <div style="font-weight:700;color:#0A1F44;">RESA Sport Academy</div>
          <div>Abidjan, Côte d'Ivoire</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    const adminEmail = process.env.BREVO_SENDER_EMAIL ?? 'contact@cataria-systems.com';

    const res = await sendEmail({
      to: [{ email: request.parent_email, name: request.parent_name }],
      subject,
      htmlContent,
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });

    if (!res.sent) return { error: res.error ?? 'Erreur d\'envoi de l\'email' };

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

// ═══════════════════════════════════════════════════════════
// Envoyer / Renvoyer un lien de paiement
// ═══════════════════════════════════════════════════════════
export async function sendTrainingPaymentLink(
  requestId: string,
  amount: number,
  currency = 'XOF'
): Promise<{ ok?: boolean; error?: string; payment_url?: string }> {
  try {
    await requireRole(['admin', 'league_manager']);

    if (!Number.isFinite(amount) || amount <= 0) {
      return { error: 'Montant invalide.' };
    }

    const supabase = createAdminClient();

    const { data: req } = await supabase
      .from('training_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!req) return { error: 'Demande introuvable.' };
    if (req.payment_status === 'paid') return { error: 'Cette demande est déjà payée.' };

    const isResend = req.payment_link_sent_at != null;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const callbackUrl = `${siteUrl}/fr/paiement/training/${requestId}`;

    const nameParts = (req.parent_name as string).trim().split(' ');
    const firstname = nameParts[0] || req.parent_name;
    const lastname = nameParts.slice(1).join(' ') || firstname;

    // ⚠️ Sandbox : momo_test fonctionne uniquement pour BJ.
    // En production, remplacer par un vrai pays (ou collecter côté formulaire).
    const isSandbox = (process.env.FEDAPAY_ENV ?? 'sandbox') !== 'live';
    const country = isSandbox ? 'bj' : 'ci';

    const tx = await createFedaPayTransaction({
      amount: Math.round(amount),
      description: `Training — ${req.program_title ?? 'RESA'}`,
      callbackUrl,
      customer: {
        firstname,
        lastname,
        email: req.parent_email,
        phone: req.parent_phone || undefined,
        country
      },
      currency,
      metadata: { training_request_id: requestId, type: 'training' }
    });

    const token = await generatePaymentToken(tx.id);
    const paymentUrl = buildPaymentUrl(token);

    await supabase
      .from('training_requests')
      .update({
        payment_status: 'pending',
        payment_provider_id: String(tx.id),
        payment_token: token,
        payment_reference: tx.reference ?? null,
        payment_amount: Math.round(amount),
        payment_currency: currency,
        payment_link_sent_at: new Date().toISOString(),
        failure_email_sent_at: null
      })
      .eq('id', requestId);

    await sendTrainingPaymentLinkEmail(requestId, paymentUrl, isResend);

    revalidatePath('/admin/demandes-training');
    return { ok: true, payment_url: paymentUrl };
  } catch (err: any) {
    console.error('[Training Payment Link] Error:', err);
    return { error: err.message ?? 'Erreur inconnue' };
  }
}