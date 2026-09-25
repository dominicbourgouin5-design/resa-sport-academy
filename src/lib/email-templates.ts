// src/lib/email-templates.ts
const CONTACT_EMAIL = 'contact@cataria-systems.com';

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
              <div style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">RESA SPORT ACADEMY</div>
              <div style="color:rgba(255,255,255,.5);font-size:10px;font-weight:700;letter-spacing:3px;margin-top:4px;text-transform:uppercase;">Ligue Scolaire Primaire</div>
            </td>
          </tr>
          <tr><td style="height:4px;background:linear-gradient(90deg,#DC2626,#1E3A8A,#DC2626);"></td></tr>
          <tr>
            <td style="padding:40px 32px;color:#0F172A;font-size:15px;line-height:1.7;">${content}</td>
          </tr>
          <tr>
            <td style="background:#F4F6FA;padding:24px 32px;text-align:center;color:#64748B;font-size:12px;line-height:1.6;">
              <div style="font-weight:700;color:#0A1F44;margin-bottom:4px;">RESA Sport Academy</div>
              <div>Abidjan, Côte d'Ivoire · Saison 2027</div>
              <div style="margin-top:12px;font-size:11px;">Cet email a été envoyé automatiquement. Vous pouvez y répondre directement.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function contactButtons(mailSubject: string, primaryLabel: string, primaryUrl: string) {
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(mailSubject)}`;
  const primaryIsWhatsapp = primaryUrl.includes('wa.me');

  return `
<div style="margin-top:28px;text-align:center;">
  <a href="${primaryUrl}" style="display:inline-block;background:#DC2626;color:#fff;padding:14px 30px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">${primaryLabel}</a>
</div>
<div style="margin-top:14px;text-align:center;">
  <a href="${mailto}" style="display:inline-block;background:#0A1F44;color:#fff;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">✉️ Répondre par email</a>
  ${primaryIsWhatsapp ? '' : `&nbsp;<a href="https://wa.me/2250700000000" style="display:inline-block;background:#25D366;color:#fff;padding:12px 26px;border-radius:999px;text-decoration:none;font-weight:700;font-size:13px;">💬 WhatsApp</a>`}
