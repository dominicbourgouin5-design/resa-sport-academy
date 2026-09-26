'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { sendCampSuccessEmails } from '@/lib/camp-emails';
import {
  createFedaPayTransaction,
  generatePaymentToken,
  buildPaymentUrl
} from '@/lib/payments/fedapay';

export type CampRegistrationResult = {
  ok?: boolean;
  error?: string;
  payment_url?: string;
  registration_id?: string;
};

export async function sendCampRegistration(payload: {
  camp_id: string;
  camp_slug: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  parent_country: string;
  player_name: string;
  player_age: string;
  player_birth_date: string;
  notes: string;
  payment_method: 'later' | 'fedapay' | 'paypal' | 'stripe';  locale?: string;
}): Promise<CampRegistrationResult> {
  try {
    const {
      camp_id, parent_name, parent_email, parent_phone, parent_country,
      player_name, player_age, player_birth_date, notes,
      payment_method, locale = 'fr'
    } = payload;

    if (!camp_id) return { error: 'Identifiant camp manquant.' };
    if (!parent_name || !parent_email || !player_name) {
      return { error: 'Champs obligatoires manquants.' };
    }

    const supabase = createAdminClient();

    const { data: camp, error: campErr } = await supabase
      .from('camps')
      .select('id, slug, title_fr, title_en, price_amount, price_amount_usd, price_fr, date_start, location, currency')
      .eq('id', camp_id)
      .single();

    if (campErr || !camp) {
      return { error: campErr?.message ?? 'Camp introuvable.' };
    }

    if (payment_method === 'paypal' && !camp.price_amount_usd) {
      return { error: 'Paiement PayPal indisponible pour ce camp.' };
    }

    const dbMethod = payment_method === 'later' ? 'manual' : payment_method;

    const { data: registration, error: insertErr } = await supabase
      .from('camp_registrations')
      .insert({
        camp_id,
        parent_name,
        parent_email,
        parent_phone: parent_phone || null,
        parent_country: parent_country || 'ci',
        player_name,
        player_age: player_age ? Number(player_age) : null,
        player_birth_date: player_birth_date || null,
        notes: notes || null,
        payment_status: 'pending',
        payment_method: dbMethod,
        status: 'new'
      })
      .select('id')
      .single();

    if (insertErr || !registration) {
      return { error: `Erreur enregistrement : ${insertErr?.message ?? 'inconnue'}` };
    }

    const regId = registration.id;
    let payment_url: string | undefined;

    // Cas manuel
    if (payment_method === 'later') {
      await sendCampSuccessEmails(regId);
      return { ok: true, registration_id: regId };
    }

    // Cas FedaPay
    if (payment_method === 'fedapay' && camp.price_amount) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
        const callbackUrl = `${siteUrl}/${locale}/paiement/camp/${regId}`;

        const nameParts = parent_name.trim().split(' ');
        const firstname = nameParts[0] || parent_name;
        const lastname = nameParts.slice(1).join(' ') || firstname;

        const isSandbox = (process.env.FEDAPAY_ENV ?? 'sandbox') !== 'live';
        const country = isSandbox ? 'bj' : (parent_country || 'ci');

        const tx = await createFedaPayTransaction({
          amount: camp.price_amount,
          description: `Inscription camp — ${camp.title_fr ?? 'RESA'}`,
          callbackUrl,
          customer: { firstname, lastname, email: parent_email, phone: parent_phone || undefined, country },
          currency: camp.currency ?? 'XOF',
          metadata: { registration_id: regId, camp_slug: camp.slug, type: 'camp' }
        });

        const token = await generatePaymentToken(tx.id);

        await supabase
          .from('camp_registrations')
          .update({
            payment_provider_id: String(tx.id),
            payment_token: token,
            payment_reference: tx.reference ?? null,
            payment_amount: camp.price_amount,
            payment_currency: camp.currency ?? 'XOF',
            payment_link_sent_at: new Date().toISOString()
          })
          .eq('id', regId);

        payment_url = buildPaymentUrl(token);
      } catch (err: any) {
        console.error('[Camp Reg] ❌ FedaPay error:', err);
        await supabase
          .from('camp_registrations')
          .update({
            admin_notes: `⚠️ Erreur FedaPay : ${err.message}`,
            payment_status: 'failed'
          })
          .eq('id', regId);
        const { sendCampFailureEmails } = await import('@/lib/camp-emails');
        await sendCampFailureEmails(regId, 'error');
        return { ok: true, registration_id: regId };
      }

      return { ok: true, payment_url, registration_id: regId };
    }

    // Cas PayPal
    if (payment_method === 'paypal' && camp.price_amount_usd) {
      try {
        const { createPayPalOrder } = await import('@/lib/payments/paypal');
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
        const returnUrl = `${siteUrl}/fr/paiement/paypal/camp/${regId}`;
        const cancelUrl = `${siteUrl}/fr/paiement/paypal/camp/${regId}?cancelled=1`;

        const order = await createPayPalOrder({
          amount: Number(camp.price_amount_usd),
          currency: 'USD',
          description: `Camp — ${camp.title_fr ?? 'RESA'}`,
          referenceId: regId,
          returnUrl,
          cancelUrl
        });

        await supabase
          .from('camp_registrations')
          .update({
            payment_provider_id: order.id,
            payment_token: order.id,
            payment_reference: null,
            payment_amount: Number(camp.price_amount_usd),
            payment_currency: 'USD',
            payment_link_sent_at: new Date().toISOString()
          })
          .eq('id', regId);

        payment_url = order.approveUrl;
      } catch (err: any) {
        console.error('[Camp Reg] ❌ PayPal error:', err);
        await supabase
          .from('camp_registrations')
          .update({
            admin_notes: `⚠️ Erreur PayPal : ${err.message}`,
            payment_status: 'failed'
          })
          .eq('id', regId);
        const { sendCampFailureEmails } = await import('@/lib/camp-emails');
        await sendCampFailureEmails(regId, 'error');
        return { ok: true, registration_id: regId };
      }

      return { ok: true, payment_url, registration_id: regId };
    }

        // ═══ Cas "Stripe" ═══
    if (payment_method === 'stripe') {
      try {
        const { createStripeSession } = await import('@/lib/payments/stripe');

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
        const returnUrl = `${siteUrl}/fr/paiement/stripe/return`;
        const cancelUrl = `${siteUrl}/fr/paiement/stripe/return?cancelled=1`;

        const amount = camp.price_amount_usd
          ? Number(camp.price_amount_usd)
          : camp.price_amount ?? 0;

        const currency = camp.price_amount_usd ? 'USD' : 'XOF';

        const session = await createStripeSession({
          amount,
          currency,
          title: `Camp — ${camp.title_fr ?? 'RESA'}`,
          customerEmail: parent_email,
          customerName: parent_name,
          requestId: regId,
          requestType: 'camp',
          returnUrl,
          cancelUrl
        });

        await supabase
          .from('camp_registrations')
          .update({
            payment_provider_id: session.sessionId,
            payment_token: session.sessionId,
            payment_reference: null,
            payment_amount: Math.round(amount),
            payment_currency: currency,
            payment_link_sent_at: new Date().toISOString()
          })
          .eq('id', regId);

        payment_url = session.url!;
      } catch (err: any) {
        console.error('[Camp Reg] ❌ Stripe error:', err);
        await supabase
          .from('camp_registrations')
          .update({
            admin_notes: `⚠️ Erreur Stripe : ${err.message}`,
            payment_status: 'failed'
          })
          .eq('id', regId);
        const { sendCampFailureEmails } = await import('@/lib/camp-emails');
        await sendCampFailureEmails(regId, 'error');
        return { ok: true, registration_id: regId };
      }

      return { ok: true, payment_url, registration_id: regId };
    }

    return { error: 'Mode de paiement invalide.' };
  } catch (err: any) {
    console.error('[Camp Reg] ❌ Erreur globale:', err);
    return { error: err.message ?? 'Erreur inconnue' };
  }
}