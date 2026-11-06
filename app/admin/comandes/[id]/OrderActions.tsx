'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { OrderStatus } from '../../../../lib/types';

const btn: React.CSSProperties = {
  padding: '11px 18px',
  borderRadius: '10px',
  border: '1px solid #3a3a3a',
  background: '#1a1a1a',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '13px',
  cursor: 'pointer',
};

const primary: React.CSSProperties = {
  ...btn,
  background: '#d4af37',
  borderColor: '#d4af37',
  color: '#111111',
};

const statuses: Array<{ value: OrderStatus; label: string }> = [
  { value: 'pending_bizum', label: 'Pendent Bizum' },
  { value: 'paid', label: 'Pagada' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'shipped', label: 'Enviada' },
  { value: 'cancelled', label: 'Cancel·lada' },
  { value: 'refunded', label: 'Retornada' },
];

export default function OrderActions({
  orderId,
  status,
  hasItems,
  emailSent,
}: {
  orderId: string;
  status: OrderStatus;
  hasItems: boolean;
  emailSent: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  async function run(action: string, payload: Record<string, unknown> = {}) {
    setBusy(action);
    setMessage(null);
    setWarning(null);
    setError(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Error al actualitzar.');
      if (action === 'confirm') {
        setMessage('Comanda confirmada i ampolles assignades.');
      } else if (action === 'resend') {
        setMessage('Certificat enviat per correu.');
      } else {
        setMessage('Canvi desat.');
      }
      if (typeof data?.warning === 'string' && data.warning.length > 0) {
        setMessage(null);
        setWarning(`La comanda s'ha desat, però el correu no s'ha pogut enviar: ${data.warning}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconegut.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {!hasItems && (
          <button
            onClick={() => run('confirm')}
            disabled={busy !== null}
            style={{ ...primary, opacity: busy ? 0.6 : 1 }}
          >
            {busy === 'confirm' ? 'Confirmant...' : 'Confirmar pagament i assignar ampolles'}
          </button>
        )}
        {hasItems && !emailSent && (
          <button
            onClick={() => run('resend')}
            disabled={busy !== null}
            style={{ ...primary, opacity: busy ? 0.6 : 1 }}
          >
            {busy === 'resend' ? 'Enviant...' : 'Enviar certificat per correu'}
          </button>
        )}
        {hasItems && emailSent && (
          <button
            onClick={() => run('resend')}
            disabled={busy !== null}
            style={{ ...btn, opacity: busy ? 0.6 : 1 }}
          >
            {busy === 'resend' ? 'Reenviant...' : 'Reenviar certificat'}
          </button>
        )}
        {hasItems && (
          <a href={`/api/admin/orders/${orderId}/labels`} style={{ ...btn, textDecoration: 'none' }}>
            Descarregar etiquetes QR
          </a>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#8a8a8a', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Canviar estat
        </span>
        {statuses
          .filter((entry) => entry.value !== status)
          .map((entry) => (
            <button
              key={entry.value}
              onClick={() => run('status', { status: entry.value })}
              disabled={busy !== null}
              style={{ ...btn, padding: '8px 12px', fontSize: '12px', opacity: busy ? 0.6 : 1 }}
            >
              {entry.label}
            </button>
          ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notes internes (no les veu el client)"
          rows={2}
          style={{
            flex: 1,
            background: '#141414',
            border: '1px solid #2a2a2a',
            borderRadius: '10px',
            padding: '12px 14px',
            color: '#ffffff',
            fontSize: '14px',
            resize: 'vertical',
          }}
        />
        <button
          onClick={() => run('notes', { notes })}
          disabled={busy !== null || notes.trim().length === 0}
          style={{ ...btn, opacity: busy || notes.trim().length === 0 ? 0.6 : 1 }}
        >
          Desar notes
        </button>
      </div>

      {message ? <p style={{ color: '#4ade80', margin: 0, fontSize: '13px' }}>{message}</p> : null}
      {warning ? <p style={{ color: '#fbbf24', margin: 0, fontSize: '13px' }}>{warning}</p> : null}
      {error ? <p style={{ color: '#f87171', margin: 0, fontSize: '13px' }}>{error}</p> : null}
    </div>
  );
}
