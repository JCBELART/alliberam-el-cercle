import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

export interface DiplomaBottle {
  label: string;
  wineType?: string;
  serial?: number;
  batch?: number;
  token?: string;
}

export interface DiplomaOptions {
  buyerName: string;
  orderNumber: string;
  dateStr: string;
  bottles: DiplomaBottle[];
  verifyUrl?: string;
  batchSize?: number;
}

export async function generateDiplomaBuffer(options: DiplomaOptions): Promise<Buffer> {
  const {
    buyerName,
    orderNumber,
    dateStr,
    bottles,
    verifyUrl,
    batchSize = 500,
  } = options;

  // 1. Rutas absolutas seguras para el entorno de Next.js
  const pdfPath = path.join(process.cwd(), 'public', 'Diploma_Base.pdf');
  const fallbackQrPath = path.join(process.cwd(), 'public', 'qr-final.png');

  const existingPdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { height } = firstPage.getSize(); // Altura total DIN-A4 en puntos (841.89 pt)

  // 2. Tipografías
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Conversión exacta de milímetros a puntos (1 mm = 2.83464 pt)
  const mmToPt = (mm: number) => mm * 2.83464;

  // 3. REGISTRE -> Altura exacta de la fecha con X: 43.4816 mm
  const regFontSize = 13;
  const regTextWidth = fontBold.widthOfTextAtSize(orderNumber, regFontSize);
  const rightHeightY = height - mmToPt(40.6857);
  const regCenterX = mmToPt(43.4816);

  firstPage.drawText(orderNumber, {
    x: regCenterX - regTextWidth / 2,
    y: rightHeightY - regFontSize / 3,
    size: regFontSize,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // 4. DATA D'EMISSIÓ -> INTOCABLE
  const dateTextWidth = fontBold.widthOfTextAtSize(dateStr, regFontSize);
  const dateCenterX = mmToPt(166.6687);
  const dateCenterY = height - mmToPt(40.6857);

  firstPage.drawText(dateStr, {
    x: dateCenterX - dateTextWidth / 2,
    y: dateCenterY - regFontSize / 3,
    size: regFontSize,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // 5. NOM I COGNOMS COMPRADOR (MAJÚSCULES, BOLD 20 pt, centrat)
  const buyerText = buyerName.toUpperCase();
  const buyerFontSize = 20;
  const buyerTextWidth = fontBold.widthOfTextAtSize(buyerText, buyerFontSize);
  firstPage.drawText(buyerText, {
    x: mmToPt(105.2137) - buyerTextWidth / 2,
    y: height - mmToPt(105.0344) - 5,
    size: buyerFontSize,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // 6. CAJA DE TEXTO BOTELLAS (165 mm x 60 mm)
  const boxWidth = mmToPt(165);
  const boxHeight = mmToPt(60);
  const boxCenterX = mmToPt(104.775);
  const boxCenterY = height - mmToPt(188.023);

  const visibleBottles = bottles.slice(0, 6);
  let currentY = boxCenterY + boxHeight / 2 - 15;
  const currentFontSize = visibleBottles.length > 6 ? 10 : 13;
  const lineHeight = currentFontSize + 5;

  visibleBottles.forEach((bottle, index) => {
    const serial = bottle.serial ?? index + 1;
    const prefixText = `AMPOLLA NÚM. ${serial} DE ${batchSize} - `.toUpperCase();
    const bottleNameUpper = bottle.label.toUpperCase();

    const prefixWidth = fontBold.widthOfTextAtSize(prefixText, currentFontSize);
    const bottleWidth = fontRegular.widthOfTextAtSize(bottleNameUpper, currentFontSize);
    const totalLineWidth = prefixWidth + bottleWidth;
    const startLineX = boxCenterX - totalLineWidth / 2;

    firstPage.drawText(prefixText, {
      x: startLineX,
      y: currentY,
      size: currentFontSize,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.15),
    });

    firstPage.drawText(bottleNameUpper, {
      x: startLineX + prefixWidth,
      y: currentY,
      size: currentFontSize,
      font: fontRegular,
      color: rgb(0.15, 0.15, 0.15),
    });

    currentY -= lineHeight;
  });

  if (bottles.length > visibleBottles.length) {
    const remaining = bottles.length - visibleBottles.length;
    firstPage.drawText(`+ ${remaining} AMPOLLES MÉS A L'ANNEX`.toUpperCase(), {
      x: boxCenterX - 90,
      y: currentY - 2,
      size: 9,
      font: fontBold,
      color: rgb(0.35, 0.35, 0.35),
    });
  }

  // 7. QR DINÁMICO. Cada botella apunta a su experiencia personal.
  const qrSize = mmToPt(34);
  const qrX = mmToPt(60.9921) - qrSize / 2;
  const qrY = height - mmToPt(252.8507) - qrSize / 2;

  if (verifyUrl) {
    const qrBuffer = await QRCode.toBuffer(verifyUrl, {
      type: 'png',
      width: 700,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: { dark: '#111111', light: '#ffffff' },
    });
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    firstPage.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });
  } else {
    const fallbackQrBytes = fs.readFileSync(fallbackQrPath);
    const qrImage = await pdfDoc.embedPng(fallbackQrBytes);
    firstPage.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });
  }

  // 8. ANNEX: relación completa cuando hay más de 6 botellas.
  if (bottles.length > visibleBottles.length) {
    const rowsPerPage = 26;
    let page = pdfDoc.addPage([595.28, 841.89]);
    let cursorY = 0;

    const drawAnnexHeader = (annexPage: typeof page, pageNumber: number) => {
      const { width } = annexPage.getSize();
      annexPage.drawText("ALLIBERA'M · EL CERCLE", {
        x: 50,
        y: 795,
        size: 11,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      annexPage.drawText('ANNEX · RELACIÓ D’AMPOLLES', {
        x: 50,
        y: 772,
        size: 16,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      annexPage.drawText(`Comanda: ${orderNumber}  ·  Titular: ${buyerText}`, {
        x: 50,
        y: 754,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
      });
      annexPage.drawLine({
        start: { x: 50, y: 744 },
        end: { x: width - 50, y: 744 },
        thickness: 0.8,
        color: rgb(0.75, 0.75, 0.75),
      });
      annexPage.drawText('Nº', { x: 52, y: 728, size: 8, font: fontBold, color: rgb(0.35, 0.35, 0.35) });
      annexPage.drawText('ETIQUETA', { x: 82, y: 728, size: 8, font: fontBold, color: rgb(0.35, 0.35, 0.35) });
      annexPage.drawText('VI', { x: 285, y: 728, size: 8, font: fontBold, color: rgb(0.35, 0.35, 0.35) });
      annexPage.drawText('LOT', { x: 355, y: 728, size: 8, font: fontBold, color: rgb(0.35, 0.35, 0.35) });
      annexPage.drawText('CODI DE VERIFICACIÓ', { x: 405, y: 728, size: 8, font: fontBold, color: rgb(0.35, 0.35, 0.35) });
      annexPage.drawText(`Pàgina ${pageNumber}`, {
        x: width - 100,
        y: 40,
        size: 8,
        font: fontRegular,
        color: rgb(0.5, 0.5, 0.5),
      });
      return 714;
    };

    cursorY = drawAnnexHeader(page, 1);
    let pageNumber = 1;

    bottles.forEach((bottle, index) => {
      if (index > 0 && index % rowsPerPage === 0) {
        page = pdfDoc.addPage([595.28, 841.89]);
        pageNumber += 1;
        cursorY = drawAnnexHeader(page, pageNumber);
      }

      const serial = bottle.serial ?? index + 1;
      const shortToken = bottle.token ? bottle.token.slice(0, 14).toUpperCase() : '—';

      page.drawText(String(serial).padStart(3, '0'), {
        x: 52,
        y: cursorY,
        size: 8.5,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      });
      page.drawText(bottle.label.toUpperCase(), {
        x: 82,
        y: cursorY,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.1, 0.1, 0.1),
      });
      page.drawText((bottle.wineType || '—').toUpperCase(), {
        x: 285,
        y: cursorY,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.1, 0.1, 0.1),
      });
      page.drawText(String(bottle.batch ?? 1), {
        x: 355,
        y: cursorY,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.1, 0.1, 0.1),
      });
      page.drawText(shortToken, {
        x: 405,
        y: cursorY,
        size: 7.5,
        font: fontRegular,
        color: rgb(0.35, 0.35, 0.35),
      });

      page.drawLine({
        start: { x: 50, y: cursorY - 6 },
        end: { x: 545, y: cursorY - 6 },
        thickness: 0.3,
        color: rgb(0.88, 0.88, 0.88),
      });

      cursorY -= 22;
    });
  }

  // 9. Retornar com a Buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
