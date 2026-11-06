'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getLabel } from '../../lib/labels';
import ARExperience from '../../components/ARExperience';
import type { WineType } from '../../lib/types';

interface BottleInfo {
  token: string;
  serial: number;
  batch: number;
  labelId: string;
  labelName: string;
  wineType: WineType;
  ownerName: string;
  orderId: string;
  createdAt: string;
}

const card: React.CSSProperties = {
  background: 'rgba(20, 20, 20, 0.9)',
  border: '1px solid #2a2a2a',
  borderRadius: '24px',
  boxShadow: '0 30px 60px rgba(0,0,0,0.55)',
};

function ExperienciaContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState(false);
  const [bottle, setBottle] = useState<BottleInfo | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setError('Falta el codi de la teva ampolla. Escaneja el QR del certificat o de l_etiqueta.');
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(`/api/experience?token=${encodeURIComponent(token)}`, {
          cache: 'no-store',
        });
        const data = await response.json();
        if (cancelled) return;
        if (!response.ok || !data?.success) {
          setError(data?.error || 'No hem trobat aquesta ampolla.');
          return;
        }
        setBottle(data.bottle);
        setAvailable(Boolean(data.available));
      } catch {
        if (!cancelled) setError('No hem pogut connectar amb el servidor. Torna-ho a provar.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const label = bottle ? getLabel(bottle.labelId) : undefined;

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '40px 20px 80px 20px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
      }}
    >
      <header style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <Link href="/">
          <img
            src="/LOGO_NEGRE.png"
            alt="El Cercle"
            style={{ width: '240px', maxWidth: '70vw', height: 'auto', filter: 'drop-shadow(0 8px 18px rgba(255,255,255,0.12))' }}
          />
        </Link>
        <span style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#d4af37', fontWeight: 700 }}>
          Experiència privada · El Cercle 2026
        </span>
      </header>

      {loading ? (
        <div style={{ ...card, padding: '40px', maxWidth: '560px', width: '100%', textAlign: 'center', color: '#d4af37' }}>
          Carregant la teva ampolla...
        </div>
      ) : error ? (
        <div style={{ ...card, padding: '40px', maxWidth: '560px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <span style={{ fontSize: '44px' }}>🔎</span>
          <h1 style={{ fontFamily: 'serif', fontSize: '24px', margin: 0 }}>No hem trobat l_ampolla</h1>
          <p style={{ color: '#bdbdbd', fontSize: '15px', lineHeight: 1.6, margin: 0 }}>{error}</p>
          <p style={{ color: '#8a8a8a', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
            Si acabes de comprar, espera uns minuts i torna a escanejar el QR. Si el problema continua, truca&apos;ns al 640 543 624.
          </p>
          <Link href="/" style={{ color: '#d4af37', fontSize: '14px' }}>
            Tornar a la botiga
          </Link>
        </div>
      ) : bottle ? (
        <>
          <section style={{ ...card, padding: '32px', maxWidth: '720px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <span style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#8a8a8a' }}>
              {available ? 'Certificat verificat' : 'Reserva pendent de confirmació'}
            </span>
            <h1 style={{ fontFamily: 'serif', fontSize: '32px', margin: 0, lineHeight: 1.3 }}>
              Benvingut/da,<br />{bottle.ownerName}
            </h1>
            <p style={{ color: '#bdbdbd', fontSize: '15px', lineHeight: 1.7, margin: 0, maxWidth: '560px', alignSelf: 'center' }}>
              Tens a les mans una peça única de l&apos;edició <strong style={{ color: '#d4af37' }}>El Cercle 2026</strong>.
              Aquesta ampolla duu el teu nom, un número de col·lecció i un codi irrepetible.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                marginTop: '8px',
              }}
            >
              <div style={{ background: '#0e0e0e', border: '1px solid #262626', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '1.5px', color: '#7a7a7a', textTransform: 'uppercase' }}>Número</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#d4af37', fontFamily: 'monospace' }}>
                  {String(bottle.serial).padStart(3, '0')}
                </div>
              </div>
              <div style={{ background: '#0e0e0e', border: '1px solid #262626', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '1.5px', color: '#7a7a7a', textTransform: 'uppercase' }}>Etiqueta</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '6px' }}>{bottle.labelName}</div>
              </div>
              <div style={{ background: '#0e0e0e', border: '1px solid #262626', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '1.5px', color: '#7a7a7a', textTransform: 'uppercase' }}>Vi</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '6px', color: bottle.wineType === 'NEGRE' ? '#e57373' : '#e8d48a' }}>
                  {bottle.wineType === 'NEGRE' ? 'Negre' : 'Blanc'}
                </div>
              </div>
              <div style={{ background: '#0e0e0e', border: '1px solid #262626', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '1.5px', color: '#7a7a7a', textTransform: 'uppercase' }}>Lot</div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '6px' }}>{bottle.batch}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
              {available ? (
                <a
                  href={`/api/certificate?token=${encodeURIComponent(bottle.token)}`}
                  style={{
                    padding: '14px 26px',
                    borderRadius: '999px',
                    background: '#d4af37',
                    color: '#111111',
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: '13px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  Descarregar certificat PDF
                </a>
              ) : (
                <span style={{ fontSize: '13px', color: '#facc15', lineHeight: 1.5 }}>
                  Estem verificant el pagament. Quan es confirmi, podràs descarregar el certificat i rebràs un correu.
                </span>
              )}
              <Link
                href="/"
                style={{
                  padding: '14px 26px',
                  borderRadius: '999px',
                  border: '1px solid #3a3a3a',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                Tornar a la botiga
              </Link>
            </div>
          </section>

          <section style={{ ...card, padding: '26px', maxWidth: '860px', width: '100%', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#d4af37', fontWeight: 700 }}>
                La teva ampolla en 3D
              </span>
              <h2 style={{ fontFamily: 'serif', fontSize: '24px', margin: '8px 0 4px 0' }}>
                Gira-la, mira-la i col·loca-la al teu món
              </h2>
              <p style={{ color: '#8a8a8a', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                {label ? `Etiqueta ${label.name} · ${label.location}. ` : ''}
                En un mòbil compatible pots obrir la càmera i veure l&apos;ampolla sobre una taula.
              </p>
            </div>
            <ARExperience
              labelImage={label?.image ?? '/Botella_Fondo_Negro.jpg'}
              labelName={bottle.labelName}
              serial={bottle.serial}
              wineType={bottle.wineType}
            />
          </section>

          <footer style={{ textAlign: 'center', color: '#6f6f6f', fontSize: '12px', lineHeight: 1.8, maxWidth: '620px' }}>
            <p style={{ margin: 0 }}>Comanda {bottle.orderId} · Codi {bottle.token.slice(0, 10).toUpperCase()}</p>
            <p style={{ margin: '4px 0 0 0' }}>Consum responsable. Venda exclusiva a majors de 18 anys.</p>
          </footer>
        </>
      ) : null}
    </main>
  );
}

export default function ExperienciaPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: '#000', color: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Carregant...
        </div>
      }
    >
      <ExperienciaContent />
    </Suspense>
  );
}
