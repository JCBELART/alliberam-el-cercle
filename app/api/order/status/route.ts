import { NextResponse } from 'next/server';
import { getOrderByStripeSession, publicOrder } from '../../../../lib/orders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id') || '';

  if (!sessionId || !sessionId.startsWith('cs_')) {
    return NextResponse.json({ success: false, error: 'Sessió no vàlida.' }, { status: 400 });
  }

  try {
    const order = await getOrderByStripeSession(sessionId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Comanda no trobada.' }, { status: 404 });
    }

    const publicData = publicOrder(order);
    return NextResponse.json(
      {
        success: true,
        order: {
          ...publicData,
          customerName: publicData.customerName.split(' ')[0] || publicData.customerName,
        },
      },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Error al consultar el estado del pedido:', error);
    return NextResponse.json(
      { success: false, error: 'No se ha podido consultar la comanda.' },
      { status: 500 }
    );
  }
}
