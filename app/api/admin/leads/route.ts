import { NextResponse } from 'next/server';
import { listLeads } from '../../../../lib/orders';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leads = await listLeads();
    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Error al listar los leads:', error);
    return NextResponse.json({ error: 'No se han podido listar los contactos.' }, { status: 500 });
  }
}
