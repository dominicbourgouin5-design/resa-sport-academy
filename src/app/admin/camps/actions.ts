'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentProfile } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createFedaPayTransaction,
  generatePaymentToken,
  buildPaymentUrl
} from '@/lib/payments/fedapay';

async function requireRole(allowed: string[]) {
  const profile = await getCurrentProfile();
  if (!profile || !allowed.includes(profile.role)) {
    throw new Error('Permissions insuffisantes');
  }
  return profile;
}

// ═══════════════════════════════════════════════════════════
// CRUD CAMP
// ═══════════════════════════════════════════════════════════
export async function deleteCamp(id: string) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase.from('camps').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/camps');
  revalidatePath('/[locale]/camps', 'layout');
}

export async function toggleCampActive(id: string, current: boolean) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('camps')
    .update({ is_active: !current })
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/camps');
  revalidatePath('/[locale]/camps', 'layout');
}

export async function saveCamp(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean } | null> {
  const profile = await getCurrentProfile();
  if (!profile || !['admin', 'league_manager'].includes(profile.role)) {
    return { error: 'Permissions insuffisantes.' };
  }

  const id = String(formData.get('id') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase().replace(/\s+/g, '-');
  const title_fr = String(formData.get('title_fr') ?? '').trim();
  const title_en = String(formData.get('title_en') ?? '').trim();
  const date_start = String(formData.get('date_start') ?? '').trim();

  if (!slug || !title_fr || !title_en || !date_start) {
    return { error: 'Slug, titre FR, titre EN et date de début sont obligatoires.' };
  }

  const payload: any = {
    slug,
    type: String(formData.get('type') ?? 'camp'),
    title_fr,
    title_en,
    description_fr: String(formData.get('description_fr') ?? '').trim() || null,
    description_en: String(formData.get('description_en') ?? '').trim() || null,
    long_description_fr: String(formData.get('long_description_fr') ?? '').trim() || null,
    long_description_en: String(formData.get('long_description_en') ?? '').trim() || null,
    image_url: String(formData.get('image_url') ?? '').trim() || null,
    date_start,
    date_end: String(formData.get('date_end') ?? '').trim() || date_start,
    time_start: String(formData.get('time_start') ?? '').trim() || null,
    time_end: String(formData.get('time_end') ?? '').trim() || null,
    location: String(formData.get('location') ?? '').trim() || null,
    age_min: formData.get('age_min') ? Number(formData.get('age_min')) : null,
    age_max: formData.get('age_max') ? Number(formData.get('age_max')) : null,
    capacity: formData.get('capacity') ? Number(formData.get('capacity')) : null,
    price_fr: String(formData.get('price_fr') ?? '').trim() || null,
    price_en: String(formData.get('price_en') ?? '').trim() || null,
    price_amount: formData.get('price_amount') ? Number(formData.get('price_amount')) : null,
    price_amount_usd: formData.get('price_amount_usd') ? Number(formData.get('price_amount_usd')) : null,
    program_slug: String(formData.get('program_slug') ?? '').trim() || null,
    status: String(formData.get('status') ?? 'open'),
    region: String(formData.get('region') ?? 'both'),
    is_active: formData.get('is_active') === 'on',
    display_order: formData.get('display_order') ? Number(formData.get('display_order')) : 100
  };

  const supabase = await createClient();
  if (id) {
    const { error } = await supabase.from('camps').update(payload).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from('camps').insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath('/admin/camps');
  revalidatePath('/[locale]/camps', 'layout');
  redirect('/admin/camps');
}

// ═══════════════════════════════════════════════════════════
// INSCRIPTIONS (admin)
// ═══════════════════════════════════════════════════════════
export async function updateCampRegistration(
  id: string,
  patch: {
    status?: 'new' | 'contacted' | 'confirmed' | 'cancelled';
    payment_status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
    admin_notes?: string;
  }
) {
  await requireRole(['admin', 'league_manager']);
  const supabase = await createClient();
  const payload: any = { ...patch };
  if (patch.payment_status === 'paid') {
    payload.paid_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from('camp_registrations')
    .update(payload)
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/camps');
}

export async function deleteCampRegistration(id: string) {
  await requireRole(['admin']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('camp_registrations')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/camps');
}

// ═══════════════════════════════════════════════════════════
// EMAIL PARENT
// ═══════════════════════════════════════════════════════════
export async function sendCampParentEmail(
  registrationId: string,
  subject: string,
  message: string
): Promise<{ ok?: boolean; error?: string }> {
  try {
    await requireRole(['admin', 'league_manager']);

    const supabase = await createClient();
    const { data: reg } = await supabase
      .from('camp_registrations')
      .select('parent_name, parent_email, camp:camps(id, title_fr)')
      .eq('id', registrationId)
      .single();

    if (!reg) return { error: 'Inscription introuvable.' };
    if (!reg.parent_email) return { error: 'Aucun email parent disponible.' };

    const campTitle = (reg.camp as any)?.title_fr ?? 'Camp RESA';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4F6FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6FA;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,31,68,.08);">
        <tr><td style="background:#0A1F44;padding:32px;text-align:center;">
          <div style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">RESA SPORT ACADEMY</div>
          <div style="color:rgba(255,255,255,.5);font-size:10px;font-weight:700;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">${campTitle}</div>
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
    const { sendEmail } = await import('@/lib/email');

    const res = await sendEmail({
      to: [{ email: reg.parent_email, name: reg.parent_name }],
      subject,
      htmlContent,
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });

    if (!res.sent) return { error: res.error ?? "Erreur d'envoi." };

    revalidatePath('/admin/camps');
    return { ok: true };
  } catch (err: any) {
    return { error: err.message ?? 'Erreur inconnue' };
  }
}

// ═══════════════════════════════════════════════════════════
// PRIX CAMP (auto-charger dans modal paiement)
// ═══════════════════════════════════════════════════════════
export async function getCampPriceById(
  campId: string
): Promise<{ xof: number | null; usd: number | null }> {
  if (!campId) return { xof: null, usd: null };
  const supabase = await createClient();
  const { data } = await supabase
    .from('camps')
    .select('price_amount, price_amount_usd')
    .eq('id', campId)
    .maybeSingle();
  return {
    xof: data?.price_amount ? Number(data.price_amount) : null,
    usd: data?.price_amount_usd ? Number(data.price_amount_usd) : null
  };
}

// ═══════════════════════════════════════════════════════════
// PAYMENT — Envoyer/renvoyer un lien FedaPay
// ═══════════════════════════════════════════════════════════
export async function sendCampPaymentLink(
  registrationId: string,
  amount: number,
  currency = 'XOF'
): Promise<{ ok?: boolean; error?: string; payment_url?: string }> {
  try {
    await requireRole(['admin', 'league_manager']);

    if (!Number.isFinite(amount) || amount <= 0) {
      return { error: 'Montant invalide.' };
    }
    if (currency !== 'XOF') {
      return { error: 'FedaPay accepte uniquement les FCFA. Utilisez PayPal pour USD.' };
    }

    const supabase = createAdminClient();
    const { data: reg } = await supabase
      .from('camp_registrations')
      .select('*, camp:camps(id, title_fr, slug, date_start, location)')
      .eq('id', registrationId)
      .single();

    if (!reg) return { error: 'Inscription introuvable.' };
    if (reg.payment_status === 'paid' || reg.paid_at || reg.success_email_sent_at) {
      return { error: 'Cette inscription est déjà payée.' };
    }

    const isResend = reg.payment_link_sent_at != null;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const callbackUrl = `${siteUrl}/fr/paiement/camp/${registrationId}`;

    const nameParts = (reg.parent_name as string).trim().split(' ');
    const firstname = nameParts[0] || reg.parent_name;
    const lastname = nameParts.slice(1).join(' ') || firstname;

    const isSandbox = (process.env.FEDAPAY_ENV ?? 'sandbox') !== 'live';
    const country = isSandbox ? 'bj' : (reg.parent_country || 'ci');

    const tx = await createFedaPayTransaction({
      amount: Math.round(amount),
      description: `Camp — ${(reg.camp as any)?.title_fr ?? 'RESA'}`,
      callbackUrl,
      customer: {
        firstname,
        lastname,
        email: reg.parent_email,
        phone: reg.parent_phone || undefined,
        country
      },
      currency,
      metadata: { registration_id: registrationId, type: 'camp' }
    });

    const token = await generatePaymentToken(tx.id);
    const paymentUrl = buildPaymentUrl(token);

    await supabase
      .from('camp_registrations')
      .update({
        payment_status: 'pending',
        payment_method: 'fedapay',
        payment_provider_id: String(tx.id),
        payment_token: token,
        payment_reference: tx.reference ?? null,
        payment_amount: Math.round(amount),
        payment_currency: currency,
        payment_link_sent_at: new Date().toISOString(),
        failure_email_sent_at: null
      })
      .eq('id', registrationId);

    const { sendCampPaymentLinkEmail } = await import('@/lib/camp-emails');
    await sendCampPaymentLinkEmail(registrationId, paymentUrl, isResend);

    revalidatePath('/admin/camps');
    return { ok: true, payment_url: paymentUrl };
  } catch (err: any) {
    console.error('[Camp Payment Link] Error:', err);
    return { error: err.message ?? 'Erreur inconnue' };
  }
}

// ═══════════════════════════════════════════════════════════
// PAYMENT — Envoyer/renvoyer un lien PayPal
// ═══════════════════════════════════════════════════════════
export async function sendCampPayPalLink(
  registrationId: string,
  amount: number,
  currency = 'USD'
): Promise<{ ok?: boolean; error?: string }> {
  try {
    await requireRole(['admin', 'league_manager']);

    if (!Number.isFinite(amount) || amount <= 0) {
      return { error: 'Montant invalide.' };
    }
    if (currency !== 'USD' && currency !== 'EUR') {
      return { error: 'PayPal accepte USD ou EUR uniquement.' };
    }

    const supabase = createAdminClient();
    const { data: reg } = await supabase
      .from('camp_registrations')
      .select('*, camp:camps(id, title_fr, slug, date_start, location)')
      .eq('id', registrationId)
      .single();

    if (!reg) return { error: 'Inscription introuvable.' };
    if (reg.payment_status === 'paid' || reg.paid_at || reg.success_email_sent_at) {
      return { error: 'Cette inscription est déjà payée.' };
    }

    const { createPayPalOrder } = await import('@/lib/payments/paypal');

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const returnUrl = `${siteUrl}/fr/paiement/paypal/camp/${registrationId}`;
    const cancelUrl = `${siteUrl}/fr/paiement/paypal/camp/${registrationId}?cancelled=1`;

    const order = await createPayPalOrder({
      amount: Number(amount),
      currency,
      description: `Camp — ${(reg.camp as any)?.title_fr ?? 'RESA'}`,
      referenceId: registrationId,
      returnUrl,
      cancelUrl
    });

    const isResend = reg.payment_link_sent_at != null;

    await supabase
      .from('camp_registrations')
      .update({
        payment_status: 'pending',
        payment_method: 'paypal',
        payment_provider_id: order.id,
        payment_token: order.id,
        payment_reference: null,
        payment_amount: Math.round(amount),
        payment_currency: currency,
        payment_link_sent_at: new Date().toISOString(),
        failure_email_sent_at: null
      })
      .eq('id', registrationId);

    const { sendCampPayPalLinkEmail } = await import('@/lib/camp-emails');
    await sendCampPayPalLinkEmail(registrationId, order.approveUrl, isResend);

    revalidatePath('/admin/camps');
    return { ok: true };
  } catch (err: any) {
    console.error('[Camp PayPal Link] Error:', err);
    return { error: err.message ?? 'Erreur inconnue' };
  }
}




// ═══════════════════════════════════════════════════════════
// PAYMENT — Envoyer un lien de paiement Stripe (Camp)
// ═══════════════════════════════════════════════════════════
export async function sendCampStripeLink(
  registrationId: string,
  amount: number,
  currency = 'XOF'
): Promise<{ ok?: boolean; error?: string }> {
  try {
    await requireRole(['admin', 'league_manager']);

    if (!Number.isFinite(amount) || amount <= 0) {
      return { error: 'Montant invalide.' };
    }

    const supabase = createAdminClient();
    const { data: reg } = await supabase
      .from('camp_registrations')
      .select('*, camp:camps(id, title_fr, slug, date_start, location)')
      .eq('id', registrationId)
      .single();

    if (!reg) return { error: 'Inscription introuvable.' };
    if (reg.payment_status === 'paid' || reg.paid_at || reg.success_email_sent_at) {
      return { error: 'Cette inscription est déjà payée.' };
    }

    const { createStripeSession } = await import('@/lib/payments/stripe');

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const returnUrl = `${siteUrl}/fr/paiement/stripe/return`;
    const cancelUrl = `${siteUrl}/fr/paiement/stripe/return?cancelled=1`;

    const session = await createStripeSession({
      amount: Number(amount),
      currency,
      title: `Camp — ${(reg.camp as any)?.title_fr ?? 'RESA'}`,
      customerEmail: reg.parent_email,
      customerName: reg.parent_name,
      requestId: registrationId,
      requestType: 'camp',
      returnUrl,
      cancelUrl
    });

    const isResend = reg.payment_link_sent_at != null;

    await supabase
      .from('camp_registrations')
      .update({
        payment_status: 'pending',
        payment_method: 'stripe',
        payment_provider_id: session.sessionId,
        payment_token: session.sessionId,
        payment_reference: null,
        payment_amount: Math.round(amount),
        payment_currency: currency,
        payment_link_sent_at: new Date().toISOString(),
        failure_email_sent_at: null
      })
      .eq('id', registrationId);

    const { sendCampStripeLinkEmail } = await import('@/lib/camp-emails');
    await sendCampStripeLinkEmail(registrationId, session.url!, isResend);

    revalidatePath('/admin/camps');
    return { ok: true };
  } catch (err: any) {
    console.error('[Camp Stripe Link] Error:', err);
    return { error: err.message ?? 'Erreur inconnue' };
  }
}