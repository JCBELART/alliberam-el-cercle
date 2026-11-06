import React from 'react';
import Link from 'next/link';
import { getStock } from '../../lib/campaign';
import { listLeads, listOrders } from '../../lib/orders';
import {
  formatDateTime,
  linkStyle,
  panelStyle,
  StatCard,
  StatusBadge,
  tableStyle,
  tdStyle,
  thStyle,
} from './ui';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [stock, orders, leads] = await Promise.all([getStock(), listOrders(), listLeads()]);

  const billable = orders.filter((order) => ['paid', 'confirmed', 'shipped'].includes(order.status));
  const revenue = billable.reduce((sum, order) => sum + order.total, 0);
  const bottles = billable.reduce((sum, order) => sum + order.bottleCount, 0);
  const pendingManual = orders.filter((order) => order.status === 'pending_bizum');
  const pendingPayment = orders.filter((order) => order.status === 'pending_payment');
  const recent = orders.slice(0, 8);
  const soldPercent = Math.min(100, Math.round((stock.sold / stock.total) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '30px', margin: '0 0 6px 0', fontWeight: 800 }}>Resum de la campanya</h1>
        <p style={{ margin: 0, color: '#8a8a8a', fontSize: '14px' }}>
          Dades en directe de la tirada actual. Els imports són en euros.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <StatCard label="Facturació" value={`${(revenue / 100).toFixed(2).replace('.', ',')} €`} hint={`${billable.length} comandes vàlides`} />
        <StatCard label="Ampolles venudes" value={bottles} hint="Pagades o confirmades" accent="#4ade80" />
        <StatCard label="Pendents Bizum" value={pendingManual.length} hint="Cal verificar manualment" accent="#38bdf8" />
        <StatCard label="Pagaments pendents" value={pendingPayment.length} hint="Stripe no completat" accent="#facc15" />
        <StatCard label="Contactes" value={leads.length} hint="Base de correu" accent="#a78bfa" />
        <StatCard label="Tirada actual" value={`${stock.sold} / ${stock.total}`} hint={`Lot ${stock.batch} · ${stock.available} disponibles`} accent="#d4af37" />
      </div>

      <section style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '17px' }}>Ocupació de la tirada {stock.batch}</h2>
            <p style={{ margin: '4px 0 0 0', color: '#8a8a8a', fontSize: '13px' }}>
              {stock.salesOpen ? 'Vendes obertes' : 'Vendes tancades'} · {stock.totalSold} ampolles venudes en total
            </p>
          </div>
          <Link href="/admin/campanya" style={{ ...linkStyle, fontSize: '13px' }}>
            Gestionar campanya →
          </Link>
        </div>
        <div
          style={{
            width: '100%',
            height: '18px',
            borderRadius: '999px',
            background: '#1c1c1c',
            overflow: 'hidden',
            border: '1px solid #2a2a2a',
          }}
        >
          <div
            style={{
              width: `${soldPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #b8860b, #d4af37, #ffd700)',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '12px', color: '#8a8a8a' }}>
          <span>{soldPercent}% venut</span>
          <span>{stock.available} ampolles disponibles</span>
        </div>
      </section>

      {pendingManual.length > 0 && (
        <section style={{ ...panelStyle, borderColor: '#38bdf855' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '17px', color: '#38bdf8' }}>Bizums per verificar</h2>
            <Link href="/admin/comandes?status=pending_bizum" style={{ ...linkStyle, fontSize: '13px' }}>
              Veure-les totes →
            </Link>
          </div>
          <p style={{ margin: '0 0 14px 0', color: '#8a8a8a', fontSize: '13px' }}>
            Comprova al teu banc que l&apos;import ha arribat abans de confirmar. En confirmar s&apos;assignen els números i s&apos;envia el certificat.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingManual.slice(0, 5).map((order) => (
              <li key={order.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid #242424', paddingTop: '10px' }}>
                <span>
                  <Link href={`/admin/comandes/${order.id}`} style={linkStyle}>{order.id}</Link>
                  <span style={{ color: '#8a8a8a', marginLeft: '10px', fontSize: '13px' }}>{order.customerName}</span>
                </span>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>{(order.total / 100).toFixed(2).replace('.', ',')} €</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '17px' }}>Últimes comandes</h2>
          <Link href="/admin/comandes" style={{ ...linkStyle, fontSize: '13px' }}>
            Totes les comandes →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p style={{ color: '#8a8a8a', margin: 0, fontSize: '14px' }}>Encara no hi ha comandes.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Comanda</th>
                  <th style={thStyle}>Data</th>
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Ampolles</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Estat</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((order) => (
                  <tr key={order.id}>
                    <td style={tdStyle}><Link href={`/admin/comandes/${order.id}`} style={linkStyle}>{order.id}</Link></td>
                    <td style={{ ...tdStyle, color: '#9a9a9a', fontSize: '12px' }}>{formatDateTime(order.createdAt)}</td>
                    <td style={tdStyle}>{order.customerName}</td>
                    <td style={tdStyle}>{order.bottleCount}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{(order.total / 100).toFixed(2).replace('.', ',')} €</td>
                    <td style={tdStyle}><StatusBadge status={order.status} /></td>
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
