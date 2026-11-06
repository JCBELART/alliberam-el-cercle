'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const btn: React.CSSProperties = {
  padding: '12px 20px',
  borderRadius: '10px',
  border: '1px solid #3a3a3a',
  background: '#1a1a1a',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '13px',
  cursor: 'pointer',
};

export default function CampaignControls({
  salesOpen,
  batch,
}: {
  salesOpen: boolean;
  batch: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: string, payload: Record<string, unknown> = {}) {
    setBusy(action);
    setMessage(null);
    setError(null);
    try {
      const response = await fetch('/api/admin/campaign', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Error al actualitzar.');
      setMessage('Campanya actualitzada.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          onClick={() => run('toggleSales', { salesOpen: !salesOpen })}
          disabled={busy !== null}
          style={{
            ...btn,
            background: salesOpen ? '#3a1414' : '#143a1c',
            borderColor: salesOpen ? '#f8717155' : '#4ade8055',
            color: salesOpen ? '#f87171' : '#4ade80',
            opacity: busy ? 0.6 : 1,
          }}
        >
          {salesOpen ? 'Tancar les vendes' : 'Obrir les vendes'}
        </button>
        <button
          onClick={() => {
            if (
              window.confirm(
                `Segur que vols iniciar una tirada nova? La tirada actual (${batch}) quedarà tancada i la numeració tornarà a 001.`
              )
            ) {
              run('newBatch', { confirm: true });
            }
          }}
          disabled={busy !== null}
          style={{ ...btn, opacity: busy ? 0.6 : 1 }}
        >
          Iniciar tirada nova
        </button>
      </div>
      <p style={{ margin: 0, color: '#8a8a8a', fontSize: '13px', lineHeight: 1.6 }}>
        Quan una tirada s&apos;esgota, el sistema crea automàticament la següent i torna a numerar des de 001.
        Cada ampolla conserva internament el número de lot perquè la traçabilitat no es perdi mai.
      </p>
      {message ? <p style={{ color: '#4ade80', margin: 0, fontSize: '13px' }}>{message}</p> : null}
      {error ? <p style={{ color: '#f87171', margin: 0, fontSize: '13px' }}>{error}</p> : null}
    </div>
  );
}
