import 'server-only';

import { allocateItems } from './campaign';
import { sendOrderEmail } from './email';
import { createTokenRecords, getOrder, updateOrder } from './orders';
import { buildAllocationInputs } from './validation';
import type { Order, OrderStatus } from './types';

export type AdminActionResult = {
  order: Order;
  /** Set when the order was processed but the email could not be delivered. */
  emailWarning?: string;
};

export async function confirmManualOrder(orderId: string): Promise<AdminActionResult> {
  const order = await getOrder(orderId);
  if (!order) throw new Error('Pedido no encontrado.');
  if (['cancelled', 'refunded'].includes(order.status)) {
    throw new Error('No se puede confirmar un pedido cancelado o reembolsado.');
  }

  let current = order;
  let emailWarning: string | undefined;

  if (current.items.length === 0) {
    const items = await allocateItems(
      buildAllocationInputs(current.quantities, current.wineTypes)
    );
    current = await updateOrder(current.id, (value) => ({
      ...value,
      status: 'confirmed',
      paidAt: value.paidAt || new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      items,
      emailError: undefined,
    }));
    await createTokenRecords(current);
  } else if (current.status !== 'confirmed' && current.status !== 'shipped') {
    current = await updateOrder(current.id, (value) => ({
      ...value,
      status: 'confirmed',
      paidAt: value.paidAt || new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
    }));
  }

  if (!current.emailSentAt) {
    const result = await trySendOrderEmail(current);
    current = result.order;
    emailWarning = result.emailWarning;
  }

  return { order: current, emailWarning };
}

/**
 * Attempts to send the order email. Never throws: delivery problems are stored
 * on the order and returned as a warning so the caller keeps the confirmed order.
 */
async function trySendOrderEmail(order: Order): Promise<AdminActionResult> {
  try {
    await sendOrderEmail(order);
    const updated = await updateOrder(order.id, (value) => ({
      ...value,
      emailSentAt: new Date().toISOString(),
      emailError: undefined,
    }));
    return { order: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const trimmed = message.slice(0, 500);
    try {
      const updated = await updateOrder(order.id, (value) => ({
        ...value,
        emailError: trimmed,
      }));
      return { order: updated, emailWarning: trimmed };
    } catch (persistError) {
      console.error('No se pudo guardar el error de correo:', persistError);
      return { order: { ...order, emailError: trimmed }, emailWarning: trimmed };
    }
  }
}

export async function resendOrderEmail(orderId: string): Promise<AdminActionResult> {
  const order = await getOrder(orderId);
  if (!order) throw new Error('Pedido no encontrado.');
  if (order.items.length === 0) {
    throw new Error('Primero confirma el pedido para asignar las botellas.');
  }
  return trySendOrderEmail(order);
}

export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  return updateOrder(orderId, (order) => {
    const next: Order = { ...order, status };
    if (status === 'shipped') next.shippedAt = new Date().toISOString();
    if (status === 'cancelled') next.cancelledAt = new Date().toISOString();
    if (status === 'refunded') next.refundedAt = new Date().toISOString();
    return next;
  });
}

export async function setOrderNotes(orderId: string, notes: string): Promise<Order> {
  return updateOrder(orderId, (order) => ({
    ...order,
    adminNotes: notes.slice(0, 2000),
  }));
}
