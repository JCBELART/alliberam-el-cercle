import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { calculateTotals, BOTTLE_PRICE_CENTS, SHIPPING_CENTS } from '../../../lib/pricing';
import { createOrder, linkStripeSession, updateOrder } from '../../../lib/orders';
import { getStock } from '../../../lib/campaign';
import { parseCheckoutBody, ValidationError } from '../../../lib/validation';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function siteOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  const origin = request.headers.get('origin');
  if (origin) return origin.replace(/\/$/, '');
  return 'https://www.alliberamelcercle.digital';
}

export async function POST(request: Request) {
  let createdOrderId: string | null = null;

  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: 'La passarel·la de pagament no està configurada.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const input = parseCheckoutBody(body);

    const stock = await getStock();
    if (!stock.salesOpen) {
      return NextResponse.json(
        { success: false, error: 'Les vendes estan temporalment tancades. Torna-ho a provar aviat.' },
        { status: 409 }
      );
    }

    const totals = calculateTotals(input.totalBottles);

    const order = await createOrder({
      status: 'pending_payment',
      paymentMethod: 'stripe',
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
    createdOrderId = order.id;

    const stripe = new Stripe(secretKey);
    const origin = siteOrigin(request);
    const selection = Object.entries(input.quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([id, quantity]) => `${id} x${quantity}`)
      .join(', ');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'ca',
      customer_email: input.customer.email,
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `El Cercle · Edició Commemorativa 2026 (${input.totalBottles} ${
                input.totalBottles === 1 ? 'ampolla' : 'ampolles'
              })`,
              description: `Selecció: ${selection}`,
            },
            unit_amount: BOTTLE_PRICE_CENTS,
          },
          quantity: input.totalBottles,
        },
      ],
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: SHIPPING_CENTS, currency: 'eur' },
            display_name: 'Enviament estàndard (Península i Balears)',
          },
        },
      ],
      billing_address_collection: 'auto',
      allow_promotion_codes: false,
      success_url: `${origin}/gracies?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?cancel=1`,
    } as Stripe.Checkout.SessionCreateParams);

    if (!session.url) throw new Error('Stripe no ha retornat la URL de pagament.');

    const updated = await updateOrder(order.id, (current) => ({
      ...current,
      stripeSessionId: session.id,
    }));

    try {
      await linkStripeSession(session.id, updated.id);
    } catch (error) {
      if ((error as { name?: string })?.name !== 'AlreadyExistsError') throw error;
    }

    return NextResponse.json({ success: true, url: session.url, orderId: updated.id });
  } catch (error) {
    if (createdOrderId) {
      try {
        await updateOrder(createdOrderId, (order) => ({
          ...order,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
        }));
      } catch (updateError) {
        console.error('No se ha podido cancelar el pedido tras fallar Stripe:', updateError);
      }
    }

    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    console.error('Error al crear la sessió de checkout:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          'No hem pogut obrir la passarel·la de pagament. Torna-ho a provar o contacta amb nosaltres.',
      },
      { status: 500 }
    );
  }
}