</div>
<p style="margin-top:14px;text-align:center;font-size:12px;color:#94A3B8;">Vous pouvez répondre directement à cet email ou nous joindre sur WhatsApp.</p>`;
}

// ── Email 1 : Confirmation inscription école ──
export function schoolRegistrationConfirmation(data: {
  contactName: string;
  schoolName: string;
  categories: string[];
}) {
  const categories = data.categories.join(', ') || 'U7, U9, U11';
  return {
    subject: `🙌 Bienvenue ${data.schoolName} — RESA Sport Academy`,
    htmlContent: layout(`
      <h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 16px;">Bonjour ${data.contactName} 👋</h1>
      <p style="font-size:16px;">Quelle belle nouvelle ! Nous avons bien reçu votre demande d'inscription pour <strong>${data.schoolName}</strong> — et nous en sommes vraiment ravis 🙏</p>
      <div style="background:#F4F6FA;border-left:4px solid #DC2626;padding:16px 20px;border-radius:8px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#DC2626;margin-bottom:8px;">Récapitulatif</div>
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
      <p style="margin-top:24px;">Une question en attendant ? Répondez à cet email ou écrivez-nous sur WhatsApp — on adore échanger.</p>
      ${contactButtons(`Question - ${data.schoolName}`, "Nous joindre", "https://wa.me/2250700000000")}
      <p style="margin-top:32px;">À très vite,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>
    `)
  };
}

// ── Email 2 : Confirmation détection individuelle ──
export function individualRegistrationConfirmation(data: {
  contactName: string;
  playerName: string;
  position?: string;
}) {
  return {
    subject: `🙌 Bienvenue ${data.playerName} — RESA Sport Academy`,
    htmlContent: layout(`
      <h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 16px;">Bonjour ${data.contactName} 👋</h1>
      <p style="font-size:16px;">Super nouvelle ! Nous avons bien reçu l'inscription de <strong>${data.playerName}</strong> pour les sessions de détection RESA Sport Academy 🙏</p>
      <div style="background:#F4F6FA;border-left:4px solid #1E3A8A;padding:16px 20px;border-radius:8px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#1E3A8A;margin-bottom:8px;">Récapitulatif</div>
        <div style="font-size:14px;">
          <div><strong>Enfant :</strong> ${data.playerName}</div>
          ${data.position ? `<div style="margin-top:6px;"><strong>Poste :</strong> ${data.position}</div>` : ''}
        </div>
      </div>
      <p>Nous vous contacterons très vite avec les <strong>dates et lieux</strong> des prochaines sessions. D'ici là, dites à ${data.playerName} de préparer ses crampons — ça va être top 💪</p>
      ${contactButtons(`Question - Détection ${data.playerName}`, "Nous joindre", "https://wa.me/2250700000000")}
      <p style="margin-top:32px;">À très vite,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>
    `)
  };
}

// ── Email 3 : Notification admin (inchangé) ──
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
      <h1 style="font-size:22px;font-weight:900;color:#0A1F44;margin:0 0 16px;">🎉 Nouvelle inscription reçue</h1>
      <p style="color:#64748B;">Bonne nouvelle, une nouvelle demande vient d'arriver sur le site. À traiter sous peu 💪</p>
      <div style="background:#F4F6FA;border-radius:12px;padding:20px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#DC2626;margin-bottom:12px;">Contact</div>
        <div style="font-size:14px;line-height:2;">
          <div><strong>Nom :</strong> ${data.contactName}</div>
          <div><strong>Téléphone :</strong> <a href="tel:${data.contactPhone}" style="color:#DC2626;">${data.contactPhone}</a></div>
          ${data.contactEmail ? `<div><strong>Email :</strong> ${data.contactEmail}</div>` : ''}
        </div>
      </div>
      <div style="background:#F4F6FA;border-radius:12px;padding:20px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#1E3A8A;margin-bottom:12px;">${isSchool ? 'Établissement' : 'Enfant'}</div>
        <div style="font-size:14px;">${isSchool ? `<div><strong>École :</strong> ${data.schoolName}</div>` : `<div><strong>Enfant :</strong> ${data.playerName}</div>`}</div>
      </div>
      <div style="margin-top:32px;text-align:center;">
        <a href="https://resa-preview.cataria-systems.com/admin/inscriptions" style="display:inline-block;background:#0A1F44;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">Voir dans l'admin →</a>
      </div>
    `)
  };
}

