// src/lib/email-templates.ts

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

// ═══════════════════════════════════════════════════════════
// LAYOUT HTML COMMUN
// ═══════════════════════════════════════════════════════════
function layout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F4F6FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F6FA;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(10,31,68,.08);">
          <tr>
            <td style="background:#0A1F44;padding:32px;text-align:center;">
              <div style="display:inline-block;background:#fff;border-radius:50%;padding:8px;margin-bottom:12px;">
                <img src="https://resa-preview.cataria-systems.com/favicon-96x96.png" alt="RESA" width="40" height="40" style="display:block;">
              </div>
              <div style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">
                RESA SPORT ACADEMY
              </div>
              <div style="color:rgba(255,255,255,.5);font-size:10px;font-weight:700;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">
                Ligue Scolaire Primaire
              </div>
            </td>
          </tr>
          <tr><td style="height:4px;background:linear-gradient(90deg,#DC2626,#1E3A8A,#DC2626);"></td></tr>
          <tr>
            <td style="padding:40px 32px;color:#0F172A;font-size:15px;line-height:1.7;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background:#F4F6FA;padding:24px 32px;text-align:center;color:#64748B;font-size:12px;line-height:1.6;">
              <div style="font-weight:700;color:#0A1F44;margin-bottom:4px;">RESA Sport Academy</div>
              <div>Abidjan, Côte d'Ivoire · Saison 2027</div>
              <div style="margin-top:12px;font-size:11px;">
                Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════
// EMAIL 1 — Confirmation inscription école
// ═══════════════════════════════════════════════════════════
export function schoolRegistrationConfirmation(data: {
  contactName: string;
  schoolName: string;
  categories: string[];
}) {
  const categories = data.categories.join(', ') || 'U7, U9, U11';

  return {
    subject: `🙌 Bienvenue ${data.schoolName} — RESA Sport Academy`,
    htmlContent: layout(`
      <h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 16px;">
        Bonjour ${data.contactName} 👋
      </h1>

      <p style="font-size:16px;">
        Quelle belle nouvelle ! Nous avons bien reçu votre demande d'inscription pour <strong>${data.schoolName}</strong> — et nous en sommes vraiment ravis 🙏
      </p>

      <div style="background:#F4F6FA;border-left:4px solid #DC2626;padding:16px 20px;border-radius:8px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#DC2626;margin-bottom:8px;">
          Récapitulatif
        </div>
        <div style="font-size:14px;">
          <div><strong>Établissement :</strong> ${data.schoolName}</div>
          <div style="margin-top:6px;"><strong>Catégories :</strong> ${categories}</div>
        </div>
      </div>

      <p><strong>Et maintenant ?</strong> Rien à faire de votre côté 😊</p>
      <ol style="padding-left:20px;margin:12px 0;">
        <li>Notre équipe étudie votre dossier avec attention</li>
        <li>Nous vous recontactons sous <strong>48 h</strong> par téléphone ou WhatsApp</li>
        <li>On confirme ensemble la place de votre école 🎉</li>
      </ol>

      <p style="margin-top:24px;">
        Une question en attendant ? On est joignables sur WhatsApp ou par email à
        <a href="mailto:contact@resasportacademy.ci" style="color:#DC2626;">contact@resasportacademy.ci</a>.
      </p>

      <div style="margin-top:32px;text-align:center;">
        <a href="https://wa.me/2250700000000" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
          💬 Parler à l'équipe sur WhatsApp
        </a>
      </div>

      <p style="margin-top:32px;">À très vite,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>
    `)
  };
}

// ═══════════════════════════════════════════════════════════
// EMAIL 2 — Confirmation détection individuelle
// ═══════════════════════════════════════════════════════════
export function individualRegistrationConfirmation(data: {
  contactName: string;
  playerName: string;
  position?: string;
}) {
  return {
    subject: `🙌 Bienvenue ${data.playerName} — RESA Sport Academy`,
    htmlContent: layout(`
      <h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 16px;">
        Bonjour ${data.contactName} 👋
      </h1>

      <p style="font-size:16px;">
        Super nouvelle ! Nous avons bien reçu l'inscription de <strong>${data.playerName}</strong> pour les sessions de détection RESA Sport Academy 🙏
      </p>

      <div style="background:#F4F6FA;border-left:4px solid #1E3A8A;padding:16px 20px;border-radius:8px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#1E3A8A;margin-bottom:8px;">
          Récapitulatif
        </div>
        <div style="font-size:14px;">
          <div><strong>Enfant :</strong> ${data.playerName}</div>
          ${data.position ? `<div style="margin-top:6px;"><strong>Poste :</strong> ${data.position}</div>` : ''}
        </div>
      </div>

      <p>
        Nous vous contacterons très vite avec les <strong>dates et lieux</strong> des prochaines sessions. D'ici là, dites à ${data.playerName} de préparer ses crampons — ça va être top 💪
      </p>

      <div style="margin-top:32px;text-align:center;">
        <a href="https://wa.me/2250700000000" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
          💬 Une question ? WhatsApp
        </a>
      </div>

      <p style="margin-top:32px;">À très vite,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>
    `)
  };
}

