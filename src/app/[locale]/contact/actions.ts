'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email';
import {
  trainingRequestParentConfirmation,
  trainingRequestAdminNotification,
  otherRequestParentConfirmation,
  otherRequestAdminNotification
} from '@/lib/email-templates';
import { notifyAdmins } from '@/lib/notify-admins';

export type ContactFormState = {
  error?: string;
  ok?: boolean;
} | null;

export async function sendTrainingRequest(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const program_slug   = String(formData.get('program_slug') ?? '').trim() || null;
  const program_title  = String(formData.get('program_title') ?? '').trim() || null;
  const parent_name    = String(formData.get('parent_name') ?? '').trim();
  const parent_email   = String(formData.get('parent_email') ?? '').trim();
  const parent_phone   = String(formData.get('parent_phone') ?? '').trim() || null;
  const player_name    = String(formData.get('player_name') ?? '').trim() || null;
  const player_age_raw = String(formData.get('player_age') ?? '').trim();
  const player_age     = player_age_raw ? Number(player_age_raw) : null;
  const player_level   = String(formData.get('player_level') ?? '').trim() || null;
  const region         = String(formData.get('region') ?? '').trim() || null;
  const preferred_coach = String(formData.get('preferred_coach') ?? '').trim() || null;
  const availability   = String(formData.get('availability') ?? '').trim() || null;
  const message        = String(formData.get('message') ?? '').trim() || null;

  // ─── Détection "Autre demande" ───
  const isOther = program_slug === '__other__' || program_slug === 'other';
  // Extrait l'objet réel depuis "Autre — Partenariat"
  const otherSubject = isOther && program_title
    ? program_title.replace(/^Autre\s*—\s*/i, '').trim() || 'Demande générale'
    : null;

  // ─── Validations ───
  if (!parent_name || !parent_email) {
    return { error: 'Nom et email sont obligatoires.' };
  }
  if (!/^\S+@\S+\.\S+$/.test(parent_email)) {
    return { error: 'Adresse email invalide.' };
  }
  if (isOther && !otherSubject) {
    return { error: "Merci de préciser l'objet de votre demande." };
  }

  // ─── Insert DB ───
  const supabase = createAdminClient();
  const { data: inserted, error } = await supabase
    .from('training_requests')
    .insert({
      program_slug: isOther ? 'other' : program_slug,
      program_title: isOther ? otherSubject : program_title,
      parent_name,
      parent_email,
      parent_phone,
      player_name: isOther ? null : player_name,
      player_age: isOther ? null : player_age,
      player_level: isOther ? null : player_level,
      region: isOther ? null : region,
      preferred_coach: isOther ? null : preferred_coach,
      availability: isOther ? null : availability,
      message,
      status: 'pending'
    })
    .select('id')
    .single();

  if (error) {
    console.error('sendTrainingRequest error:', error);
    return { error: 'Une erreur est survenue. Merci de réessayer.' };
  }

  const requestId = inserted?.id ?? '';
  const adminEmail =
    process.env.BREVO_SENDER_EMAIL ?? 'contact@cataria-systems.com';

  // ─── 1) Email de confirmation au demandeur ───
  try {
    const tpl = isOther
      ? otherRequestParentConfirmation({
          parentName: parent_name,
          subject: otherSubject!
        })
      : trainingRequestParentConfirmation({
          parentName: parent_name,
          programTitle: program_title,
          playerName: player_name,
          playerAge: player_age,
          region,
          availability
        });

    await sendEmail({
      to: [{ email: parent_email, name: parent_name }],
      subject: tpl.subject,
      htmlContent: tpl.htmlContent,
      replyTo: { email: adminEmail, name: 'RESA Sport Academy' }
    });
  } catch (err) {
    console.error('[Email] parent confirmation error:', err);
  }

  // ─── 2) Email de notification admin ───
  try {
    const tpl = isOther
      ? otherRequestAdminNotification({
          parentName: parent_name,
          parentEmail: parent_email,
          parentPhone: parent_phone,
          subject: otherSubject!,
          message,
          requestId
        })
      : trainingRequestAdminNotification({
          parentName: parent_name,
          parentEmail: parent_email,
          parentPhone: parent_phone,
          programTitle: program_title,
          playerName: player_name,
          playerAge: player_age,
          playerLevel: player_level,
          region,
          preferredCoach: preferred_coach,
          availability,
          message,
          requestId
        });

    await sendEmail({
      to: [{ email: adminEmail, name: 'RESA Admin' }],
      subject: tpl.subject,
      htmlContent: tpl.htmlContent,
      replyTo: { email: parent_email, name: parent_name }
    });
  } catch (err) {
    console.error('[Email] admin notification error:', err);
  }

  // ─── 3) Notification in-app aux admins ───
  try {
    await notifyAdmins({
      type: 'training_request',
      title: isOther
        ? `Nouvelle demande — ${otherSubject}`
        : `Nouvelle réservation training`,
      body: isOther
        ? `${parent_name} — ${otherSubject}`
        : `${parent_name}${program_title ? ` — ${program_title}` : ''}`,
      link: '/admin/demandes-training'
    });
  } catch (err) {
    console.error('[Notif] admin notification error:', err);
  }

  return { ok: true };
}