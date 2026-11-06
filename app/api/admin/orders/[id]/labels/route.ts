import { NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { getOrder } from '../../../../../../lib/orders';

export const runtime = 'nodejs';export const dynamic = 'force-dynamic';

/**
 * Genera un PDF con una etiqueta por botella. Cada etiqueta incluye numero de
 * serie, etiqueta, tipo de vino y el QR unico que abre la experiencia.
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const order = await getOrder(params.id);
    if (!order) {
      return NextResponse.json({ error: 'Comanda no trobada.' }, { status: 404 });
    }
    if (order.items.length === 0) {
      return NextResponse.json(
        { error: 'Primer has de confirmar la comanda per assignar les ampolles.' },
        { status: 409 }
      );
    }

    const siteUrl = (
      process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alliberamelcercle.digital'
    ).replace(/\/$/, '');

    const pdf = await PDFDocument.create();
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const regular = await pdf.embedFont(StandardFonts.Helvetica);

    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const columns = 2;
    const rows = 4;
    const perPage = columns * rows;
    const cellWidth = (pageWidth - 60) / columns;
    const cellHeight = (pageHeight - 60) / rows;

    for (let index = 0; index < order.items.length; index += 1) {
      const item = order.items[index];
      const position = index % perPage;
      if (position === 0) pdf.addPage([pageWidth, pageHeight]);
      const page = pdf.getPages()[pdf.getPageCount() - 1];

      const col = position % columns;
      const row = Math.floor(position / columns);
      const x = 30 + col * cellWidth;
      const yTop = pageHeight - 30 - row * cellHeight;

      page.drawRectangle({
        x: x + 6,
        y: yTop - cellHeight + 6,
        width: cellWidth - 12,
        height: cellHeight - 12,
        borderColor: rgb(0.75, 0.75, 0.75),
        borderWidth: 0.8,
        color: rgb(0.98, 0.98, 0.98),
      });

      page.drawText("ALLIBERA'M · EL CERCLE", {
        x: x + 16,
        y: yTop - 26,
        size: 8,
        font: bold,
        color: rgb(0.2, 0.2, 0.2),
      });
      page.drawText(`N. ${String(item.serial).padStart(3, '0')} / 500`, {
        x: x + 16,
        y: yTop - 46,
        size: 13,
        font: bold,
        color: rgb(0.1, 0.1, 0.1),
      });
      page.drawText(item.labelName.toUpperCase(), {
        x: x + 16,
        y: yTop - 62,
        size: 9,
        font: regular,
        color: rgb(0.25, 0.25, 0.25),
      });
      page.drawText(item.wineType === 'NEGRE' ? 'VI NEGRE' : 'VI BLANC', {
        x: x + 16,
        y: yTop - 76,
        size: 8,
        font: regular,
        color: rgb(0.35, 0.35, 0.35),
      });
      page.drawText((order.personalizedName || order.customer.name).slice(0, 34), {
        x: x + 16,
        y: yTop - 90,
        size: 7.5,
        font: regular,
        color: rgb(0.35, 0.35, 0.35),
      });

      const qrSize = 72;
      const qrBuffer = await QRCode.toBuffer(
        `${siteUrl}/experiencia?token=${encodeURIComponent(item.token)}`,
        {
          type: 'png',
          width: 400,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: { dark: '#111111', light: '#ffffff' },
        }
      );
      const qrImage = await pdf.embedPng(qrBuffer);
      page.drawImage(qrImage, {
        x: x + cellWidth - qrSize - 18,
        y: yTop - cellHeight + 26,
        width: qrSize,
        height: qrSize,
      });

      page.drawText(`Lot ${item.batch}`, {
        x: x + 16,
        y: yTop - cellHeight + 18,
        size: 7,
        font: regular,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    const bytes = await pdf.save();
    return new NextResponse(new Uint8Array(Buffer.from(bytes)), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Etiquetes_${order.id}.pdf"`,
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error al generar las etiquetas:', error);
    return NextResponse.json({ error: 'No se han podido generar las etiquetas.' }, { status: 500 });
  }
}
