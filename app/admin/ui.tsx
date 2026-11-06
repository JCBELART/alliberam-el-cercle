import React from 'react';
import { formatEuros } from '../../lib/pricing';
import type { OrderStatus } from '../../lib/types';

export const panelStyle: React.CSSProperties = {
  background: 'rgba(20, 20, 20, 0.9)',
  border: '1px solid #2a2a2a',
  borderRadius: '20px',
  padding: '24px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
};

export const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px',
};

export const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  color: '#8a8a8a',
  fontSize: '11px',
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  borderBottom: '1px solid #2a2a2a',
  whiteSpace: 'nowrap',
};

export const tdStyle: React.CSSProperties = {
  padding: '12px',
  borderBottom: '1px solid #1e1e1e',
  color: '#e8e8e8',
  verticalAlign: 'middle',
};

export const linkStyle: React.CSSProperties = {
  color: '#d4af37',
  textDecoration: 'none',
  fontWeight: 600,
};

const STATUS_LABELS: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  pending_payment: { label: 'Pendent pagament', color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
  pending_bizum: { label: 'Pendent Bizum', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  paid: { label: 'Pagada', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  confirmed: { label: 'Confirmada', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  shipped: { label: 'Enviada', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  cancelled: { label: 'Cancel·lada', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  refunded: { label: 'Retornada', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_LABELS[status] ?? {
    label: status,
    color: '#cccccc',
    bg: 'rgba(255,255,255,0.08)',
  };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        color: config.color,
        background: config.bg,
        border: `1px solid ${config.color}55`,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </span>
  );
}

export function formatDateTime(value?: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ca-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Money({ cents }: { cents: number }) {
  return <span>{formatEuros(cents)}</span>;
}

export function StatCard({
  label,
  value,
  hint,
  accent = '#d4af37',
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        ...panelStyle,
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderTop: `2px solid ${accent}`,
      }}
    >
      <span
        style={{
          fontSize: '11px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: '#8a8a8a',
          fontWeight: 700,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: '30px', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
        {value}
      </span>
      {hint ? <span style={{ fontSize: '12px', color: '#7a7a7a' }}>{hint}</span> : null}
    </div>
  );
}
