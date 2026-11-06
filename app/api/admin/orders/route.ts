import { NextResponse } from 'next/server';
import { listOrders, rebuildOrderIndex } from '../../../../lib/orders';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await listOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error al listar pedidos:', error);
    return NextResponse.json({ error: 'No se han podido listar los pedidos.' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const orders = await rebuildOrderIndex();
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error('Error al reconstruir el índice:', error);
    return NextResponse.json({ error: 'No se ha podido reconstruir el índice.' }, { status: 500 });
  }
}
