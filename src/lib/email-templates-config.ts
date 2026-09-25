// ─── Types de statuts séparés par domaine ───────────────────
export type TrainingStatus = 'pending' | 'contacted' | 'booked' | 'cancelled';
export type RegistrationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';
export type CampStatus = 'new' | 'contacted' | 'confirmed' | 'cancelled';

// ─── Types génériques ───────────────────────────────────────
export type TrainingEmailTemplate = {
  id: string;
  label: string;
  subject: string;
  body: string;
  targetStatus?: TrainingStatus;
};

export type RegistrationEmailTemplate = {
  id: string;
  label: string;
  subject: string;
  body: string;
  targetStatus?: RegistrationStatus;
};

export type CampEmailTemplate = {
  id: string;
  label: string;
  subject: string;
  body: string;
  targetStatus?: CampStatus;
};

// ─── Templates TRAINING (wizard admin → parent) ─────────────
export const TRAINING_TEMPLATES: TrainingEmailTemplate[] = [
  {
    id: 'acknowledge',
    label: '✓ Accusé de réception',
    subject: "Bien reçu ! On s'occupe de vous 💙",
    body: `Bonjour {{parent_name}},

Un grand merci pour votre confiance 🙏

Nous avons bien reçu votre demande de réservation{{program_line}} et nous en sommes vraiment ravis.

Notre équipe vous recontacte sous 24 heures pour caler ensemble le créneau, le coach et le lieu.

Une question ? Répondez directement à cet email — on vous répond avec plaisir.

À très vite sur le terrain ⚽
L'équipe RESA Sport Academy`,
    targetStatus: 'contacted'
  },
  {
    id: 'confirm_slot',
    label: '📅 Confirmation de créneau',
    subject: "C'est calé — votre séance RESA est confirmée 🎉",
    body: `Bonjour {{parent_name}},

Excellente nouvelle : votre séance{{program_line}} est officiellement confirmée 🎉

📅 Date : (à préciser)
⏰ Heure : (à préciser)
📍 Lieu : (à préciser)
🧑‍🏫 Coach : {{preferred_coach}}

On a hâte de vous voir fouler le terrain. N'oubliez pas la gourde et les crampons 😉

Une question avant la séance ? Répondez directement à cet email.

À très vite,
L'équipe RESA Sport Academy`,
    targetStatus: 'booked'
  },
  {
    id: 'waitlist',
    label: "⏳ Liste d'attente",
    subject: 'Petite attente — on ne vous oublie pas 💙',
    body: `Bonjour {{parent_name}},

Merci pour votre patience 🙏

Votre demande{{program_line}} est momentanément en liste d'attente — les créneaux partent vite en ce moment.

Bonne nouvelle : dès qu'une place se libère, vous êtes parmi les premiers prévenus. On vous recontacte sans faute.

Une question en attendant ? Répondez directement à cet email.

Merci encore pour votre confiance,
L'équipe RESA Sport Academy ⚽`,
    targetStatus: 'pending'
  },
  {
    id: 'cancelled',
    label: '✕ Annulation',
    subject: 'On en reparle quand vous voulez 💙',
    body: `Bonjour {{parent_name}},

Nous sommes sincèrement désolés : votre demande{{program_line}} n'a malheureusement pas pu être honorée cette fois-ci.

Ce n'est qu'un au revoir — on serait ravis de vous accueillir sur une prochaine session.

Répondez directement à cet email ou écrivez-nous sur WhatsApp, on trouvera ensemble la meilleure option.

À très bientôt,
L'équipe RESA Sport Academy ⚽`,
    targetStatus: 'cancelled'
  }
];

