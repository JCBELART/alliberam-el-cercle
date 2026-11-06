import { NextResponse } from 'next/server';
import { getOrder, getTokenRecord } from '../../../lib/orders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Devuelve la informacion publica de una botella a partir de su token.
 * No expone datos personales mas alla del nombre que el cliente quiso mostrar.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || '';

  if (!token) {
    return NextResponse.json({ success: false, error: 'Falta el token.' }, { status: 400 });
  }

  try {
    const record = await getTokenRecord(token);
    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Aquest codi no correspon a cap ampolla.' },
        { status: 404 }
      );
    }

    const order = await getOrder(record.orderId);
    const available = Boolean(
      order && ['paid', 'confirmed', 'shipped'].includes(order.status)
    );

    return NextResponse.json(
      {
        success: true,
        available,
        bottle: {
          token: record.token,
          serial: record.serial,
          batch: record.batch,
          labelId: record.labelId,
          labelName: record.labelName,
          wineType: record.wineType,
          ownerName: record.ownerName,
          orderId: record.orderId,
          createdAt: record.createdAt,
        },
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Error al consultar la experiencia:', error);
    return NextResponse.json(
      { success: false, error: 'No s_ha pogut carregar l_experiencia.' },
      { status: 500 }
    );
  }
}
