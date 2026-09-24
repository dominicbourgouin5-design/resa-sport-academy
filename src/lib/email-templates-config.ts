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

// ─── Templates TRAINING ─────────────────────────────────────
export const TRAINING_TEMPLATES: TrainingEmailTemplate[] = [
  {
    id: 'acknowledge',
    label: '✓ Accusé de réception',
    subject: 'Nous avons bien reçu votre demande — RESA',
    body: `Bonjour {{parent_name}},

Nous avons bien reçu votre demande de réservation{{program_line}}.

Notre équipe revient vers vous sous 24 heures pour finaliser les détails (créneau, coach, lieu).

À très bientôt,
L'équipe RESA Sport Academy`,
    targetStatus: 'contacted'
  },
  {
    id: 'confirm_slot',
    label: '📅 Confirmation de créneau',
    subject: 'Votre séance RESA est confirmée',
    body: `Bonjour {{parent_name}},

Votre séance{{program_line}} est confirmée.

📅 Date : (à préciser)
⏰ Heure : (à préciser)
📍 Lieu : (à préciser)
🧑‍🏫 Coach : {{preferred_coach}}

Nous avons hâte de vous voir sur le terrain.

L'équipe RESA Sport Academy`,
    targetStatus: 'booked'
  },
  {
    id: 'waitlist',
    label: '⏳ Liste d\'attente',
    subject: 'Votre demande est en liste d\'attente',
    body: `Bonjour {{parent_name}},

Votre demande{{program_line}} est momentanément en liste d'attente.

Nous vous recontactons dès qu'un créneau se libère. Merci de votre patience.

L'équipe RESA Sport Academy`,
    targetStatus: 'pending'
  },
  {
    id: 'cancelled',
    label: '✕ Annulation',
    subject: 'Annulation de votre demande de réservation',
    body: `Bonjour {{parent_name}},

Nous sommes au regret de vous informer que votre demande{{program_line}} n'a pas pu être honorée.

N'hésitez pas à nous contacter pour explorer d'autres options.

L'équipe RESA Sport Academy`,
    targetStatus: 'cancelled'
  }
];

// ─── Templates INSCRIPTIONS ─────────────────────────────────
export const REGISTRATION_TEMPLATES: RegistrationEmailTemplate[] = [
  {
    id: 'reviewing',
    label: '👀 En cours d\'examen',
    subject: 'Votre inscription est en cours d\'examen',
    body: `Bonjour {{parent_name}},

Nous avons bien reçu votre demande{{school_or_player_line}}.

Notre équipe étudie actuellement votre dossier et revient vers vous très prochainement.

L'équipe RESA Sport Academy`,
    targetStatus: 'reviewing'
  },
  {
    id: 'approved',
    label: '✅ Inscription acceptée',
    subject: 'Votre inscription est acceptée — RESA',
    body: `Bonjour {{parent_name}},

Excellente nouvelle : votre demande{{school_or_player_line}} est acceptée !

Nous revenons vers vous très vite pour les étapes pratiques (calendrier, réunion, règles).

Bienvenue dans la famille RESA.

L'équipe RESA Sport Academy`,
    targetStatus: 'approved'
  },
  {
    id: 'waitlist',
    label: '⏳ Liste d\'attente',
    subject: 'Votre inscription est en liste d\'attente',
    body: `Bonjour {{parent_name}},

Votre demande{{school_or_player_line}} a été placée en liste d'attente.

Nous vous recontacterons dès qu'une place se libère.

L'équipe RESA Sport Academy`,
    targetStatus: 'reviewing'
  },
  {
    id: 'rejected',
    label: '✕ Inscription refusée',
    subject: 'Suite donnée à votre inscription',
    body: `Bonjour {{parent_name}},

Après étude de votre dossier, nous ne sommes malheureusement pas en mesure de donner une suite favorable à votre demande{{school_or_player_line}}.

Nous vous remercions de votre intérêt et vous invitons à nous recontacter pour de prochaines sessions.

L'équipe RESA Sport Academy`,
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