// ═══════════════════════════════════════════════════════════
// EMAIL 3 — Notification admin nouvelle inscription
// ═══════════════════════════════════════════════════════════
export function adminNewRegistrationNotification(data: {
  type: 'school' | 'individual';
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  schoolName?: string;
  playerName?: string;
}) {
  const isSchool = data.type === 'school';

  return {
    subject: `📥 Nouvelle inscription ${isSchool ? 'école' : 'individuelle'} — ${isSchool ? data.schoolName : data.playerName}`,
    htmlContent: layout(`
      <h1 style="font-size:22px;font-weight:900;color:#0A1F44;margin:0 0 16px;">
        🎉 Nouvelle inscription reçue
      </h1>

      <p style="color:#64748B;">
        Bonne nouvelle, une nouvelle demande vient d'arriver sur le site. À traiter sous peu 💪
      </p>

      <div style="background:#F4F6FA;border-radius:12px;padding:20px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#DC2626;margin-bottom:12px;">
          Contact
        </div>
        <div style="font-size:14px;line-height:2;">
          <div><strong>Nom :</strong> ${data.contactName}</div>
          <div><strong>Téléphone :</strong> <a href="tel:${data.contactPhone}" style="color:#DC2626;">${data.contactPhone}</a></div>
          ${data.contactEmail ? `<div><strong>Email :</strong> ${data.contactEmail}</div>` : ''}
        </div>
      </div>

      <div style="background:#F4F6FA;border-radius:12px;padding:20px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#1E3A8A;margin-bottom:12px;">
          ${isSchool ? 'Établissement' : 'Enfant'}
        </div>
        <div style="font-size:14px;">
          ${isSchool ? `<div><strong>École :</strong> ${data.schoolName}</div>` : `<div><strong>Enfant :</strong> ${data.playerName}</div>`}
        </div>
      </div>

      <div style="margin-top:32px;text-align:center;">
        <a href="https://resa-preview.cataria-systems.com/admin/inscriptions" style="display:inline-block;background:#0A1F44;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
          Voir dans l'admin →
        </a>
      </div>
    `)
  };
}

// ═══════════════════════════════════════════════════════════
// EMAIL 4 — Confirmation réservation training (au parent)
// ═══════════════════════════════════════════════════════════
export function trainingRequestParentConfirmation(data: {
  parentName: string;
  programTitle?: string | null;
  playerName?: string | null;
  playerAge?: number | null;
  region?: string | null;
  availability?: string | null;
}) {
  const details: string[] = [];
  if (data.programTitle) {
    details.push(`<div><strong>Programme :</strong> ${data.programTitle}</div>`);
  }
  if (data.playerName) {
    details.push(
      `<div style="margin-top:6px;"><strong>Joueur :</strong> ${data.playerName}${
        data.playerAge ? ` · ${data.playerAge} ans` : ''
      }</div>`
    );
  }
  if (data.region) {
    const regionLabel = data.region === 'usa' ? '🇺🇸 USA' : '🇨🇮 Africa';
    details.push(`<div style="margin-top:6px;"><strong>Région :</strong> ${regionLabel}</div>`);
  }
  if (data.availability) {
    details.push(`<div style="margin-top:6px;"><strong>Disponibilités :</strong> ${data.availability}</div>`);
  }

  return {
    subject: `🙌 Bien reçu ${data.parentName} — on s'occupe de votre séance`,
    htmlContent: layout(`
      <h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 16px;">
        Bonjour ${data.parentName} 👋
      </h1>

      <p style="font-size:16px;">
        Merci pour votre confiance 🙏 Nous avons bien reçu votre demande de réservation pour une séance de <strong>Private Training</strong>.
      </p>

      ${
        details.length > 0
          ? `
        <div style="background:#F4F6FA;border-left:4px solid #DC2626;padding:16px 20px;border-radius:8px;margin:24px 0;">
          <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#DC2626;margin-bottom:8px;">
            Récapitulatif
          </div>
          <div style="font-size:14px;line-height:1.7;">
            ${details.join('')}
          </div>
        </div>
      `
          : ''
      }

      <p><strong>Et maintenant ?</strong> Rien à faire de votre côté 😊</p>
      <ol style="padding-left:20px;margin:12px 0;">
        <li>Notre équipe étudie votre demande</li>
        <li>On vous recontacte sous <strong>24 h</strong> par email ou WhatsApp</li>
        <li>On cale ensemble le créneau et le coach</li>
        <li>Première séance sur le terrain 💪</li>
      </ol>

      <p style="margin-top:24px;">
        Une question ? Écrivez-nous sur WhatsApp ou par email à
        <a href="mailto:contact@resasportacademy.ci" style="color:#DC2626;">contact@resasportacademy.ci</a>. On adore papoter avec les familles 😊
      </p>

      <div style="margin-top:32px;text-align:center;">
        <a href="https://wa.me/2250700000000" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
          💬 Parler à l'équipe
        </a>
      </div>

      <p style="margin-top:32px;">À très vite sur le terrain,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>
    `)
  };
}

