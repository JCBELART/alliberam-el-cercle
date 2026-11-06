'use client';

import React, { useState } from 'react';

interface LabelOption {
  id: string;
  name: string;
  location: string;
  image: string;
}

const LABELS: LabelOption[] = [
  { id: 'barcelona', name: 'Montserrat', location: 'Barcelona', image: '/BARCELONA.jpg' },
  { id: 'girona', name: 'Costa Brava', location: 'Girona', image: '/GIRONA.jpg' },
  { id: 'lleida', name: 'Seu Vella', location: 'Lleida', image: '/LLEIDA.jpg' },
  { id: 'segadors', name: 'Els Segadors', location: 'Camp Català', image: '/SEGADORS.jpg' },
  { id: 'tarragona', name: 'Catedral de Tarragona', location: 'Tarragona', image: '/TARRAGONA.jpg' },
  { id: 'bruc', name: 'El Timbaler del Bruc', location: 'El Bruc', image: '/TAMBOLIRE_BRUC.jpg' }
];

export default function WhatsAppOrder() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [orderCompleted, setOrderCompleted] = useState<boolean>(false);

  const [quantities, setQuantities] = useState<{ [key: string]: number }>({
    barcelona: 0,
    girona: 0,
    lleida: 0,
    segadors: 0,
    tarragona: 0,
    bruc: 0
  });

  const [wineTypes, setWineTypes] = useState<{ [key: string]: 'BLANC' | 'NEGRE' }>({
    barcelona: 'BLANC',
    girona: 'BLANC',
    lleida: 'BLANC',
    segadors: 'BLANC',
    tarragona: 'BLANC',
    bruc: 'BLANC'
  });

  const totalBottles = Object.values(quantities).reduce((a, b) => a + b, 0);
  const bottlePrice = 7.50;
  const shippingCost = 5.50;
  const subtotal = totalBottles * bottlePrice;
  const grandTotal = subtotal > 0 ? subtotal + shippingCost : 0;
  const isPersonalizedUnlocked = totalBottles >= 6;

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const handleWineTypeChange = (id: string, type: 'BLANC' | 'NEGRE') => {
    setWineTypes(prev => ({
      ...prev,
      [id]: type
    }));
  };

  const handleSendWhatsApp = () => {
    if (totalBottles === 0) {
      alert('Per favor, selecciona almenys 1 ampolla.');
      return;
    }

    if (!clientPhone || clientPhone.trim().length < 9) {
      alert('Per favor, introdueix un número de telèfon vàlid del client.');
      return;
    }

    const selectedItems = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => {
        const labelName = LABELS.find(l => l.id === id)?.name || id;
        const type = wineTypes[id];
        return `- ${qty}x ${labelName} (${type})`;
      });

    const itemsText = selectedItems.join('%0A');
    const freePromoText = isPersonalizedUnlocked ? '%0A*CONTRAETIQUETA PERSONALITZADA GRATUÏTA INCLOSA*' : '';

    // 1. Missatge per a tu (Venedor: 640543626) -> COBRAR EN MÀ
    const sellerMessage = `NOVA COMANDA WHATSAPP (PAGAMENT EN MÀ):%0A%0AClient: ${clientName || 'No especificat'}%0ATelèfon: ${clientPhone}%0A%0A${itemsText}%0A${freePromoText}%0A%0AAMPOLLES: ${totalBottles}%0ATOTAL A COBRAR EN MÀ: ${grandTotal.toFixed(2)} EUR`;

    // 2. Missatge per al Client -> PAGAR EN MÀ
    const clientMessage = `Hola ${clientName || ''}! Resum de la teva comanda d'ALLIBERA'M:%0A%0A${itemsText}%0A${freePromoText}%0A%0AAMPOLLES: ${totalBottles}%0ATOTAL A PAGAR EN MÀ: ${grandTotal.toFixed(2)} EUR%0A%0AGràcies per la teva confiança! Et portarem la comanda properament.`;

    // Netejar el telèfon del client per a la URL
    const cleanClientPhone = clientPhone.replace(/\s+/g, '').replace('+', '');

    // Obrir el teu WhatsApp de venedor (34640543626) amb COBRAR
    const sellerWhatsappUrl = `https://wa.me/34640543626?text=${sellerMessage}`;
    window.open(sellerWhatsappUrl, '_blank');

    // Obrir el WhatsApp del client amb PAGAR
    const clientWhatsappUrl = `https://wa.me/34${cleanClientPhone}?text=${clientMessage}`;
    window.open(clientWhatsappUrl, '_blank');

    // Activar la pantalla de gràcies amb el botó de sortir a Google
    setOrderCompleted(true);
  };

  const glassButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.02) 100%)',
    borderTop: '2px solid rgba(255, 255, 255, 0.95)',
    borderLeft: '2px solid rgba(255, 255, 255, 0.7)',
    borderRight: '2px solid rgba(255, 255, 255, 0.7)',
    borderBottom: '2px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '100px',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.85), inset 0 2px 3px rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(16px)',
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: '1px',
    cursor: 'pointer',
    textTransform: 'uppercase',
    boxSizing: 'border-box'
  };

  const glassCircleStyle: React.CSSProperties = {
    ...glassButtonStyle,
    width: '44px',
    height: '44px',
    minWidth: '44px',
    minHeight: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0
  };

  const glassCardStyle: React.CSSProperties = {
    background: 'rgba(20, 20, 20, 0.88)',
    borderTop: '2px solid rgba(255, 255, 255, 0.5)',
    borderLeft: '1.5px solid rgba(255, 255, 255, 0.3)',
    borderRight: '1.5px solid rgba(255, 255, 255, 0.3)',
    borderBottom: '1.5px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '36px',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(20px)'
  };

  if (orderCompleted) {
    return (
      <div style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center'
      }}>
        <div style={{ ...glassCardStyle, padding: '40px 30px', maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontSize: '64px' }}>👏</span>
          <h2 style={{ fontSize: '24px', fontFamily: 'serif', letterSpacing: '2px', color: '#d4af37', margin: 0 }}>
            MOLTES GRÀCIES PER LA TEVA COMPRA I MOLTES GRÀCIES PER CONFIAR AMB NOSALTRES.
          </h2>
          <p style={{ fontSize: '16px', color: '#ccc', lineHeight: '1.6', margin: 0 }}>
            En breu et trucarem per portar-te la comanda a casa teva. <strong style={{ color: '#fff' }}>SALUT!</strong>
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', width: '100%', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setOrderCompleted(false);
                setQuantities({ barcelona: 0, girona: 0, lleida: 0, segadors: 0, tarragona: 0, bruc: 0 });
                setClientPhone('');
                setClientName('');
              }}
              style={{
                padding: '12px 24px',
                borderRadius: '100px',
                backgroundColor: '#d4af37',
                color: '#000',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Fer una altra comanda
            </button>
            <button
              onClick={() => {
                window.location.href = 'https://www.google.com/';
              }}
              style={{
                padding: '12px 24px',
                borderRadius: '100px',
                backgroundColor: '#333333',
                color: '#ffffff',
                fontWeight: 'bold',
                border: '1px solid #555',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              Sortir
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '20px 20px 220px 20px',
      boxSizing: 'border-box',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        
        {/* HEADER */}
        <header style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/LOGO_NEGRE.png" alt="El Cercle" style={{ width: '240px', height: 'auto', marginBottom: '12px' }} />
          <h1 style={{ fontSize: '32px', fontFamily: 'serif', letterSpacing: '4px', margin: 0 }}>ALLIBERA'M</h1>
          <p style={{ fontSize: '14px', color: '#d4af37', letterSpacing: '2px', fontWeight: 'bold', margin: '6px 0 0 0' }}>
            COMANDA RÀPIDA PER WHATSAPP (PAGAMENT EN MÀ)
          </p>
        </header>

        {/* SELECTOR DE ETIQUETES */}
        <section style={{ ...glassCardStyle, padding: '30px 20px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <p style={{ textAlign: 'center', fontSize: '15px', color: '#ccc', margin: 0, lineHeight: '1.5' }}>
            Tria el tipus de vi i la quantitat per a cada ampolla (<strong>7,50 €</strong> / AMPOLLA + <strong>5,50 €</strong> d'enviament):
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '24px', width: '100%' }}>
            {LABELS.map(item => (
              <div key={item.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
                <div onClick={() => setSelectedImage(item.image)} style={{ width: '100%', height: '220px', overflow: 'hidden', borderRadius: '16px', cursor: 'pointer' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <h4 style={{ fontSize: '18px', fontFamily: 'serif', margin: 0, color: '#ffffff' }}>{item.name}</h4>

                {/* SELECTOR VI BLANC / NEGRE */}
                <div style={{ display: 'flex', gap: '6px', width: '100%', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleWineTypeChange(item.id, 'BLANC')}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '8px',
                      border: wineTypes[item.id] === 'BLANC' ? '2px solid #d4af37' : '1px solid #444',
                      backgroundColor: wineTypes[item.id] === 'BLANC' ? 'rgba(212,175,55,0.2)' : '#111',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    VI BLANC
                  </button>
                  <button
                    onClick={() => handleWineTypeChange(item.id, 'NEGRE')}
                    style={{
                      flex: 1,
                      padding: '6px',
                      borderRadius: '8px',
                      border: wineTypes[item.id] === 'NEGRE' ? '2px solid #e57373' : '1px solid #444',
                      backgroundColor: wineTypes[item.id] === 'NEGRE' ? 'rgba(229,115,115,0.2)' : '#111',
                      color: '#fff',
                      fontWeight: 'bold',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    VI NEGRE
                  </button>
                </div>

                {/* BOTONS QUANTITAT */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: '6px 14px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <button onClick={() => handleQuantityChange(item.id, -1)} style={glassCircleStyle}>
                    &minus;
                  </button>
                  <span style={{ fontFamily: 'monospace', fontSize: '20px', width: '28px', color: '#ffffff', fontWeight: 'bold' }}>
                    {quantities[item.id] || 0}
                  </span>
                  <button onClick={() => handleQuantityChange(item.id, 1)} style={glassCircleStyle}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DADES DEL CLIENT */}
        <section style={{ ...glassCardStyle, padding: '24px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: '#d4af37', fontWeight: 'bold', textTransform: 'uppercase' }}>
                EL TEU NOM I COGNOMS:
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="NOM DEL CLIENT"
                style={{
                  width: '100%',
                  backgroundColor: '#141414',
                  border: '1px solid #444',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#ffffff',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: '#d4af37', fontWeight: 'bold', textTransform: 'uppercase' }}>
                EL TEU MÒBIL *:
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="600 000 000"
                style={{
                  width: '100%',
                  backgroundColor: '#141414',
                  border: '1px solid #444',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#ffffff',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        </section>

        {/* BARRA FIXA INFERIOR */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#0a0a0a',
          borderTop: '2px solid #22c55e',
          padding: '16px 20px',
          zIndex: 9000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.9)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '600px', fontSize: '16px', fontWeight: 'bold' }}>
            <span>AMPOLLES: {totalBottles}</span>
            <span style={{ color: '#d4af37' }}>TOTAL A PAGAR EN MÀ: {grandTotal.toFixed(2)} €</span>
          </div>

          <button
            onClick={handleSendWhatsApp}
            disabled={totalBottles === 0}
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '16px',
              borderRadius: '100px',
              backgroundColor: totalBottles > 0 ? '#22c55e' : '#333333',
              color: '#ffffff',
              fontSize: '17px',
              fontWeight: 'bold',
              border: 'none',
              cursor: totalBottles > 0 ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: totalBottles > 0 ? '0 0 20px rgba(34,197,94,0.4)' : 'none',
              textTransform: 'uppercase'
            }}
          >
            <span>ENVIAR COMANDA PER WHATSAPP</span>
          </button>
        </div>

      </div>

      {/* MODAL ZOOM */}
      {selectedImage && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '-40px', right: 0, color: '#fff', background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer' }}>&times;</button>
            <img src={selectedImage} alt="Etiqueta Ampliada" style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '12px' }} />
          </div>
        </div>
      )}
    </div>
  );
}