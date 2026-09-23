// ─── Layout HTML commun ─────────────────────────────────────
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
          <!-- Header navy -->
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
          <!-- Barre rouge -->
          <tr><td style="height:4px;background:linear-gradient(90deg,#DC2626,#1E3A8A,#DC2626);"></td></tr>
          <!-- Contenu -->
          <tr>
            <td style="padding:40px 32px;color:#0F172A;font-size:15px;line-height:1.7;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
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

// ─── Email 1 : Confirmation inscription école ──────────────
export function schoolRegistrationConfirmation(data: {
  contactName: string;
  schoolName: string;
  categories: string[];
}) {
  const categories = data.categories.join(', ') || 'U7, U9, U11';

  return {
    subject: `✓ Votre demande d'inscription — ${data.schoolName}`,
    htmlContent: layout(`
      <h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 16px;">
        Bonjour ${data.contactName},
      </h1>

      <p>Nous avons bien reçu votre demande d'inscription pour <strong>${data.schoolName}</strong>.</p>

      <div style="background:#F4F6FA;border-left:4px solid #DC2626;padding:16px 20px;border-radius:8px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#DC2626;margin-bottom:8px;">
          Récapitulatif
        </div>
        <div style="font-size:14px;">
          <div><strong>Établissement :</strong> ${data.schoolName}</div>
          <div style="margin-top:6px;"><strong>Catégories :</strong> ${categories}</div>
        </div>
      </div>

      <p><strong>Prochaines étapes :</strong></p>
      <ol style="padding-left:20px;margin:12px 0;">
        <li>Notre équipe étudie votre dossier</li>
        <li>Nous vous recontactons sous 48h par téléphone ou WhatsApp</li>
        <li>Confirmation définitive de votre place</li>
      </ol>

      <p style="margin-top:24px;">
        Pour toute question, contactez-nous sur WhatsApp ou par email à
        <a href="mailto:contact@resasportacademy.ci" style="color:#DC2626;">contact@resasportacademy.ci</a>.
      </p>

      <div style="margin-top:32px;text-align:center;">
        <a href="https://wa.me/2250700000000" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
          💬 Nous contacter sur WhatsApp
        </a>
      </div>
    `)
  };
}

// ─── Email 2 : Confirmation détection individuelle ─────────
export function individualRegistrationConfirmation(data: {
  contactName: string;
  playerName: string;
  position?: string;
}) {
  return {
    subject: `✓ Inscription détection reçue — ${data.playerName}`,
    htmlContent: layout(`
      <h1 style="font-size:24px;font-weight:900;color:#0A1F44;margin:0 0 16px;">
        Bonjour ${data.contactName},
      </h1>

      <p>Nous avons bien reçu l'inscription de <strong>${data.playerName}</strong> pour les sessions de détection RESA Sport Academy.</p>

      <div style="background:#F4F6FA;border-left:4px solid #1E3A8A;padding:16px 20px;border-radius:8px;margin:24px 0;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#1E3A8A;margin-bottom:8px;">
          Récapitulatif
        </div>
        <div style="font-size:14px;">
          <div><strong>Enfant :</strong> ${data.playerName}</div>
          ${data.position ? `<div style="margin-top:6px;"><strong>Poste :</strong> ${data.position}</div>` : ''}
        </div>
      </div>

      <p>Nous vous contacterons pour vous communiquer les dates et lieux des prochaines sessions.</p>

      <div style="margin-top:32px;text-align:center;">
        <a href="https://wa.me/2250700000000" style="display:inline-block;background:#25D366;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
          💬 Nous contacter sur WhatsApp
        </a>
      </div>
    `)
  };
}

// ─── Email 3 : Notification admin ───────────────────────────
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
        Nouvelle inscription reçue
      </h1>

      <p style="color:#64748B;">
        Une nouvelle demande vient d'être soumise sur le site.
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