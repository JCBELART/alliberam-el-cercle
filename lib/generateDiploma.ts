import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

export async function generateDiplomaBuffer(buyerName: string, orderNumber: string, dateStr: string, bottles: string[]) {
  // 1. Rutas absolutas seguras para el entorno de Next.js
  const pdfPath = path.join(process.cwd(), 'public', 'Diploma_Base.pdf');
  const qrPath = path.join(process.cwd(), 'public', 'qr-final.png');

  const existingPdfBytes = fs.readFileSync(pdfPath);
  const existingQrBytes = fs.readFileSync(qrPath);

  // 2. Cargar el documento PDF (DIN-A4: 210 x 297 mm)
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);

  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { height } = firstPage.getSize(); // Altura total DIN-A4 en puntos (841.89 pt)

  // 3. Tipografías
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Conversión exacta de milímetros a puntos (1 mm = 2.83464 pt)
  const mmToPt = (mm: number) => mm * 2.83464;

  // 4. REGISTRE -> Altura exacta de la fecha con X: 43.4816 mm
  const regFontSize = 13;
  const regTextWidth = fontBold.widthOfTextAtSize(orderNumber, regFontSize);
  const rightHeightY = height - mmToPt(40.6857);
  const regCenterX = mmToPt(43.4816);

  firstPage.drawText(orderNumber, {
    x: regCenterX - (regTextWidth / 2),
    y: rightHeightY - (regFontSize / 3),
    size: regFontSize,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // 5. DATA D'EMISSIÓ -> INTOCABLE
  const dateTextWidth = fontBold.widthOfTextAtSize(dateStr, regFontSize);
  const dateCenterX = mmToPt(166.6687);
  const dateCenterY = height - mmToPt(40.6857);

  firstPage.drawText(dateStr, {
    x: dateCenterX - (dateTextWidth / 2),
    y: dateCenterY - (regFontSize / 3),
    size: regFontSize,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // 6. NOM I COGNOMS COMPRADOR (MAJÚSCULES, BOLD 20 pt, centrat)
  const buyerText = buyerName.toUpperCase();
  const buyerFontSize = 20;
  const buyerTextWidth = fontBold.widthOfTextAtSize(buyerText, buyerFontSize);
  firstPage.drawText(buyerText, {
    x: mmToPt(105.2137) - (buyerTextWidth / 2),
    y: height - mmToPt(105.0344) - 5,
    size: buyerFontSize,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // 7. CAJA DE TEXTO BOTELLAS (165 mm x 60 mm)
  const boxWidth = mmToPt(165);
  const boxHeight = mmToPt(60);
  const boxCenterX = mmToPt(104.775);
  const boxCenterY = height - mmToPt(188.023);
  
  let currentY = boxCenterY + (boxHeight / 2) - 15;
  let currentFontSize = bottles.length > 6 ? 10 : 13;
  const lineHeight = currentFontSize + 5;

  bottles.forEach((bottle, index) => {
    const bottleNum = index + 1;
    const prefixText = `AMPOLLA NÚM. ${bottleNum} DE 500 - `.toUpperCase();
    const bottleNameUpper = bottle.toUpperCase();

    const prefixWidth = fontBold.widthOfTextAtSize(prefixText, currentFontSize);
    const bottleWidth = fontRegular.widthOfTextAtSize(bottleNameUpper, currentFontSize);
    const totalLineWidth = prefixWidth + bottleWidth;

    let startLineX = boxCenterX - (totalLineWidth / 2);

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

  // 8. QR-CODE ADAPTAT DESDE ILLUSTRATOR (X: 60.9921 mm, Y: 252.8507 mm, Grandària: 34 x 34 mm)
  const qrImage = await pdfDoc.embedPng(existingQrBytes);
  const qrSize = mmToPt(34); 
  const qrX = mmToPt(60.9921) - (qrSize / 2);
  const qrY = height - mmToPt(252.8507) - (qrSize / 2);

  firstPage.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrSize,
    height: qrSize,
  });

  // 9. Retornar com a Buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}