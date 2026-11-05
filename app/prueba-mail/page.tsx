'use client';

import { useState } from 'react';

export default function PruebaMailPage() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  const enviarPrueba = async () => {
    setLoading(true);
    setResultado(null);
    try {
      const res = await fetch('/api/generate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerName: "JOAN CARLES BELTRÁN ARTOLA",
          orderId: "ALB-2026-TEST",
          email: "joancarlesdisseny@hotmail.com",
          bottles: [
            { serialNumber: 1, labelName: "Allibera'm", wineType: "100% Garnatxa Blanca" }
          ]
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setResultado("¡Éxito! Certificado generado y correo enviado correctamente a joancarlesdisseny@hotmail.com.");
      } else {
        setResultado("Error: " + (data.error || 'Error desconegut'));
      }
    } catch (err: any) {
      console.error(err);
      setResultado("Error de connexió amb la API: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#0f0f0f',
      color: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ color: '#d4af37', textTransform: 'uppercase', marginBottom: '10px' }}>
        Banc de Proves - El Cercle
      </h1>
      <p style={{ color: '#888', marginBottom: '30px' }}>
        Generació de certificat PDF i enviament automàtic via Resend
      </p>

      <button
        onClick={enviarPrueba}
        disabled={loading}
        style={{
          background: '#d4af37',
          color: '#000',
          padding: '14px 28px',
          fontWeight: 'bold',
          fontSize: '14px',
          borderRadius: '24px',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          textTransform: 'uppercase',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Generant i enviant...' : 'Enviar Correu de Prova'}
      </button>

      {resultado && (
        <div style={{
          marginTop: '25px',
          padding: '15px 20px',
          background: resultado.includes('Éxito') ? '#113311' : '#331111',
          border: `1px solid ${resultado.includes('Éxito') ? '#44aa44' : '#aa4444'}`,
          borderRadius: '8px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          {resultado}
        </div>
      )}
    </div>
  );
}