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

// ⚠️ Nettoie les caractères hors WinAnsi et remplace l'espace insécable fin 0x202f par un espace standard
export function cleanText(text?: string | null): string {
  if (!text) return '';
  return text
    .replace(/[\u202F\u00A0\u2000-\u200B]/g, ' ') // 👈 Supprime 0x202f qui faisait crasher pdf-lib !
    .replace(/[✓✔]/g, '')
    .replace(/⚽/g, '')
    .replace(/[^\x20-\x7E\xA0-\xFF\u2018\u2019\u201C\u201D\u2013\u2014\u2026\u20AC\u0152\u0153]/g, '')
    .trim();
}

// ⚠️ Découpe automatiquement un texte long en plusieurs lignes pour ne jamais dépasser maxWidth
function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [text];
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Uint8Array> {
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
  const page = pdf.addPage([595, 842]); // Format A4

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const helvObl = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const { width } = page.getSize();
  const margin = 40;
  let y = 842;

  // ─── Header Navy ───
  page.drawRectangle({ x: 0, y: y - 90, width, height: 90, color: NAVY });
  page.drawRectangle({ x: 0, y: y - 94, width, height: 4, color: RED });

  page.drawText('RESA SPORT ACADEMY', {
    x: margin, y: y - 50,
    size: 20, font: helvBold, color: WHITE
  });
  page.drawText("LIGUE SCOLAIRE PRIMAIRE - COTE D'IVOIRE", {
    x: margin, y: y - 70,
    size: 9, font: helv, color: rgb(0.65, 0.72, 0.82)
  });

  y -= 125;

  // ─── Titre & Référence ───
  page.drawText('REÇU DE PAIEMENT', {
    x: margin, y,
    size: 16, font: helvBold, color: NAVY
  });
  page.drawText('Receipt', {
    x: margin, y: y - 14,
    size: 9, font: helvObl, color: GRAY_TEXT
  });

  const rawDate = new Date(data.date).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const dateStr = cleanText(rawDate);
  const refLabel = `N° ${cleanText(data.reference)}`;
  const refWidth = helvBold.widthOfTextAtSize(refLabel, 9);
  const dateWidth = helv.widthOfTextAtSize(dateStr, 9);

  page.drawText(refLabel, {
    x: width - margin - refWidth, y,
    size: 9, font: helvBold, color: DARK_TEXT
  });
  page.drawText(dateStr, {
    x: width - margin - dateWidth, y: y - 14,
    size: 9, font: helv, color: GRAY_TEXT
  });

  y -= 35;

  // ─── Carte Client ───
  const clientCardHeight = data.clientPhone ? 80 : 66;
  page.drawRectangle({
    x: margin, y: y - clientCardHeight, width: width - margin * 2, height: clientCardHeight,
    color: GRAY_BG
  });
  page.drawRectangle({ x: margin, y: y - clientCardHeight, width: 3, height: clientCardHeight, color: RED });

  let cardY = y - 18;
  page.drawText('CLIENT', {
    x: margin + 16, y: cardY,
    size: 8, font: helvBold, color: RED
  });

  cardY -= 16;
  page.drawText(cleanText(data.clientName), {
    x: margin + 16, y: cardY,
    size: 12, font: helvBold, color: DARK_TEXT
  });

  cardY -= 14;
  page.drawText(cleanText(data.clientEmail), {
    x: margin + 16, y: cardY,
    size: 9, font: helv, color: GRAY_TEXT
  });

  if (data.clientPhone) {
    cardY -= 13;
    page.drawText(cleanText(data.clientPhone), {
      x: margin + 16, y: cardY,
      size: 9, font: helv, color: GRAY_TEXT
    });
  }

  y -= clientCardHeight + 25;

  // ─── Détails ───
  page.drawText('DÉTAILS', {
    x: margin, y,
    size: 8, font: helvBold, color: RED
  });
  y -= 16;

  const rows: [string, string][] = [];
  if (data.type === 'camp') {
    if (data.campTitle) rows.push(['Événement', cleanText(data.campTitle)]);
    if (data.campDate) {
      const d = cleanText(new Date(data.campDate).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
      }));
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
    if (data.availability) rows.push(['Disponibilités', cleanText(data.availability)]);
  }
  rows.push(['Moyen de paiement', 'Mobile Money / Carte']);

  const labelX = margin;
  const valueX = margin + 130;
  const maxValueWidth = width - margin - valueX;

  for (const [label, rawVal] of rows) {
    const value = cleanText(rawVal);
    const lines = wrapText(value, maxValueWidth, helvBold, 9.5);

    page.drawText(label, {
      x: labelX, y,
      size: 9.5, font: helv, color: GRAY_TEXT
    });

    for (let i = 0; i < lines.length; i++) {
      page.drawText(lines[i], {
        x: valueX, y: y - (i * 13),
        size: 9.5, font: helvBold, color: DARK_TEXT
      });
    }

    y -= Math.max(lines.length * 13, 15) + 5;
  }

  y -= 15;

  // ─── Box Montant Payé ───
  const boxHeight = 70;
  page.drawRectangle({
    x: margin, y: y - boxHeight, width: width - margin * 2, height: boxHeight,
    color: GRAY_BG
  });
  page.drawRectangle({ x: margin, y: y - boxHeight, width: 3, height: boxHeight, color: EMERALD });

  page.drawText('MONTANT PAYÉ', {
    x: margin + 16, y: y - 18,
    size: 8, font: helvBold, color: EMERALD
  });

  // ⚠️ cleanText appliqué sur le toLocaleString pour supprimer l'espace insécable fin 0x202f
  const formattedAmount = cleanText(data.amount.toLocaleString('fr-FR'));
  const amountStr = `${formattedAmount} ${cleanText(data.currency)}`;
  page.drawText(amountStr, {
    x: margin + 16, y: y - 46,
    size: 22, font: helvBold, color: NAVY
  });

  page.drawText('PAYÉ', {
    x: width - margin - 50, y: y - 46,
    size: 11, font: helvBold, color: EMERALD
  });

  y -= boxHeight + 30;

  // ─── Mentions légales ───
  page.drawText('Ce reçu est généré automatiquement et fait foi de votre paiement.', {
    x: margin, y,
    size: 8.5, font: helvObl, color: GRAY_TEXT
  });
  y -= 12;
  page.drawText('Pour toute question, écrivez-nous à contact@cataria-systems.com', {
    x: margin, y,
    size: 8.5, font: helv, color: GRAY_TEXT
  });

  // ─── Footer Navy ───
  page.drawRectangle({ x: 0, y: 0, width, height: 60, color: NAVY_DEEP });
  page.drawText("RESA SPORT ACADEMY - Abidjan, Côte d'Ivoire", {
    x: margin, y: 34,
    size: 9, font: helvBold, color: WHITE
  });
  page.drawText('Merci pour votre confiance', {
    x: margin, y: 20,
    size: 8.5, font: helv, color: rgb(0.65, 0.72, 0.82)
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