// ── Email 4 : Confirmation training (parent) ──
export function trainingRequestParentConfirmation(data: {
  parentName: string;
  programTitle?: string | null;
  playerName?: string | null;
  playerAge?: number | null;
  region?: string | null;
  availability?: string | null;
}) {
  const details: string[] = [];
  if (data.programTitle) details.push(`<div><strong>Programme :</strong> ${data.programTitle}</div>`);
  if (data.playerName) details.push(`<div style="margin-top:6px;"><strong>Joueur :</strong> ${data.playerName}${data.playerAge ? ` · ${data.playerAge} ans` : ''}</div>`);
  if (data.region) details.push(`<div style="margin-top:6px;"><strong>Région :</strong> ${data.region === 'usa' ? '🇺🇸 USA' : '🇨🇮 Africa'}</div>`);
  if (data.availability) details.push(`<div style="margin-top:6px;"><strong>Disponibilités :</strong> ${data.availability}</div>`);

  return {
    subject: `🙌 Bien reçu ${data.parentName} — on s'occupe de votre séance`,
    htmlContent: layout(`
      <h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 16px;">Bonjour ${data.parentName} 👋</h1>
      <p style="font-size:16px;">Merci pour votre confiance 🙏 Nous avons bien reçu votre demande de réservation pour une séance de <strong>Private Training</strong>.</p>
      ${details.length > 0 ? `
      <div style="background:#F4F6FA;border-left:4px solid #DC2626;padding:16px 20px;border-radius:8px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#DC2626;margin-bottom:8px;">Récapitulatif</div>
        <div style="font-size:14px;line-height:1.7;">${details.join('')}</div>
      </div>` : ''}
      <p><strong>Et maintenant ?</strong> Rien à faire de votre côté 😊</p>
      <ol style="padding-left:20px;margin:12px 0;">
        <li>Notre équipe étudie votre demande</li>
        <li>On vous recontacte sous <strong>24 h</strong> par email ou WhatsApp</li>
        <li>On cale ensemble le créneau et le coach</li>
        <li>Première séance sur le terrain 💪</li>
      </ol>
      <p style="margin-top:24px;">Une question ? Répondez à cet email ou écrivez-nous sur WhatsApp — on adore papoter avec les familles 😊</p>
      ${contactButtons(`Question - Réservation training`, "Nous joindre", "https://wa.me/2250700000000")}
      <p style="margin-top:32px;">À très vite sur le terrain,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>
    `)
  };
}

// ── Email 5 : Notification admin (training) ──
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
  if (data.programTitle) rows.push(`<div><strong>Programme :</strong> ${data.programTitle}</div>`);
  if (data.playerName || data.playerAge || data.playerLevel) {
    rows.push(`<div style="margin-top:6px;"><strong>Joueur :</strong> ${data.playerName ?? '—'}${data.playerAge ? ` · ${data.playerAge} ans` : ''}${data.playerLevel ? ` · ${data.playerLevel}` : ''}</div>`);
  }
  if (data.region) rows.push(`<div style="margin-top:6px;"><strong>Région :</strong> ${data.region === 'usa' ? '🇺🇸 USA' : '🇨🇮 Africa'}</div>`);
  if (data.preferredCoach) rows.push(`<div style="margin-top:6px;"><strong>Coach souhaité :</strong> ${data.preferredCoach}</div>`);
  if (data.availability) rows.push(`<div style="margin-top:6px;"><strong>Disponibilités :</strong> ${data.availability}</div>`);

  return {
    subject: `📥 Nouvelle réservation training${data.programTitle ? ` — ${data.programTitle}` : ''}`,
    htmlContent: layout(`
      <h1 style="font-size:22px;font-weight:900;color:#0A1F44;margin:0 0 16px;">🎉 Nouvelle demande de réservation</h1>
      <p style="color:#64748B;">Une nouvelle demande de Private Training vient d'arriver. À traiter avec le sourire 😊</p>
      <div style="background:#F4F6FA;border-radius:12px;padding:20px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#DC2626;margin-bottom:12px;">Contact parent / tuteur</div>
        <div style="font-size:14px;line-height:2;">
          <div><strong>Nom :</strong> ${data.parentName}</div>
          <div><strong>Email :</strong> <a href="mailto:${data.parentEmail}" style="color:#DC2626;">${data.parentEmail}</a></div>
          ${data.parentPhone ? `<div><strong>Téléphone :</strong> <a href="tel:${data.parentPhone}" style="color:#DC2626;">${data.parentPhone}</a></div>` : ''}
        </div>
      </div>
      ${rows.length > 0 ? `
      <div style="background:#F4F6FA;border-radius:12px;padding:20px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#1E3A8A;margin-bottom:12px;">Réservation</div>
        <div style="font-size:14px;line-height:1.7;">${rows.join('')}</div>
      </div>` : ''}
      ${data.message ? `
      <div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#64748B;margin-bottom:8px;">Message du parent</div>
        <div style="font-size:14px;line-height:1.7;color:#334155;white-space:pre-line;">${data.message}</div>
      </div>` : ''}
      <div style="margin-top:32px;text-align:center;">
        <a href="https://resa-preview.cataria-systems.com/admin/demandes-training" style="display:inline-block;background:#0A1F44;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">Traiter la demande →</a>
      </div>
      <div style="margin-top:20px;text-align:center;font-size:11px;color:#94A3B8;">Référence : ${data.requestId.slice(0, 8).toUpperCase()}</div>
    `)
  };
}



