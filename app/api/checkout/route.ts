import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { buyerName, buyerCustomName, buyerEmail, selectedBottles } = body;

    if (!buyerName || !buyerEmail || !selectedBottles) {
      return NextResponse.json(
        { success: false, error: 'Dades incompletes per processar el pagament.' },
        { status: 400 }
      );
    }

    // Calcular la quantitat total d'ampolles de manera segura tant si ve com a objecte o array
    const quantity = typeof selectedBottles === 'object' && !Array.isArray(selectedBottles)
      ? Object.values(selectedBottles).reduce((a: any, b: any) => a + Number(b), 0)
      : Array.isArray(selectedBottles) ? selectedBottles.length : 0;

    if (quantity === 0) {
      return NextResponse.json(
        { success: false, error: 'Heu de seleccionar almenys una ampolla.' },
        { status: 400 }
      );
    }

    // Convertir l'objecte de selecció en un text llegible per a la descripció de Stripe
    const selectionDescription = typeof selectedBottles === 'object' && !Array.isArray(selectedBottles)
      ? Object.entries(selectedBottles)
          .filter(([_, qty]) => Number(qty) > 0)
          .map(([id, qty]) => `${id} (${qty})`)
          .join(', ')
      : Array.isArray(selectedBottles) ? selectedBottles.join(', ') : '';

    const origin = request.headers.get('origin') || 'https://alliberamelcercle.digital';

    // Determinar el nom final per a la contraetiqueta/certificat
    const finalBuyerName = buyerCustomName || buyerName;

    // Crear la sessió de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `El Cercle - Edició Commemorativa 2026 (${quantity} ${quantity === 1 ? 'ampolla' : 'ampolles'})`,
              description: `Selecció: ${selectionDescription}`,
            },
            unit_amount: 750, // 7,50 € per ampolla (en cèntims)
          },
          quantity: quantity,
        },
      ],
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 550, // 5,50 € de despeses d'enviament (en cèntims)
              currency: 'eur',
            },
            display_name: 'Enviament Estàndard (Península i Balears)',
          },
        },
      ],
      mode: 'payment',
      customer_email: buyerEmail,
      metadata: {
        buyerName: finalBuyerName.toUpperCase(),
        buyerEmail: buyerEmail,
        selectedBottles: JSON.stringify(selectedBottles),
      },
      success_url: `${origin}/gracies?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    } as Stripe.Checkout.SessionCreateParams);

    return NextResponse.json({ success: true, url: session.url });
  } catch (error: any) {
    console.error('Error al crear la sessió de checkout de Stripe:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error en el servidor de pagament.' },
      { status: 500 }
    );
  }
}