import { NextResponse } from 'next/server';
import { getOrder } from '../../../../../lib/orders';
import {
  confirmManualOrder,
  resendOrderEmail,
  setOrderNotes,
  setOrderStatus,
} from '../../../../../lib/admin-orders';
import type { OrderStatus } from '../../../../../lib/types';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: OrderStatus[] = [
  'pending_payment',
  'pending_bizum',
  'paid',
  'confirmed',
  'shipped',
  'cancelled',
  'refunded',
];

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const order = await getOrder(params.id);
    if (!order) {
      return NextResponse.json({ error: 'Comanda no trobada.' }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error al cargar la comanda:', error);
    return NextResponse.json({ error: 'No se ha podido cargar la comanda.' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const action = String(body?.action ?? '');

    switch (action) {
      case 'confirm': {
        const { order, emailWarning } = await confirmManualOrder(params.id);
        return NextResponse.json({ success: true, order, warning: emailWarning });
      }
      case 'resend': {
        const { order, emailWarning } = await resendOrderEmail(params.id);
        return NextResponse.json({ success: true, order, warning: emailWarning });
      }
      case 'status': {
        const status = String(body?.status ?? '') as OrderStatus;
        if (!VALID_STATUSES.includes(status)) {
          return NextResponse.json({ error: 'Estat no valid.' }, { status: 400 });
        }
        const order = await setOrderStatus(params.id, status);
        return NextResponse.json({ success: true, order });
      }
      case 'notes': {
        const order = await setOrderNotes(params.id, String(body?.notes ?? ''));
        return NextResponse.json({ success: true, order });
      }
      default:
        return NextResponse.json({ error: 'Accio no reconeguda.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error al actualizar la comanda:', error);
    const message = error instanceof Error ? error.message : 'Error desconegut.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
