import { NextResponse } from 'next/server';
import { calculateTotals } from '../../../lib/pricing';
import { createLead, createOrder } from '../../../lib/orders';
import { getStock } from '../../../lib/campaign';
import { parseCheckoutBody, ValidationError } from '../../../lib/validation';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = parseCheckoutBody(body);
    const channel = body?.channel === 'whatsapp' ? 'whatsapp' : 'bizum';

    const stock = await getStock();
    if (!stock.salesOpen) {
      return NextResponse.json(
        { success: false, error: 'Les vendes estan temporalment tancades. Torna-ho a provar aviat.' },
        { status: 409 }
      );
    }

    const totals = calculateTotals(input.totalBottles);
    const order = await createOrder({
      status: 'pending_bizum',
      paymentMethod: channel,
      customer: input.customer,
      invoice: input.invoice,
      quantities: input.quantities,
      wineTypes: input.wineTypes,
      items: [],
      subtotal: totals.subtotalCents,
      shipping: totals.shippingCents,
      total: totals.totalCents,
      currency: 'EUR',
      personalizedName: input.personalizedName,
      acceptsTerms: input.acceptsTerms,
      marketingConsent: input.marketingConsent,
    });

    if (input.marketingConsent) {
      try {
        await createLead({
          name: input.customer.name,
          email: input.customer.email,
          phone: input.customer.phone,
          source: `${channel}-order`,
          consent: true,
        });
      } catch (error) {
        console.error('No se ha podido guardar el lead:', error);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      total: order.total,
      channel,
      message:
        channel === 'bizum'
          ? `Comanda ${order.id} reservada. Fes el Bizum al 640 543 624 posant el teu nom i el codi de comanda al concepte.`
          : `Comanda ${order.id} reservada. Envia'ns el missatge de WhatsApp per confirmar-la.`,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    console.error('Error al crear la comanda manual:', error);
    return NextResponse.json(
      { success: false, error: 'No hem pogut registrar la comanda. Torna-ho a provar.' },
      { status: 500 }
    );
  }
}
