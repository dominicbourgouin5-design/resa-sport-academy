// src/lib/partner-request-templates.ts

export type PartnerStatus = 'pending' | 'contacted' | 'validated' | 'suspended' | 'rejected';

export type PartnerEmailTemplate = {
  id: string;
  label: string;
  subject: string;
  body: string;
  targetStatus?: PartnerStatus;
};

export const PARTNER_TEMPLATES: PartnerEmailTemplate[] = [
  {
    id: 'contacted',
    label: '📞 Premier contact',
    subject: '🤝 Suite donnée à votre demande — RESA Sport Academy',
    body: `Bonjour {{contact_name}},

Merci pour votre intérêt pour RESA Sport Academy et pour la demande de partenariat que vous avez adressée pour {{company_name}}.

Nous avons bien étudié votre proposition et nous souhaitons échanger avec vous pour approfondir les possibilités de collaboration.

N'hésitez pas à nous répondre directement à cet email ou à nous joindre sur WhatsApp pour convenir d'un moment d'échange.

Nous sommes ravis de cette première prise de contact.

Bien à vous,
L'équipe RESA Sport Academy`,
    targetStatus: 'contacted'
  },
  {
    id: 'validated',
    label: '✅ Partenariat validé',
    subject: '🎉 Votre partenariat avec RESA Sport Academy est validé',
    body: `Bonjour {{contact_name}},

Nous avons le plaisir de vous confirmer que le partenariat entre {{company_name}} et RESA Sport Academy est officiellement validé.

Toute l'équipe est ravie de vous accueillir dans l'écosystème RESA. Nous allons préparer votre fiche partenaire officielle qui sera publiée sur notre site public, ainsi que les différents éléments de communication associés.

Notre équipe revient vers vous très prochainement pour caler les derniers détails logistiques (visuels, positionnement, activation).

Merci pour votre confiance — nous avons hâte de construire quelque chose de grand avec vous.

Bien à vous,
L'équipe RESA Sport Academy`,
    targetStatus: 'validated'
  },
  {
    id: 'suspended',
    label: '⏸️ Mise en attente',
    subject: '📋 Votre dossier de partenariat — RESA Sport Academy',
    body: `Bonjour {{contact_name}},

Nous revenons vers vous concernant votre demande de partenariat pour {{company_name}}.

Après étude, nous sommes dans l'obligation de mettre votre dossier temporairement en suspens, pour des raisons internes indépendantes de votre projet.

Nous restons en tout cas très intéressés par votre démarche et reviendrons vers vous dès que la situation le permettra.

Si vous souhaitez échanger à ce sujet, n'hésitez pas à répondre directement à cet email.

Merci pour votre compréhension,
L'équipe RESA Sport Academy`,
    targetStatus: 'suspended'
  },
  {
    id: 'rejected',
    label: '✕ Refus poli',
    subject: 'Suite donnée à votre demande de partenariat',
    body: `Bonjour {{contact_name}},

Merci sincèrement pour l'intérêt que vous portez à RESA Sport Academy et pour la demande de partenariat que vous avez adressée pour {{company_name}}.

Après étude attentive de votre proposition, nous ne sommes malheureusement pas en mesure de donner une suite favorable à cette demande pour le moment.

Ce n'est pas un adieu : notre écosystème évolue rapidement et nous serions ravis de rester en contact pour de futures opportunités.

Nous vous souhaitons plein succès dans vos projets.

Bien à vous,
L'équipe RESA Sport Academy`,
    targetStatus: 'rejected'
  }
];

export function fillPartnerTemplate(
  body: string,
  vars: Record<string, string | null | undefined>
): string {
  return body.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = vars[key];
    return v ?? '';
  });
}