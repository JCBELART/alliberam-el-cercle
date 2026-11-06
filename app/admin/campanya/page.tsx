import React from 'react';
import { getCampaign, getStock } from '../../../lib/campaign';
import { formatDateTime, panelStyle, StatCard } from '../ui';
import CampaignControls from './CampaignControls';

export const dynamic = 'force-dynamic';

export default async function AdminCampaignPage() {
  const [campaign, stock] = await Promise.all([getCampaign(), getStock()]);
  const percent = Math.min(100, Math.round((stock.sold / stock.total) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '30px', margin: '0 0 6px 0', fontWeight: 800 }}>Campanya</h1>
        <p style={{ margin: 0, color: '#8a8a8a', fontSize: '14px' }}>
          Control de la tirada, l&apos;estoc i l&apos;obertura de vendes.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard label="Tirada actual" value={stock.batch} hint={`ID ${campaign.campaignId}`} />
        <StatCard label="Venudes en aquesta tirada" value={`${stock.sold} / ${stock.total}`} hint={`${percent}%`} accent="#4ade80" />
        <StatCard label="Disponibles" value={stock.available} hint="Ampolles restants" accent="#38bdf8" />
        <StatCard label="Total històric" value={stock.totalSold} hint="Suma de totes les tirades" accent="#a78bfa" />
      </div>

      <section style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '16px', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: '16px' }}>Estat de les vendes</h2>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: '999px',
              color: stock.salesOpen ? '#4ade80' : '#f87171',
              background: stock.salesOpen ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
              border: `1px solid ${stock.salesOpen ? '#4ade8055' : '#f8717155'}`,
            }}
          >
            {stock.salesOpen ? 'Vendes obertes' : 'Vendes tancades'}
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: '18px',
            borderRadius: '999px',
            background: '#1c1c1c',
            overflow: 'hidden',
            border: '1px solid #2a2a2a',
            marginBottom: '10px',
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #b8860b, #d4af37, #ffd700)',
            }}
          />
        </div>
        <p style={{ margin: 0, color: '#8a8a8a', fontSize: '13px' }}>
          Última actualització: {formatDateTime(campaign.updatedAt)}
        </p>
      </section>

      <section style={panelStyle}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Accions</h2>
        <CampaignControls salesOpen={stock.salesOpen} batch={stock.batch} />
      </section>
    </div>
  );
}