// ═══════════════════════════════════════════════════════════
// EMAIL 5 — Notification admin nouvelle réservation
// ═══════════════════════════════════════════════════════════
export function trainingRequestAdminNotification(data: {
  parentName: string;
  parentEmail: string;
  parentPhone?: string | null;
  programTitle?: string | null;
  playerName?: string | null;
  playerAge?: number | null;
  playerLevel?: string | null;
  region?: string | null;
  preferredCoach?: string | null;
  availability?: string | null;
  message?: string | null;
  requestId: string;
}) {
  const rows: string[] = [];
  if (data.programTitle) {
    rows.push(`<div><strong>Programme :</strong> ${data.programTitle}</div>`);
  }
  if (data.playerName || data.playerAge || data.playerLevel) {
    rows.push(
      `<div style="margin-top:6px;"><strong>Joueur :</strong> ${data.playerName ?? '—'}${
        data.playerAge ? ` · ${data.playerAge} ans` : ''
      }${data.playerLevel ? ` · ${data.playerLevel}` : ''}</div>`
    );
  }
  if (data.region) {
    rows.push(
      `<div style="margin-top:6px;"><strong>Région :</strong> ${
        data.region === 'usa' ? '🇺🇸 USA' : '🇨🇮 Africa'
      }</div>`
    );
  }
  if (data.preferredCoach) {
    rows.push(`<div style="margin-top:6px;"><strong>Coach souhaité :</strong> ${data.preferredCoach}</div>`);
  }
  if (data.availability) {
    rows.push(`<div style="margin-top:6px;"><strong>Disponibilités :</strong> ${data.availability}</div>`);
  }

  return {
    subject: `📥 Nouvelle réservation training${data.programTitle ? ` — ${data.programTitle}` : ''}`,
    htmlContent: layout(`
      <h1 style="font-size:22px;font-weight:900;color:#0A1F44;margin:0 0 16px;">
        🎉 Nouvelle demande de réservation
      </h1>

      <p style="color:#64748B;">
        Une nouvelle demande de Private Training vient d'arriver. À traiter avec le sourire 😊
      </p>

      <div style="background:#F4F6FA;border-radius:12px;padding:20px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#DC2626;margin-bottom:12px;">
          Contact parent / tuteur
        </div>
        <div style="font-size:14px;line-height:2;">
          <div><strong>Nom :</strong> ${data.parentName}</div>
          <div><strong>Email :</strong> <a href="mailto:${data.parentEmail}" style="color:#DC2626;">${data.parentEmail}</a></div>
          ${
            data.parentPhone
              ? `<div><strong>Téléphone :</strong> <a href="tel:${data.parentPhone}" style="color:#DC2626;">${data.parentPhone}</a></div>`
              : ''
          }
        </div>
      </div>

      ${
        rows.length > 0
          ? `
        <div style="background:#F4F6FA;border-radius:12px;padding:20px;margin:24px 0;">
          <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#1E3A8A;margin-bottom:12px;">
            Réservation
          </div>
          <div style="font-size:14px;line-height:1.7;">
            ${rows.join('')}
          </div>
        </div>
      `
          : ''
      }

      ${
        data.message
          ? `
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin:24px 0;">
          <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#64748B;margin-bottom:8px;">
            Message du parent
          </div>
          <div style="font-size:14px;line-height:1.7;color:#334155;white-space:pre-line;">
            ${data.message}
          </div>
        </div>
      `
          : ''
      }

      <div style="margin-top:32px;text-align:center;">
        <a href="https://resa-preview.cataria-systems.com/admin/demandes-training" style="display:inline-block;background:#0A1F44;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
          Traiter la demande →
        </a>
      </div>

      <div style="margin-top:20px;text-align:center;font-size:11px;color:#94A3B8;">
        Référence : ${data.requestId.slice(0, 8).toUpperCase()}
      </div>
    `)
  };
}