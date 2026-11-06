import { NextResponse } from 'next/server';
import { listLeads, listOrders } from '../../../../lib/orders';
import { formatEuros } from '../../../../lib/pricing';

export const dynamic = 'force-dynamic';

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') === 'leads' ? 'leads' : 'orders';

    if (type === 'leads') {
      const leads = await listLeads();
      const header = ['ID', 'Data', 'Nom', 'Email', 'Telefon', 'Origen', 'Consentiment'];
      const rows = leads.map((lead) =>
        [
          lead.id,
          lead.createdAt,
          lead.name,
          lead.email,
          lead.phone ?? '',
          lead.source,
          lead.consent ? 'SI' : 'NO',
        ]
          .map(csvCell)
          .join(',')
      );
      const csv = '\uFEFF' + [header.map(csvCell).join(','), ...rows].join('\r\n');
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="contactes-el-cercle.csv"',
        },
      });
    }

    const summaries = await listOrders();
    const header = [
      'Comanda',
      'Data',
      'Estat',
      'Pagament',
      'Client',
      'Email',
      'Total',
      'Ampolles',
      'Lot',
      'Serie des',
      'Serie fins',
      'Email enviat',
    ];
    const rows = summaries.map((order) =>
      [
        order.id,
        order.createdAt,
        order.status,
        order.paymentMethod,
        order.customerName,
        order.customerEmail,
        formatEuros(order.total),
        order.bottleCount,
        order.batch ?? '',
        order.serialFrom ?? '',
        order.serialTo ?? '',
        order.emailSentAt ?? '',
      ]
        .map(csvCell)
        .join(',')
    );
    const csv = '\uFEFF' + [header.map(csvCell).join(','), ...rows].join('\r\n');
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="comandes-el-cercle.csv"',
      },
    });
  } catch (error) {
    console.error('Error al exportar:', error);
    return NextResponse.json({ error: 'No se ha podido generar l_exportacio.' }, { status: 500 });
  }
}
