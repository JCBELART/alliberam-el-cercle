import { NextResponse } from 'next/server';
import { generateDiplomaBuffer } from '../../../lib/generateDiploma';
import { getOrder, getTokenRecord } from '../../../lib/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || '';

  if (!token) {
    return NextResponse.json({ error: 'Falta el token.' }, { status: 400 });
  }

  try {
    const record = await getTokenRecord(token);
    if (!record) {
      return NextResponse.json({ error: 'Certificat no trobat.' }, { status: 404 });
    }

    const order = await getOrder(record.orderId);
    if (!order || !['paid', 'confirmed', 'shipped'].includes(order.status)) {
      return NextResponse.json({ error: 'Aquest certificat encara no està disponible.' }, { status: 403 });
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.alliberamelcercle.digital').replace(
      /\/$/,
      ''
    );

    const pdf = await generateDiplomaBuffer({
      buyerName: order.personalizedName || order.customer.name,
      orderNumber: order.id,
      dateStr: formatDate(order.paidAt || order.createdAt),
      bottles: order.items.map((item) => ({
        label: item.labelName,
        wineType: item.wineType,
        serial: item.serial,
        batch: item.batch,
        token: item.token,
      })),
      verifyUrl: `${siteUrl}/experiencia?token=${encodeURIComponent(token)}`,
      batchSize: 500,
    });

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Certificat_El_Cercle_${order.id}.pdf"`,
        'Cache-Control': 'private, no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error al generar el certificado:', error);
    return NextResponse.json(
      { error: 'No se ha podido generar el certificado. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
