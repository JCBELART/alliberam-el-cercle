import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { buildAllocationInputs } from '../../../lib/validation';
import { allocateItems } from '../../../lib/campaign';
import {
  createTokenRecords,
  getOrder,
  getOrderByStripeSession,
  hasWebhookEvent,
  markWebhookEvent,
  updateOrder,
} from '../../../lib/orders';
import { sendOrderEmail } from '../../../lib/email';
import type { Order } from '../../../lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Falta STRIPE_SECRET_KEY.');
  return new Stripe(key);
}

function paymentIntentId(session: Stripe.Checkout.Session): string | undefined {
  if (!session.payment_intent) return undefined;
  return typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent.id;
}

async function processPaidSession(session: Stripe.Checkout.Session): Promise<void> {
  const orderId = session.metadata?.orderId || session.client_reference_id;
  const order = orderId
    ? await getOrder(orderId)
    : await getOrderByStripeSession(session.id);

  if (!order) {
    console.warn(`Webhook: pedido no encontrado para la sesión ${session.id}.`);
    return;
  }

  if (['cancelled', 'refunded'].includes(order.status)) return;

  let paidOrder: Order = order;

  if (order.status !== 'paid' || order.items.length === 0) {
    const items = await allocateItems(
      buildAllocationInputs(order.quantities, order.wineTypes)
    );

    paidOrder = await updateOrder(order.id, (current) => {
      if (current.status === 'paid' && current.items.length > 0) return current;
      return {
        ...current,
        status: 'paid',
        paidAt: current.paidAt || new Date().toISOString(),
        items,
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId(session),
        customer: {
          ...current.customer,
          name: current.customer.name || session.customer_details?.name?.toUpperCase() || '',
          email: current.customer.email || session.customer_details?.email || '',
          phone: current.customer.phone || session.customer_details?.phone || '',
        },
        emailError: undefined,
      };
    });

    await createTokenRecords(paidOrder);
  } else {
    const paymentIntent = paymentIntentId(session);
    if (!paidOrder.stripePaymentIntentId && paymentIntent) {
      paidOrder = await updateOrder(order.id, (current) => ({
        ...current,
        stripePaymentIntentId: paymentIntent,
      }));
    }
  }

  if (!paidOrder.emailSentAt) {
    try {
      await sendOrderEmail(paidOrder);
      paidOrder = await updateOrder(paidOrder.id, (current) => ({
        ...current,
        emailSentAt: new Date().toISOString(),
        emailError: undefined,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await updateOrder(paidOrder.id, (current) => ({
        ...current,
        emailError: message.slice(0, 500),
      }));
      throw error;
    }
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  if (!webhookSecret) {
    console.error('Webhook: falta STRIPE_WEBHOOK_SECRET. Se rechaza la petición.');
    return NextResponse.json({ error: 'Webhook no configurado.' }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: 'Falta la firma de Stripe.' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook: firma no válida.', error);
    return NextResponse.json({ error: 'Firma no válida.' }, { status: 400 });
  }

  try {
    if (await hasWebhookEvent(event.id)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === 'paid') {
          await processPaidSession(session);
        }
        break;
      }
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId || session.client_reference_id;
        if (orderId) {
          const order = await getOrder(orderId);
          if (order && order.status === 'pending_payment') {
            await updateOrder(order.id, (current) => ({
              ...current,
              status: 'cancelled',
              cancelledAt: new Date().toISOString(),
            }));
          }
        }
        break;
      }
      default:
        break;
    }

    await markWebhookEvent(event.id, event.type);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook: error procesando el evento.', error);
    return NextResponse.json(
      { error: 'Error procesando el evento. Stripe reintentará.' },
      { status: 500 }
    );
  }
}
