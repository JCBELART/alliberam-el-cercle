import { NextResponse } from 'next/server';
import { createLead } from '../../../lib/orders';
import { parseLeadBody, ValidationError } from '../../../lib/validation';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body?.website === 'string' && body.website.trim()) {
      return NextResponse.json({ success: true });
    }

    const lead = parseLeadBody(body);
    if (!lead.consent) {
      return NextResponse.json(
        { success: false, error: 'Has d’acceptar la política de privacitat.' },
        { status: 400 }
      );
    }

    await createLead(lead);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('Error al guardar el lead:', error);
    return NextResponse.json(
      { success: false, error: 'No se ha podido completar el registro.' },
      { status: 500 }
    );
  }
}
