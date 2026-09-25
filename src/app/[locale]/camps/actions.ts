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
  payment_choice: 'later' | 'online';
  locale?: string;
}): Promise<CampRegistrationResult> {
  try {
    const {
      camp_id, parent_name, parent_email, parent_phone, parent_country,
      player_name, player_age, player_birth_date, notes,
      payment_choice, locale = 'fr'
    } = payload;

    if (!camp_id) return { error: 'Identifiant camp manquant.' };
    if (!parent_name || !parent_email || !player_name) {
      return { error: 'Champs obligatoires manquants.' };
    }

    const supabase = createAdminClient();

    // 1) Lookup camp
    const { data: camp, error: campErr } = await supabase
      .from('camps')
      .select('id, slug, title_fr, title_en, price_amount, price_fr, date_start, location, currency')
      .eq('id', camp_id)
      .single();

    if (campErr || !camp) {
      return { error: campErr?.message ?? 'Camp introuvable.' };
    }

    // 2) Insert registration — AJOUT de parent_country
    const { data: registration, error: insertErr } = await supabase
      .from('camp_registrations')
      .insert({
        camp_id,
        parent_name,
        parent_email,
        parent_phone: parent_phone || null,
        parent_country: parent_country || 'ci',   // ← NOUVEAU
        player_name,
        player_age: player_age ? Number(player_age) : null,
        player_birth_date: player_birth_date || null,
        notes: notes || null,
        payment_status: 'pending',
        payment_method: payment_choice === 'online' ? 'fedapay' : 'manual',
        status: 'new'
      })
      .select('id')
      .single();

    if (insertErr || !registration) {
      return { error: `Erreur enregistrement : ${insertErr?.message ?? 'inconnue'}` };
    }

    const regId = registration.id;
    let payment_url: string | undefined;

    // 3) Cas "paiement en ligne" → FedaPay
    if (payment_choice === 'online' && camp.price_amount) {
      try {
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
        const callbackUrl = `${siteUrl}/${locale}/paiement/camp/${regId}`;

        const nameParts = parent_name.trim().split(' ');
        const firstname = nameParts[0] || parent_name;
        const lastname = nameParts.slice(1).join(' ') || firstname;

        const tx = await createFedaPayTransaction({
          amount: camp.price_amount,
          description: `Inscription camp — ${camp.title_fr ?? 'RESA'}`,
          callbackUrl,
          customer: {
            firstname,
            lastname,
            email: parent_email,
            phone: parent_phone || undefined,
            country: parent_country || 'ci'
          },
          currency: camp.currency ?? 'XOF',
          metadata: { registration_id: regId, camp_slug: camp.slug }
        });

        const token = await generatePaymentToken(tx.id);

        await supabase
          .from('camp_registrations')
          .update({
            payment_provider_id: String(tx.id),
            payment_token: token,
            payment_reference: tx.reference ?? null
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

        return {
          ok: true,
          registration_id: regId,
          error: undefined
        };
      }

      return { ok: true, payment_url, registration_id: regId };
    }

    // 4) Cas "réserver sans payer" → emails immédiats
    await sendCampSuccessEmails(regId);

    return { ok: true, registration_id: regId };
  } catch (err: any) {
    console.error('[Camp Reg] ❌ Erreur globale:', err);
    return { error: err.message ?? 'Erreur inconnue' };
  }
}