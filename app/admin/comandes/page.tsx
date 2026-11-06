import React from 'react';
import Link from 'next/link';
import { listOrders } from '../../../lib/orders';
import {
  formatDateTime,
  linkStyle,
  panelStyle,
  StatusBadge,
  tableStyle,
  tdStyle,
  thStyle,
} from '../ui';

export const dynamic = 'force-dynamic';

const FILTERS = [
  { value: 'all', label: 'Totes' },
  { value: 'pending_bizum', label: 'Pendents Bizum' },
  { value: 'pending_payment', label: 'Pendent pagament' },
  { value: 'paid', label: 'Pagades' },
  { value: 'confirmed', label: 'Confirmades' },
  { value: 'shipped', label: 'Enviades' },
  { value: 'cancelled', label: 'Cancel·lades' },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { status?: string; q?: string };
}) {
  const status = searchParams?.status ?? 'all';
  const query = (searchParams?.q ?? '').trim().toLowerCase();

  const all = await listOrders();
  let orders = all;
  if (status !== 'all') orders = orders.filter((order) => order.status === status);
  if (query) {
    orders = orders.filter(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerEmail.toLowerCase().includes(query)
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '30px', margin: '0 0 6px 0', fontWeight: 800 }}>Comandes</h1>
          <p style={{ margin: 0, color: '#8a8a8a', fontSize: '14px' }}>
            {orders.length} de {all.length} comandes
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/api/admin/export?type=orders" style={{ ...linkStyle, fontSize: '13px', border: '1px solid #2a2a2a', padding: '8px 14px', borderRadius: '999px' }}>
            Exportar comandes CSV
          </a>
          <a href="/api/admin/export?type=leads" style={{ ...linkStyle, fontSize: '13px', border: '1px solid #2a2a2a', padding: '8px 14px', borderRadius: '999px' }}>
            Exportar contactes CSV
          </a>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/comandes${filter.value === 'all' ? '' : `?status=${filter.value}`}`}
            style={{
              fontSize: '12px',
              padding: '8px 14px',
              borderRadius: '999px',
              textDecoration: 'none',
              color: status === filter.value ? '#111111' : '#cfcfcf',
              background: status === filter.value ? '#d4af37' : 'transparent',
              border: `1px solid ${status === filter.value ? '#d4af37' : '#2a2a2a'}`,
              fontWeight: 700,
            }}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <form action="/admin/comandes" method="get" style={{ display: 'flex', gap: '10px' }}>
        {status !== 'all' ? <input type="hidden" name="status" value={status} /> : null}
        <input
          type="search"
          name="q"
          defaultValue={searchParams?.q ?? ''}
          placeholder="Cercar per comanda, nom o correu..."
          style={{
            flex: 1,
            background: '#141414',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            padding: '12px 16px',
            color: '#ffffff',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            background: '#d4af37',
            color: '#111111',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 20px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Cercar
        </button>
      </form>

      <section style={panelStyle}>
        {orders.length === 0 ? (
          <p style={{ color: '#8a8a8a', margin: 0 }}>No hi ha comandes amb aquests filtres.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Comanda</th>
                  <th style={thStyle}>Data</th>
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Pagament</th>
                  <th style={thStyle}>Ampolles</th>
                  <th style={thStyle}>Números</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Estat</th>
                  <th style={thStyle}>Correu</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td style={tdStyle}>
                      <Link href={`/admin/comandes/${order.id}`} style={linkStyle}>{order.id}</Link>
                    </td>
                    <td style={{ ...tdStyle, color: '#9a9a9a', fontSize: '12px' }}>{formatDateTime(order.createdAt)}</td>
                    <td style={tdStyle}>
                      <div>{order.customerName}</div>
                      <div style={{ color: '#8a8a8a', fontSize: '12px' }}>{order.customerEmail}</div>
                    </td>
                    <td style={{ ...tdStyle, textTransform: 'uppercase', fontSize: '12px', color: '#9a9a9a' }}>{order.paymentMethod}</td>
                    <td style={tdStyle}>{order.bottleCount}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px' }}>
                      {order.serialFrom ? `${order.serialFrom}–${order.serialTo}` : '—'}
                      {order.batch ? <span style={{ color: '#8a8a8a' }}> · L{order.batch}</span> : null}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{(order.total / 100).toFixed(2).replace('.', ',')} €</td>
                    <td style={tdStyle}><StatusBadge status={order.status} /></td>
                    <td style={{ ...tdStyle, fontSize: '12px', color: order.emailSentAt ? '#4ade80' : '#facc15' }}>
                      {order.emailSentAt ? 'Enviat' : 'Pendent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
