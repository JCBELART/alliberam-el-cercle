import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOrder } from '../../../../lib/orders';
import { formatEuros } from '../../../../lib/pricing';
import { formatDateTime, linkStyle, panelStyle, StatusBadge, tableStyle, tdStyle, thStyle } from '../../ui';
import OrderActions from './OrderActions';

export const dynamic = 'force-dynamic';

function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '11px', color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
      <span style={{ fontSize: '14px', color: '#e8e8e8' }}>{value || '—'}</span>
    </div>
  );
}

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);
  if (!order) notFound();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Link href="/admin/comandes" style={{ ...linkStyle, fontSize: '12px' }}>
            ← Tornar a comandes
          </Link>
          <h1 style={{ fontSize: '30px', margin: '8px 0 6px 0', fontWeight: 800 }}>{order.id}</h1>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status={order.status} />
            <span style={{ color: '#8a8a8a', fontSize: '13px' }}>Creada {formatDateTime(order.createdAt)}</span>
            <span style={{ color: '#8a8a8a', fontSize: '13px' }}>Pagament: {order.paymentMethod.toUpperCase()}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '1px' }}>Total</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#d4af37' }}>{formatEuros(order.total)}</div>
          <div style={{ fontSize: '12px', color: '#8a8a8a' }}>
            {formatEuros(order.subtotal)} + {formatEuros(order.shipping)} enviament
          </div>
        </div>
      </div>

      <section style={{ ...panelStyle, display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <h2 style={{ margin: 0, fontSize: '16px' }}>Accions</h2>
        <OrderActions
          orderId={order.id}
          status={order.status}
          hasItems={order.items.length > 0}
          emailSent={Boolean(order.emailSentAt)}
        />
        {order.emailError ? (
          <p style={{ color: '#f87171', fontSize: '12px', margin: 0 }}>Últim error de correu: {order.emailError}</p>
        ) : null}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        <section style={{ ...panelStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', gridColumn: '1 / -1' }}>Client</h2>
          <DataRow label="Nom" value={order.customer.name} />
          <DataRow label="Correu" value={order.customer.email} />
          <DataRow label="Telèfon" value={order.customer.phone} />
          <DataRow label="País" value={order.customer.country} />
          <DataRow label="Adreça" value={order.customer.address} />
          <DataRow label="Població" value={`${order.customer.postalCode} ${order.customer.city}`} />
          <DataRow label="Contraetiqueta" value={order.personalizedName} />
          <DataRow label="Màrqueting" value={order.marketingConsent ? 'Sí' : 'No'} />
        </section>

        <section style={{ ...panelStyle, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', gridColumn: '1 / -1' }}>Facturació i seguiment</h2>
          <DataRow label="Factura sol·licitada" value={order.invoice ? 'Sí' : 'No'} />
          <DataRow label="Raó social" value={order.invoice?.name} />
          <DataRow label="NIF/CIF" value={order.invoice?.taxId} />
          <DataRow label="Adreça fiscal" value={order.invoice ? `${order.invoice.address}, ${order.invoice.postalCode} ${order.invoice.city}` : null} />
          <DataRow label="Pagat" value={order.paidAt ? formatDateTime(order.paidAt) : null} />
          <DataRow label="Confirmat" value={order.confirmedAt ? formatDateTime(order.confirmedAt) : null} />
          <DataRow label="Correu enviat" value={order.emailSentAt ? formatDateTime(order.emailSentAt) : null} />
          <DataRow label="Sessió Stripe" value={order.stripeSessionId} />
        </section>
      </div>

      <section style={panelStyle}>
        <h2 style={{ margin: '0 0 14px 0', fontSize: '16px' }}>
          Ampolles assignades ({order.items.length})
        </h2>
        {order.items.length === 0 ? (
          <p style={{ color: '#8a8a8a', margin: 0, fontSize: '14px' }}>
            Encara no s&apos;han assignat números. Confirma el pagament per assignar-los.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Número</th>
                  <th style={thStyle}>Etiqueta</th>
                  <th style={thStyle}>Vi</th>
                  <th style={thStyle}>Lot</th>
                  <th style={thStyle}>Token / QR</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.token}>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 700 }}>
                      {String(item.serial).padStart(3, '0')}
                    </td>
                    <td style={tdStyle}>{item.labelName}</td>
                    <td style={tdStyle}>{item.wineType === 'NEGRE' ? 'Negre' : 'Blanc'}</td>
                    <td style={tdStyle}>{item.batch}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '11px', color: '#8a8a8a' }}>
                      <a
                        href={`/experiencia?token=${encodeURIComponent(item.token)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#8a8a8a' }}
                      >
                        {item.token}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {order.adminNotes ? (
        <section style={panelStyle}>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Notes internes</h2>
          <p style={{ margin: 0, color: '#c9c9c9', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{order.adminNotes}</p>
        </section>
      ) : null}
    </div>
  );
}