// ═══════════════════════════════════════════════════════════
// DEMANDE GÉNÉRIQUE (partenariat, question, autre…)
// ═══════════════════════════════════════════════════════════
export function otherRequestParentConfirmation(data: {
  parentName: string;
  subject: string;
}) {
  return {
    subject: `✉️ Bien reçu — ${data.subject} — RESA Sport Academy`,
    htmlContent: layout(`
      <h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 16px;">
        Bonjour ${data.parentName} 👋
      </h1>

      <p style="font-size:16px;">
        Merci pour votre message 🙏 Nous avons bien reçu votre demande concernant : <strong>${data.subject}</strong>.
      </p>

      <div style="background:#F4F6FA;border-left:4px solid #DC2626;padding:16px 20px;border-radius:8px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#DC2626;margin-bottom:8px;">
          Récapitulatif
        </div>
        <div style="font-size:14px;">
          <div><strong>Objet :</strong> ${data.subject}</div>
        </div>
      </div>

      <p><strong>Et maintenant ?</strong> Rien à faire de votre côté 😊</p>
      <ol style="padding-left:20px;margin:12px 0;">
        <li>Notre équipe étudie votre demande</li>
        <li>On vous recontacte sous <strong>24 h</strong> par email ou WhatsApp</li>
      </ol>

      <p style="margin-top:24px;">
        Une question en attendant ? Répondez directement à cet email ou écrivez-nous sur WhatsApp.
      </p>

      ${contactButtons(`Question - ${data.subject}`, "Nous joindre", "https://wa.me/2250700000000")}

      <p style="margin-top:32px;">À très vite,<br/><strong>L'équipe RESA Sport Academy</strong> ⚽</p>
    `)
  };
}

export function otherRequestAdminNotification(data: {
  parentName: string;
  parentEmail: string;
  parentPhone?: string | null;
  subject: string;
  message?: string | null;
  requestId: string;
}) {
  return {
    subject: `📥 Nouvelle demande — ${data.subject}`,
    htmlContent: layout(`
      <h1 style="font-size:22px;font-weight:900;color:#0A1F44;margin:0 0 16px;">
        📥 Nouvelle demande reçue
      </h1>
      <p style="color:#64748B;">
        Une nouvelle demande générique vient d'arriver (partenariat, question, autre).
      </p>

      <div style="background:#F4F6FA;border-radius:12px;padding:20px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#DC2626;margin-bottom:12px;">
          Objet
        </div>
        <div style="font-size:15px;font-weight:700;color:#0A1F44;">${data.subject}</div>
      </div>

      <div style="background:#F4F6FA;border-radius:12px;padding:20px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#DC2626;margin-bottom:12px;">
          Contact
        </div>
        <div style="font-size:14px;line-height:2;">
          <div><strong>Nom :</strong> ${data.parentName}</div>
          <div><strong>Email :</strong> <a href="mailto:${data.parentEmail}" style="color:#DC2626;">${data.parentEmail}</a></div>
          ${data.parentPhone ? `<div><strong>Téléphone :</strong> <a href="tel:${data.parentPhone}" style="color:#DC2626;">${data.parentPhone}</a></div>` : ''}
        </div>
      </div>

      ${data.message ? `
      <div style="background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:20px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#64748B;margin-bottom:8px;">
          Message
        </div>
        <div style="font-size:14px;line-height:1.7;color:#334155;white-space:pre-line;">
          ${data.message}
        </div>
      </div>` : ''}

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