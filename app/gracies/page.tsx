'use client';

import React, { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface OrderItemView {
  labelId: string;
  labelName: string;
  wineType: 'BLANC' | 'NEGRE';
  serial: number;
  batch: number;
  token: string;
}

interface OrderView {
  id: string;
  status: string;
  createdAt: string;
  customerName: string;
  personalizedName: string | null;
  total: number;
  emailSentAt?: string;
  items: OrderItemView[];
}

const card: React.CSSProperties = {
  background: 'rgba(20, 20, 20, 0.9)',
  borderTop: '2px solid rgba(255, 255, 255, 0.5)',
  borderLeft: '1.5px solid rgba(255, 255, 255, 0.3)',
  borderRight: '1.5px solid rgba(255, 255, 255, 0.3)',
  borderBottom: '1.5px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '36px',
  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.95), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
  padding: '44px 34px',
  maxWidth: '620px',
  width: '100%',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '22px',
};

function StatusLine({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pending_payment: { label: "Confirmant el pagament amb Stripe...", color: '#facc15' },
    paid: { label: 'Pagament confirmat. Generant el teu certificat...', color: '#4ade80' },
    confirmed: { label: 'Comanda confirmada. Certificat enviat.', color: '#4ade80' },
    shipped: { label: 'Comanda enviada.', color: '#a78bfa' },
    cancelled: { label: 'La comanda ha estat cancel·lada.', color: '#f87171' },
    refunded: { label: 'Comanda retornada.', color: '#fb923c' },
  };
  const entry = map[status] ?? { label: 'Processant la comanda...', color: '#facc15' };
  return <span style={{ fontSize: '13px', color: entry.color, fontWeight: 700 }}>{entry.label}</span>;
}

function GraciesContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No hem trobat la sessió de pagament.');
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(`/api/order/status?session_id=${encodeURIComponent(sessionId)}`, {
          cache: 'no-store',
        });
        const data = await response.json();
        if (cancelled) return;

        if (!response.ok || !data?.success) {
          if (response.status === 404 && attempts < 8) {
            timerRef.current = setTimeout(() => setAttempts((value) => value + 1), 2000);
            return;
          }
          setError(data?.error || 'No hem pogut recuperar la comanda.');
          return;
        }

        setOrder(data.order);

        const status = data.order?.status;
        if (['pending_payment', 'paid'].includes(status) && attempts < 30) {
          timerRef.current = setTimeout(() => setAttempts((value) => value + 1), 2500);
        }
      } catch {
        if (!cancelled) {
          if (attempts < 10) {
            timerRef.current = setTimeout(() => setAttempts((value) => value + 1), 2500);
          } else {
            setError('No hem pogut connectar amb el servidor.');
          }
        }
      }
    };

    load();

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sessionId, attempts]);

  const firstToken = order?.items[0]?.token;

  return (
    <main
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        padding: '24px 20px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={card}>
        <img
          src="/LOGO_NEGRE.png"
          alt="El Cercle"
          style={{ width: '300px', maxWidth: '100%', height: 'auto', objectFit: 'contain' }}
        />

        <div
          style={{
            backgroundColor: 'rgba(0, 100, 0, 0.25)',
            border: '2px solid #2ecc71',
            borderRadius: '16px',
            padding: '14px 20px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <span style={{ fontSize: '14px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', color: '#2ecc71', fontWeight: 'bold' }}>
            MOLTES GRÀCIES PER LA TEVA COMPRA!
          </span>
        </div>

        {error ? (
          <>
            <p style={{ fontSize: '15px', color: '#f87171', margin: 0, lineHeight: 1.6 }}>{error}</p>
            <p style={{ fontSize: '13px', color: '#aaaaaa', margin: 0, lineHeight: 1.6 }}>
              Si el pagament s&apos;ha fet correctament, rebràs igualment el correu amb el certificat. També pots trucar-nos al 640 543 624.
            </p>
          </>
        ) : !order ? (
          <>
            <span style={{ fontSize: '40px' }}>⏳</span>
            <p style={{ fontSize: '15px', color: '#cccccc', margin: 0, lineHeight: 1.6 }}>
              Estem confirmant el pagament. Aquesta pantalla s&apos;actualitza sola.
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: '16px', color: '#cccccc', lineHeight: 1.6, margin: 0 }}>
              Gràcies, <strong style={{ color: '#ffffff' }}>{order.customerName}</strong>. Hem registrat la teva comanda{' '}
              <strong style={{ color: '#d4af37' }}>{order.id}</strong>.
            </p>
            <StatusLine status={order.status} />

            {order.personalizedName ? (
              <div
                style={{
                  backgroundColor: '#000000',
                  border: '2px solid #d4af37',
                  borderRadius: '20px',
                  padding: '18px',
                  width: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '11px', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
                  Contraetiqueta personalitzada
                </span>
                <span style={{ fontSize: '18px', color: '#ffffff', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {order.personalizedName}
                </span>
              </div>
            ) : null}

            {order.items.length > 0 ? (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#8a8a8a', letterSpacing: '2px', textTransform: 'uppercase' }}>
                  Les teves ampolles
                </span>
                {order.items.map((item) => (
                  <div
                    key={item.token}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '12px',
                      borderBottom: '1px solid #2a2a2a',
                      paddingBottom: '8px',
                      fontSize: '13px',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ color: '#d4af37', fontWeight: 700, fontFamily: 'monospace' }}>
                      Núm. {String(item.serial).padStart(3, '0')}
                    </span>
                    <span style={{ color: '#e5e5e5', flex: 1 }}>
                      {item.labelName} · {item.wineType === 'NEGRE' ? 'Negre' : 'Blanc'}
                    </span>
                    <span style={{ color: '#6f6f6f' }}>Lot {item.batch}</span>
                  </div>
                ))}
              </div>
            ) : null}

            <p style={{ fontSize: '14px', color: '#aaaaaa', margin: 0, lineHeight: 1.6 }}>
              {order.emailSentAt
                ? "T'hem enviat un correu amb el certificat de propietat en PDF."
                : "Estem generant el teu certificat. El rebràs per correu en pocs minuts."}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {firstToken && ['paid', 'confirmed', 'shipped'].includes(order.status) ? (
                <>
                  <a
                    href={`/api/certificate?token=${encodeURIComponent(firstToken)}`}
                    style={{
                      background: '#d4af37',
                      color: '#111111',
                      borderRadius: '100px',
                      padding: '15px 28px',
                      textDecoration: 'none',
                      fontWeight: 800,
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Descarregar certificat
                  </a>
                  <Link
                    href={`/experiencia?token=${encodeURIComponent(firstToken)}`}
                    style={{
                      border: '1px solid #444444',
                      color: '#ffffff',
                      borderRadius: '100px',
                      padding: '15px 28px',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  >
                    Obri l&apos;experiència
                  </Link>
                </>
              ) : null}
            </div>
          </>
        )}

        <Link
          href="/"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.02) 100%)',
            borderTop: '2px solid rgba(255, 255, 255, 0.95)',
            borderLeft: '2px solid rgba(255, 255, 255, 0.7)',
            borderRight: '2px solid rgba(255, 255, 255, 0.7)',
            borderBottom: '2px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '100px',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.85), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -4px 8px rgba(0, 0, 0, 0.8)',
            color: '#ffffff',
            fontWeight: '800',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            padding: '18px 44px',
            textDecoration: 'none',
            fontSize: '15px',
            marginTop: '10px',
            display: 'inline-block',
          }}
        >
          Tornar a l&apos;Inici
        </Link>

        <p style={{ fontSize: '11px', color: '#5f5f5f', margin: 0, lineHeight: 1.6 }}>
          Consum responsable. Venda exclusiva a majors de 18 anys.
        </p>
      </div>
    </main>
  );
}

export default function GraciesPage() {
  return (
    <Suspense
      fallback={
        <div style={{ color: '#fff', textAlign: 'center', padding: '50px', background: '#000', minHeight: '100vh' }}>
          Carregant...
        </div>
      }
    >
      <GraciesContent />
    </Suspense>
  );
}
