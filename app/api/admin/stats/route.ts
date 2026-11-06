import { NextResponse } from 'next/server';
import { getStock } from '../../../../lib/campaign';
import { listLeads, listOrders } from '../../../../lib/orders';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [stock, orders, leads] = await Promise.all([getStock(), listOrders(), listLeads()]);
    const billable = orders.filter((order) =>
      ['paid', 'confirmed', 'shipped'].includes(order.status)
    );
    const revenue = billable.reduce((sum, order) => sum + order.total, 0);
    const bottles = billable.reduce((sum, order) => sum + order.bottleCount, 0);
    const pending = orders.filter((order) => order.status === 'pending_bizum').length;
    const pendingPayment = orders.filter((order) => order.status === 'pending_payment').length;

    return NextResponse.json({
      stock,
      orders: orders.length,
      billableOrders: billable.length,
      pendingManual: pending,
      pendingPayment,
      leads: leads.length,
      revenue,
      bottles,
    });
  } catch (error) {
    console.error('Error al cargar el panel:', error);
    return NextResponse.json({ error: 'No se ha podido cargar el panel.' }, { status: 500 });
  }
}
