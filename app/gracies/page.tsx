'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function GraciesContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [customerName, setCustomerName] = useState('JOAN CARLES BELTRÁN ARTOLA');
  const [customerEmail, setCustomerEmail] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Pots crear una petició ràpida a una API o recuperar les dades, 
      // o llegir directament si guardes un endpoint de confirmació.
      // Per ara, si no tens creat un endpoint de sessió, podem extreure'l o deixar-lo dinàmic.
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <main style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0,
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'rgba(20, 20, 20, 0.88)',
        borderTop: '2px solid rgba(255, 255, 255, 0.5)',
        borderLeft: '1.5px solid rgba(255, 255, 255, 0.3)',
        borderRight: '1.5px solid rgba(255, 255, 255, 0.3)',
        borderBottom: '1.5px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '36px',
        boxShadow: '0 30px 60px rgba(0, 0, 0, 0.95), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '50px 36px',
        maxWidth: '540px',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        {/* LOGO OFICIAL DESDE /LOGO_NEGRE.png */}
        <img
          src="/LOGO_NEGRE.png"
          alt="El Cercle"
          style={{
            width: '320px',
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 10px 20px rgba(255,255,255,0.15))'
          }}
        />

        {/* MOLTES GRÀCIES DESTACAT EN UN REQUADRE VERD */}
        <div style={{
          backgroundColor: 'rgba(0, 100, 0, 0.25)',
          border: '2px solid #2ecc71',
          borderRadius: '16px',
          padding: '16px 20px',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '15px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', color: '#2ecc71', fontWeight: 'bold' }}>
            MOLTES GRÀCIES PER LA TEVA COMPRA!
          </span>
        </div>

        <p style={{ fontSize: '16px', color: '#cccccc', lineHeight: '1.6', margin: 0 }}>
          El pagament s'ha processat correctament a través de Stripe. Hem assignat les teves ampolles de l'edició limitada i hem generat el teu <strong>Certificat de Propietat en PDF</strong>.
        </p>

        {/* CONTRAETIQUETA PERSONALITZADA DINÀMICA */}
        <div style={{
          backgroundColor: '#000000',
          border: '2px solid #d4af37',
          borderRadius: '20px',
          padding: '20px',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ fontSize: '12px', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
            Contraetiqueta Personalitzada (Gratuïta)
          </span>
          <span style={{ fontSize: '18px', color: '#ffffff', fontWeight: 'bold', textTransform: 'uppercase' }}>
            "{customerName}"
          </span>
        </div>

        <p style={{ fontSize: '14px', color: '#aaaaaa', margin: 0, lineHeight: '1.5' }}>
          T'acabem d'enviar un correu electrònic amb la confirmació de la comanda i el teu certificat adjunt.
        </p>

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
            display: 'inline-block'
          }}
        >
          Tornar a l'Inici
        </Link>
      </div>
    </main>
  );
}

export default function GraciesPage() {
  return (
    <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Carregant...</div>}>
      <GraciesContent />
    </Suspense>
  );
}