// ─── Types de statuts séparés par domaine ───────────────────
export type TrainingStatus = 'pending' | 'contacted' | 'booked' | 'cancelled';
export type RegistrationStatus = 'pending' | 'reviewing' | 'approved' | 'rejected';

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

// ─── Templates TRAINING (wizard admin → parent) ─────────────
export const TRAINING_TEMPLATES: TrainingEmailTemplate[] = [
  {
    id: 'acknowledge',
    label: '✓ Accusé de réception',
    subject: 'Bien reçu ! On s\'occupe de vous 💙',
    body: `Bonjour {{parent_name}},

Un grand merci pour votre confiance 🙏

Nous avons bien reçu votre demande de réservation{{program_line}} et nous en sommes vraiment ravis.

Notre équipe vous recontacte sous 24 heures pour caler ensemble le créneau, le coach et le lieu. D'ici là, n'hésitez pas à nous écrire si vous avez la moindre question.

À très vite sur le terrain ⚽
L'équipe RESA Sport Academy`,
    targetStatus: 'contacted'
  },
  {
    id: 'confirm_slot',
    label: '📅 Confirmation de créneau',
    subject: 'C\'est calé — votre séance RESA est confirmée 🎉',
    body: `Bonjour {{parent_name}},

Excellente nouvelle : votre séance{{program_line}} est officiellement confirmée 🎉

📅 Date : (à préciser)
⏰ Heure : (à préciser)
📍 Lieu : (à préciser)
🧑‍🏫 Coach : {{preferred_coach}}

On a hâte de vous voir fouler le terrain. N'oubliez pas la gourde et les crampons 😉

À très vite,
L'équipe RESA Sport Academy`,
    targetStatus: 'booked'
  },
  {
    id: 'waitlist',
    label: '⏳ Liste d\'attente',
    subject: 'Petite attente — on ne vous oublie pas 💙',
    body: `Bonjour {{parent_name}},

Merci pour votre patience 🙏

Votre demande{{program_line}} est momentanément en liste d'attente — les créneaux partent vite en ce moment.

Bonne nouvelle : dès qu'une place se libère, vous êtes parmi les premiers prévenus. On vous recontacte sans faute.

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

Ce n'est qu'un au revoir — on serait ravis de vous accueillir sur une prochaine session. Répondez à cet email ou écrivez-nous sur WhatsApp, on trouvera ensemble la meilleure option.

À très bientôt,
L'équipe RESA Sport Academy ⚽`,
    targetStatus: 'cancelled'
  }
];

// ─── Templates INSCRIPTIONS (wizard admin → parent) ─────────
export const REGISTRATION_TEMPLATES: RegistrationEmailTemplate[] = [
  {
    id: 'reviewing',
    label: '👀 En cours d\'examen',
    subject: 'Bien reçu — on étudie votre dossier avec attention',
    body: `Bonjour {{parent_name}},

Merci beaucoup pour votre inscription 🙏

Nous avons bien reçu votre demande{{school_or_player_line}} et nous en sommes vraiment heureux.

Notre équipe prend le temps d'étudier votre dossier avec attention et revient vers vous très prochainement. D'ici là, on reste disponibles si vous avez la moindre question.

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

Bienvenue dans la famille RESA,
L'équipe RESA Sport Academy`,
    targetStatus: 'approved'
  },
  {
    id: 'waitlist',
    label: '⏳ Liste d\'attente',
    subject: 'Petite attente — vous êtes sur la bonne liste 💙',
    body: `Bonjour {{parent_name}},

Merci pour votre patience 🙏

Votre demande{{school_or_player_line}} a été placée en liste d'attente — les places sont limitées et partent vite.

Bonne nouvelle : vous êtes bien enregistré, et nous vous recontacterons dès qu'une place se libère. Vous serez parmi les premiers prévenus.

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

Bien à vous,
L'équipe RESA Sport Academy ⚽`,
    targetStatus: 'rejected'
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