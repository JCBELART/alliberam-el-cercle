import { NextResponse } from 'next/server';
import { getCampaign, getStock, setSalesOpen, startNewBatch } from '../../../../lib/campaign';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [campaign, stock] = await Promise.all([getCampaign(), getStock()]);
    return NextResponse.json({ campaign, stock });
  } catch (error) {
    console.error('Error al cargar la campaña:', error);
    return NextResponse.json({ error: 'No se ha podido cargar la campanya.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const action = String(body?.action ?? '');

    if (action === 'toggleSales') {
      const salesOpen = body?.salesOpen === true;
      const campaign = await setSalesOpen(salesOpen);
      return NextResponse.json({ success: true, campaign });
    }

    if (action === 'newBatch') {
      if (body?.confirm !== true) {
        return NextResponse.json(
          { error: 'Has de confirmar l_inici d_una nova tirada.' },
          { status: 400 }
        );
      }
      const campaign = await startNewBatch();
      return NextResponse.json({ success: true, campaign });
    }

    return NextResponse.json({ error: 'Accio no reconeguda.' }, { status: 400 });
  } catch (error) {
    console.error('Error al actualizar la campaña:', error);
    return NextResponse.json({ error: 'No se ha podido actualizar la campanya.' }, { status: 500 });
  }
}