// ─── Templates INSCRIPTIONS (wizard admin → parent) ─────────
export const REGISTRATION_TEMPLATES: RegistrationEmailTemplate[] = [
  {
    id: 'reviewing',
    label: "👀 En cours d'examen",
    subject: 'Bien reçu — on étudie votre dossier avec attention',
    body: `Bonjour {{parent_name}},

Merci beaucoup pour votre inscription 🙏

Nous avons bien reçu votre demande{{school_or_player_line}} et nous en sommes vraiment heureux.

Notre équipe prend le temps d'étudier votre dossier avec attention et revient vers vous très prochainement.

Une question en attendant ? Répondez directement à cet email — on reste disponibles.

À très vite,
L'équipe RESA Sport Academy ⚽`,
    targetStatus: 'reviewing'
  },
  {
    id: 'approved',
    label: '✅ Inscription acceptée',
    subject: 'Bienvenue dans la famille RESA ! 🎉',
    body: `Bonjour {{parent_name}},

Excellente nouvelle : votre demande{{school_or_player_line}} est acceptée ! 🎉

Toute l'équipe est ravie de vous accueillir. Nous revenons vers vous très vite avec les étapes pratiques : calendrier, réunion d'information, règles de la ligue.

En attendant, préparez les crampons — ça va être une belle saison 💪

Une question ? Répondez directement à cet email.

Bienvenue dans la famille RESA,
L'équipe RESA Sport Academy`,
    targetStatus: 'approved'
  },
  {
    id: 'waitlist',
    label: "⏳ Liste d'attente",
    subject: 'Petite attente — vous êtes sur la bonne liste 💙',
    body: `Bonjour {{parent_name}},

Merci pour votre patience 🙏

Votre demande{{school_or_player_line}} a été placée en liste d'attente — les places sont limitées et partent vite.

Bonne nouvelle : vous êtes bien enregistré, et nous vous recontacterons dès qu'une place se libère.

Une question en attendant ? Répondez directement à cet email.

Merci pour votre confiance,
L'équipe RESA Sport Academy ⚽`,
    targetStatus: 'reviewing'
  },
  {
    id: 'rejected',
    label: '✕ Inscription refusée',
    subject: 'Suite donnée à votre demande — merci pour votre confiance',
    body: `Bonjour {{parent_name}},

Merci sincèrement pour l'intérêt que vous portez à RESA Sport Academy.

Après étude attentive de votre dossier, nous ne sommes malheureusement pas en mesure de donner une suite favorable à votre demande{{school_or_player_line}} cette fois-ci. Nous en sommes désolés.

Ce n'est pas un adieu : nous vous invitons à nous recontacter pour de prochaines sessions — les portes restent grandes ouvertes 🙏

Si vous souhaitez échanger, répondez directement à cet email.

Bien à vous,
L'équipe RESA Sport Academy ⚽`,
    targetStatus: 'rejected'
  }
];

// ─── Templates CAMPS (wizard admin → parent) ────────────────
export const CAMP_TEMPLATES: CampEmailTemplate[] = [
  {
    id: 'acknowledge',
    label: '✓ Accusé de réception',
    subject: "Bien reçu ! On s'occupe de vous 💙",
    body: `Bonjour {{parent_name}},

Un grand merci pour votre confiance 🙏

Nous avons bien reçu l'inscription de {{player_line}} pour {{camp_title}} et nous en sommes vraiment ravis.

Notre équipe vous recontacte sous 48h pour finaliser les derniers détails (paiement, organisation, infos pratiques).

Une question ? Répondez directement à cet email — on vous répond avec plaisir.

À très vite sur le terrain ⚽
L'équipe RESA Sport Academy`,
    targetStatus: 'contacted'
  },
  {
    id: 'confirm',
    label: '✅ Confirmation d\'inscription',
    subject: "C'est confirmé — {{camp_title}} 🎉",
    body: `Bonjour {{parent_name}},

Excellente nouvelle : la place de {{player_line}} au {{camp_title}} est officiellement confirmée 🎉

📅 Date : {{date_line}}
📍 Lieu : {{location_line}}

On a hâte de vous voir sur le terrain ! Vous recevrez 7 jours avant l'événement toutes les infos pratiques (programme, horaires exacts, à apporter).

Une question ? Répondez directement à cet email.

À très vite,
L'équipe RESA Sport Academy`,
    targetStatus: 'confirmed'
  },
  {
    id: 'reminder_payment',
    label: '💳 Rappel de paiement',
    subject: 'Petit rappel — finalisez votre inscription 💳',
    body: `Bonjour {{parent_name}},

Petit rappel amical : la place de {{player_line}} au {{camp_title}} est encore en attente de paiement.

📅 Date : {{date_line}}
💰 Montant : {{amount_line}}

Pour finaliser votre inscription, répondez à cet email ou contactez-nous sur WhatsApp — on vous enverra un lien de paiement sécurisé.

Merci pour votre confiance,
L'équipe RESA Sport Academy ⚽`
    // Pas de targetStatus : action neutre
  },
  {
    id: 'cancelled',
    label: '✕ Annulation',
    subject: 'Suite donnée à votre inscription',
    body: `Bonjour {{parent_name}},

Nous sommes sincèrement désolés : l'inscription de {{player_line}} au {{camp_title}} n'a malheureusement pas pu être maintenue cette fois-ci.

Ce n'est qu'un au revoir — on serait ravis d'accueillir {{player_line}} sur une prochaine session.

Si vous souhaitez échanger, répondez directement à cet email ou écrivez-nous sur WhatsApp.

Bien à vous,
L'équipe RESA Sport Academy ⚽`,
    targetStatus: 'cancelled'
  }
];

// ─── Remplace les {{vars}} dans un template ─────────────────
export function fillTemplate(
  body: string,
  vars: Record<string, string | null | undefined>
): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = vars[key];
    return v ?? '';
  });
}