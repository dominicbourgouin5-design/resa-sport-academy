// src/lib/pdf/receipt.ts

export type ReceiptData = {
  type: 'camp' | 'training';
  reference: string;
  date: string;
  amount: number;
  currency: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  campTitle?: string;
  campDate?: string;
  campLocation?: string;
  playerName?: string;
  playerAge?: number;
  programTitle?: string;
  coach?: string;
  availability?: string;
};

// ⚠️ Nettoie les caractères hors WinAnsi (émojis, symboles spéciaux) pour éviter tout crash pdf-lib
function cleanText(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/[✓✔]/g, '')
    .replace(/⚽/g, '')
    .replace(/[^\x20-\x7E\xA0-\xFF\u2018\u2019\u201C\u201D\u2013\u2014\u2026\u20AC\u0152\u0153]/g, '')
    .trim();
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Uint8Array> {
  // Dynamic import pour éviter tout conflit de bundling Next.js
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

  const NAVY       = rgb(0.039, 0.122, 0.267);
  const NAVY_DEEP  = rgb(0.024, 0.082, 0.188);
  const RED        = rgb(0.863, 0.149, 0.149);
  const GRAY_TEXT  = rgb(0.392, 0.455, 0.545);
  const DARK_TEXT  = rgb(0.059, 0.090, 0.165);
  const GRAY_BG    = rgb(0.957, 0.965, 0.980);
  const WHITE      = rgb(1, 1, 1);
  const EMERALD    = rgb(0.063, 0.725, 0.506);

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvObl = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const { width } = page.getSize();
  const margin = 40;
  let y = 842;

  // Header navy
  page.drawRectangle({ x: 0, y: y - 100, width, height: 100, color: NAVY });
  page.drawRectangle({ x: 0, y: y - 104, width, height: 4, color: RED });

  page.drawText('RESA SPORT ACADEMY', {
    x: margin, y: y - 55,
    size: 22, font: helvBold, color: WHITE
  });
  page.drawText("LIGUE SCOLAIRE PRIMAIRE - COTE D'IVOIRE", {
    x: margin, y: y - 75,
    size: 9, font: helv, color: rgb(0.65, 0.72, 0.82)
  });

  y -= 130;

  // Titre
  page.drawText('RECU DE PAIEMENT', {
    x: margin, y,
    size: 18, font: helvBold, color: NAVY
  });
  page.drawText('Receipt', {
    x: margin, y: y - 16,
    size: 10, font: helvObl, color: GRAY_TEXT
  });

  const dateStr = new Date(data.date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const refLabel = `N. ${cleanText(data.reference)}`;
  const refWidth = helvBold.widthOfTextAtSize(refLabel, 10);
  const dateWidth = helv.widthOfTextAtSize(dateStr, 10);

  page.drawText(refLabel, {
    x: width - margin - refWidth, y,
    size: 10, font: helvBold, color: DARK_TEXT
  });
  page.drawText(dateStr, {
    x: width - margin - dateWidth, y: y - 16,
    size: 10, font: helv, color: GRAY_TEXT
  });

  y -= 40;

  // Carte client
  page.drawRectangle({
    x: margin, y: y - 85, width: width - margin * 2, height: 85,
    color: GRAY_BG
  });
  page.drawRectangle({ x: margin, y: y - 85, width: 3, height: 85, color: RED });

  let cardY = y - 20;
  page.drawText('CLIENT', {
    x: margin + 16, y: cardY,
    size: 8, font: helvBold, color: RED
  });

  cardY -= 18;
  page.drawText(cleanText(data.clientName), {
    x: margin + 16, y: cardY,
    size: 13, font: helvBold, color: DARK_TEXT
  });

  cardY -= 16;
  page.drawText(cleanText(data.clientEmail), {
    x: margin + 16, y: cardY,
    size: 10, font: helv, color: GRAY_TEXT
  });

  if (data.clientPhone) {
    cardY -= 14;
    page.drawText(cleanText(data.clientPhone), {
      x: margin + 16, y: cardY,
      size: 10, font: helv, color: GRAY_TEXT
    });
  }

  y -= 110;

  // Détails
  page.drawText('DETAILS', {
    x: margin, y,
    size: 8, font: helvBold, color: RED
  });
  y -= 20;

  const rows: [string, string][] = [];
  if (data.type === 'camp') {
    if (data.campTitle) rows.push(['Evenement', cleanText(data.campTitle)]);
    if (data.campDate) {
      const d = new Date(data.campDate).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
      rows.push(['Date', d]);
    }
    if (data.campLocation) rows.push(['Lieu', cleanText(data.campLocation)]);
    if (data.playerName) {
      const player = data.playerAge
        ? `${cleanText(data.playerName)} (${data.playerAge} ans)`
        : cleanText(data.playerName);
      rows.push(['Joueur', player]);
    }
  } else {
    if (data.programTitle) rows.push(['Programme', cleanText(data.programTitle)]);
    if (data.playerName) {
      const player = data.playerAge
        ? `${cleanText(data.playerName)} (${data.playerAge} ans)`
        : cleanText(data.playerName);
      rows.push(['Joueur', player]);
    }
    if (data.coach) rows.push(['Coach', cleanText(data.coach)]);
    if (data.availability) rows.push(['Disponibilites', cleanText(data.availability)]);
  }
  rows.push(['Moyen de paiement', 'Mobile Money / Carte (FedaPay)']);

  for (const [label, value] of rows) {
    page.drawText(label, {
      x: margin, y,
      size: 10, font: helv, color: GRAY_TEXT
    });
    page.drawText(value, {
      x: margin + 140, y,
      size: 10, font: helvBold, color: DARK_TEXT
    });
    y -= 18;
  }

  y -= 20;

  // Box montant
  const boxHeight = 80;
  page.drawRectangle({
    x: margin, y: y - boxHeight, width: width - margin * 2, height: boxHeight,
    color: GRAY_BG
  });
  page.drawRectangle({ x: margin, y: y - boxHeight, width: 3, height: boxHeight, color: EMERALD });

  page.drawText('MONTANT PAYE', {
    x: margin + 16, y: y - 20,
    size: 8, font: helvBold, color: EMERALD
  });

  const amountStr = `${data.amount.toLocaleString('fr-FR')} ${cleanText(data.currency)}`;
  page.drawText(amountStr, {
    x: margin + 16, y: y - 48,
    size: 26, font: helvBold, color: NAVY
  });

  // Remplacement du ✓ par du texte standard WinAnsi
  page.drawText('PAYE', {
    x: width - margin - 50, y: y - 48,
    size: 12, font: helvBold, color: EMERALD
  });

  y -= boxHeight + 40;

  page.drawText('Ce recu est genere automatiquement et fait foi de votre paiement.', {
    x: margin, y,
    size: 9, font: helvObl, color: GRAY_TEXT
  });
  y -= 14;
  page.drawText('Pour toute question, ecrivez-nous a contact@cataria-systems.com', {
    x: margin, y,
    size: 9, font: helv, color: GRAY_TEXT
  });

  // Footer (sans émoji ballon)
  page.drawRectangle({ x: 0, y: 0, width, height: 60, color: NAVY_DEEP });
  page.drawText("RESA SPORT ACADEMY - Abidjan, Cote d'Ivoire", {
    x: margin, y: 36,
    size: 9, font: helvBold, color: WHITE
  });
  page.drawText('Merci pour votre confiance', {
    x: margin, y: 20,
    size: 9, font: helvBold, color: rgb(0.65, 0.72, 0.82)
  });

  return await pdf.save();
}

export function uint8ToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}