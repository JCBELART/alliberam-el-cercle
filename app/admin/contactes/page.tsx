import React from 'react';
import { listLeads } from '../../../lib/orders';
import { formatDateTime, linkStyle, panelStyle, tableStyle, tdStyle, thStyle } from '../ui';

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  const leads = await listLeads();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '30px', margin: '0 0 6px 0', fontWeight: 800 }}>Contactes</h1>
          <p style={{ margin: 0, color: '#8a8a8a', fontSize: '14px' }}>
            {leads.length} persones han acceptat rebre comunicacions.
          </p>
        </div>
        <a
          href="/api/admin/export?type=leads"
          style={{ ...linkStyle, fontSize: '13px', border: '1px solid #2a2a2a', padding: '8px 14px', borderRadius: '999px' }}
        >
          Exportar CSV
        </a>
      </div>

      <section style={panelStyle}>
        {leads.length === 0 ? (
          <p style={{ color: '#8a8a8a', margin: 0 }}>Encara no hi ha contactes.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Nom</th>
                  <th style={thStyle}>Correu</th>
                  <th style={thStyle}>Telèfon</th>
                  <th style={thStyle}>Origen</th>
                  <th style={thStyle}>Data</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td style={tdStyle}>{lead.name}</td>
                    <td style={tdStyle}>{lead.email}</td>
                    <td style={tdStyle}>{lead.phone ?? '—'}</td>
                    <td style={{ ...tdStyle, color: '#9a9a9a', fontSize: '12px' }}>{lead.source}</td>
                    <td style={{ ...tdStyle, color: '#9a9a9a', fontSize: '12px' }}>{formatDateTime(lead.createdAt)}</td>
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
