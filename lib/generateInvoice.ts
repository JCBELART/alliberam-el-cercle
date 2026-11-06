// lib/generateInvoice.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface InvoiceDetails {
  orderId: string;
  customerName: string;
  customerEmail: string;
  companyName?: string;
  companyNif?: string;
  companyAddress?: string;
  amount: number;
  date: string;
  items?: Array<{
    serial?: number;
    labelName: string;
    wineType?: string;
    amount?: number;
  }>;
}

export async function generateInvoicePDF(orderDetails: InvoiceDetails): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // DIN A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = page.getSize();
  const margin = 50;

  // --- CABECERA: DATOS EMPRESA EMISORA ---
  page.drawText('DELIFUSION FOOD & DRINK S.L.', {
    x: margin,
    y: height - 50,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText('NIF: B16449233', { x: margin, y: height - 65, size: 9, font });
  page.drawText('Calle Moriles, 8 Casa 25', { x: margin, y: height - 78, size: 9, font });
  page.drawText('29740 Velez-Malaga (Malaga) - Espana', { x: margin, y: height - 91, size: 9, font });

  page.drawText('FACTURA', {
    x: width - margin - 90,
    y: height - 55,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Num: FC-2026-${orderDetails.orderId.slice(-6)}`, {
    x: width - margin - 130,
    y: height - 75,
    size: 9,
    font,
  });
  page.drawText(`Data: ${orderDetails.date}`, {
    x: width - margin - 130,
    y: height - 88,
    size: 9,
    font,
  });

  page.drawLine({
    start: { x: margin, y: height - 110 },
    end: { x: width - margin, y: height - 110 },
    thickness: 0.75,
    color: rgb(0.8, 0.8, 0.8),
  });

  // --- BLOQUE DE CLIENTE ---
  const startY = height - 135;
  const colX2 = 320;

  page.drawText('DADES DEL CLIENT', {
    x: margin,
    y: startY,
    size: 10,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2),
  });
  page.drawText(`Nom: ${orderDetails.customerName}`, {
    x: margin,
    y: startY - 20,
    size: 9,
    font,
  });
  page.drawText(`Email: ${orderDetails.customerEmail}`, {
    x: margin,
    y: startY - 35,
    size: 9,
    font,
  });

  if (orderDetails.companyName || orderDetails.companyNif || orderDetails.companyAddress) {
    page.drawText('DADES FISCALS EMPRESA (CLIENT)', {
      x: colX2,
      y: startY,
      size: 10,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    let cY = startY - 20;
    if (orderDetails.companyName) {
      page.drawText(`Empresa: ${orderDetails.companyName}`, { x: colX2, y: cY, size: 9, font });
      cY -= 15;
    }
    if (orderDetails.companyNif) {
      page.drawText(`NIF/CIF: ${orderDetails.companyNif}`, { x: colX2, y: cY, size: 9, font });
      cY -= 15;
    }
    if (orderDetails.companyAddress) {
      page.drawText(`Adreca: ${orderDetails.companyAddress}`, { x: colX2, y: cY, size: 9, font });
    }
  }

  // --- TABLA DE CONCEPTOS ---
  const tableTop = height - 235;

  page.drawRectangle({
    x: margin,
    y: tableTop - 5,
    width: width - margin * 2,
    height: 22,
    color: rgb(0.95, 0.95, 0.95),
  });

  page.drawText('DESCRIPCIO', { x: margin + 10, y: tableTop + 2, size: 9, font: boldFont });
  page.drawText('TOTAL', { x: width - margin - 70, y: tableTop + 2, size: 9, font: boldFont });

  let rowY = tableTop - 35;
  const items = orderDetails.items ?? [];

  if (items.length > 0) {
    const maxRows = 40;
    const rows = items.slice(0, maxRows);
    for (const item of rows) {
      const serial = item.serial ? `N. ${String(item.serial).padStart(3, '0')} - ` : '';
      const wine = item.wineType ? ` (${item.wineType})` : '';
      const description = `${serial}${item.labelName}${wine} - Vi El Cercle 2026`;
      page.drawText(description.slice(0, 78), { x: margin + 10, y: rowY, size: 8.5, font });
      page.drawText(`${(item.amount ?? 0).toFixed(2)} EUR`, {
        x: width - margin - 70,
        y: rowY,
        size: 8.5,
        font,
      });
      rowY -= 14;
    }
    if (items.length > maxRows) {
      page.drawText(`+ ${items.length - maxRows} ampolles mes (vegeu annex del certificat)`, {
        x: margin + 10,
        y: rowY,
        size: 8,
        font,
      });
      rowY -= 14;
    }
  } else {
    page.drawText('Vi El Cercle - Edicio Commemorativa i Limitada 2026', {
      x: margin + 10,
      y: rowY,
      size: 9,
      font,
    });
    page.drawText(`${orderDetails.amount.toFixed(2)} EUR`, {
      x: width - margin - 70,
      y: rowY,
      size: 9,
      font,
    });
    rowY -= 14;
  }

  page.drawLine({
    start: { x: margin, y: rowY - 5 },
    end: { x: width - margin, y: rowY - 5 },
    thickness: 0.75,
    color: rgb(0.8, 0.8, 0.8),
  });

  // --- TOTALES ---
  const totalY = Math.max(120, rowY - 40);
  page.drawText('TOTAL PAGAT (IVA inclos):', {
    x: width - margin - 220,
    y: totalY,
    size: 10,
    font: boldFont,
  });
  page.drawText(`${orderDetails.amount.toFixed(2)} EUR`, {
    x: width - margin - 70,
    y: totalY,
    size: 11,
    font: boldFont,
  });

  // --- PIE ---
  page.drawText("DELIFUSION FOOD & DRINK S.L. - ALLIBERA'M EL CERCLE", {
    x: margin,
    y: 50,
    size: 8,
    font: boldFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText('Aquest document es una factura simplificada generada electronicament.', {
    x: margin,
    y: 38,
    size: 8,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });

  return await pdfDoc.save();
}
