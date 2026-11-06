import { NextResponse } from 'next/server';
import { getStock } from '../../../lib/campaign';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const stock = await getStock();
    return NextResponse.json(stock, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error('Error al consultar el stock:', error);
    return NextResponse.json(
      { error: 'No se ha podido consultar la disponibilidad.' },
      { status: 500 }
    );
  }
}
