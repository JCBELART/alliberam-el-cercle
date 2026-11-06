'use client';

import React, { useState, useEffect, useRef } from 'react';
import SiteFooter from '../components/SiteFooter';

declare global {
  interface Window {
    confetti?: (options?: any) => void;
  }
}

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

export default function Home() {
  const [ageVerified, setAgeVerified] = useState<boolean>(false);
  const [cookiesChoice, setCookiesChoice] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loadingPayment, setLoadingPayment] = useState<boolean>(false);

  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentStep === 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const timer = setTimeout(() => {
        if (navRef.current) {
          const elementPosition = navRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - 20;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

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

  const [formData, setFormData] = useState({
    fullName: '',
    customName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    needsInvoice: false,
    taxId: '',
    invoiceName: '',
    invoiceAddress: '',
    invoiceCity: '',
    invoicePostalCode: ''
  });

  const [orderComplete, setOrderComplete] = useState(false);
  const [bizumModal, setBizumModal] = useState(false);

  const [stock, setStock] = useState<{
    available: number;
    total: number;
    sold: number;
    batch: number;
    totalSold: number;
    salesOpen: boolean;
  } | null>(null);
  const [stockStale, setStockStale] = useState(false);
  const [acceptsTerms, setAcceptsTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualOrder, setManualOrder] = useState<{ id: string; message: string; total: number } | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  const totalBottles = Object.values(quantities).reduce((a, b) => a + b, 0);
  const bottlePrice = 7.50;
  const shippingCost = 5.50;
  const subtotal = totalBottles * bottlePrice;
  const grandTotal = subtotal > 0 ? subtotal + shippingCost : 0;
  const isPersonalizedUnlocked = totalBottles >= 6;
  const bottlesNeededForPersonalization = Math.max(0, 6 - totalBottles);

  const wasUnlocked = useRef<boolean>(false);

  useEffect(() => {
    if (isPersonalizedUnlocked && !wasUnlocked.current) {
      wasUnlocked.current = true;

      const triggerMassiveConfetti = () => {
        if (window.confetti) {
          window.confetti({
            particleCount: 180,
            spread: 120,
            origin: { x: 0.5, y: 0.8 },
            colors: ['#d4af37', '#ffffff', '#ffd700', '#22c55e', '#e57373']
          });

          setTimeout(() => {
            window.confetti({
              particleCount: 120,
              spread: 160,
              origin: { x: 0.2, y: 0.9 }
            });
          }, 250);

          setTimeout(() => {
            window.confetti({
              particleCount: 120,
              spread: 160,
              origin: { x: 0.8, y: 0.9 }
            });
          }, 500);
        }
      };

      if (!window.confetti) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
        script.async = true;
        script.onload = () => triggerMassiveConfetti();
        document.body.appendChild(script);
      } else {
        triggerMassiveConfetti();
      }
    } else if (!isPersonalizedUnlocked) {
      wasUnlocked.current = false;
    }
  }, [isPersonalizedUnlocked]);

  useEffect(() => {
    try {
      if (window.localStorage.getItem('elcercle_age') === '1') setAgeVerified(true);
      if (window.localStorage.getItem('elcercle_cookies') === '1') setCookiesChoice(true);
    } catch {
      // almacenamiento no disponible
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadStock = async () => {
      try {
        const response = await fetch('/api/stock', { cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error('stock');
        if (active) {
          setStock(data);
          setStockStale(false);
        }
      } catch {
        if (active) setStockStale(true);
      }
    };
    loadStock();
    const timer = setInterval(loadStock, 30000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const availableNow = stock ? stock.available : 500;
  const salesOpen = stock ? stock.salesOpen : true;

  const handleAgeVerified = () => {
    setAgeVerified(true);
    try {
      window.localStorage.setItem('elcercle_age', '1');
    } catch {
      // almacenamiento no disponible
    }
  };

  const handleCookies = (choice: 'all' | 'necessary') => {
    setCookiesChoice(true);
    try {
      window.localStorage.setItem('elcercle_cookies', choice);
    } catch {
      // almacenamiento no disponible
    }
  };

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities(prev => {
      const next = Math.max(0, (prev[id] || 0) + delta);
      const currentTotal = Object.values(prev).reduce((a, b) => a + b, 0);
      if (delta > 0 && currentTotal >= availableNow) return prev;
      return { ...prev, [id]: next };
    });
  };

  const handleWineTypeChange = (id: string, type: 'BLANC' | 'NEGRE') => {
    setWineTypes(prev => ({
      ...prev,
      [id]: type
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const buildOrderPayload = () => ({
    quantities,
    wineTypes,
    customer: {
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      postalCode: formData.postalCode,
      country: 'ES',
    },
    invoice: formData.needsInvoice
      ? {
          invoiceName: formData.invoiceName,
          taxId: formData.taxId,
          invoiceAddress: formData.invoiceAddress,
          invoiceCity: formData.invoiceCity,
          invoicePostalCode: formData.invoicePostalCode,
        }
      : null,
    needsInvoice: formData.needsInvoice,
    personalizedName: formData.customName || formData.fullName,
    acceptsTerms,
    marketingConsent,
    totalBottles,
  });

  const handleStripeCheckout = async () => {
    if (!acceptsTerms) {
      alert('Has d’acceptar les condicions de compra i la política de privacitat.');
      return;
    }
    setLoadingPayment(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildOrderPayload()),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Error al connectar amb la pasarel·la de pagament.');
        setLoadingPayment(false);
      }
    } catch (error) {
      console.error('Error en el pagament:', error);
      alert('No hem pogut connectar amb la passarel·la de pagament. Torna-ho a provar.');
      setLoadingPayment(false);
    }
  };

  const handleManualOrder = async () => {
    if (!acceptsTerms) {
      setManualError('Has d’acceptar les condicions de compra i la política de privacitat.');
      return;
    }
    setManualLoading(true);
    setManualError(null);
    try {
      const response = await fetch('/api/manual-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildOrderPayload(), channel: 'bizum' }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'No hem pogut registrar la comanda.');
      }
      setManualOrder({ id: data.orderId, message: data.message, total: data.total });
      setStock((current) =>
        current
          ? {
              ...current,
              available: Math.max(0, current.available - totalBottles),
              sold: current.sold + totalBottles,
              totalSold: current.totalSold + totalBottles,
            }
          : current
      );
    } catch (error) {
      setManualError(error instanceof Error ? error.message : 'Error desconegut.');
    } finally {
      setManualLoading(false);
    }
  };

  const glassButtonStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.02) 100%)',
    borderTop: '2px solid rgba(255, 255, 255, 0.95)',
    borderLeft: '2px solid rgba(255, 255, 255, 0.7)',
    borderRight: '2px solid rgba(255, 255, 255, 0.7)',
    borderBottom: '2px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '100px',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.85), inset 0 2px 3px rgba(255, 255, 255, 0.95), inset 0 -4px 8px rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    color: '#ffffff',
    fontWeight: '800',
    letterSpacing: '1px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.9)',
    textTransform: 'uppercase',
    boxSizing: 'border-box'
  };

  const glassCircleStyle: React.CSSProperties = {
    ...glassButtonStyle,
    width: '56px',
    height: '56px',
    minWidth: '56px',
    minHeight: '56px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    lineHeight: '1',
    overflow: 'visible'
  };

  const glassCardStyle: React.CSSProperties = {
    background: 'rgba(20, 20, 20, 0.88)',
    borderTop: '2px solid rgba(255, 255, 255, 0.5)',
    borderLeft: '1.5px solid rgba(255, 255, 255, 0.3)',
    borderRight: '1.5px solid rgba(255, 255, 255, 0.3)',
    borderBottom: '1.5px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '36px',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.95), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)'
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      margin: 0,
      padding: '20px 20px 140px 20px',
      overflowX: 'hidden',
      position: 'relative',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>

      {/* BADGE FLOTANTE DE DUDAS */}
      <a
        href="tel:640543624"
        style={{
          position: 'fixed',
          top: '50%',
          right: 'max(20px, calc((100vw - 950px) / 4 - 110px))',
          transform: 'translateY(-50%)',
          zIndex: 8000,
          width: '220px',
          height: '220px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #ffd700, #d4af37 60%, #b8860b)',
          boxShadow: '-10px 15px 35px rgba(0, 0, 0, 0.85), inset 0 3px 6px rgba(255, 255, 255, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          color: '#111111',
          padding: '20px',
          boxSizing: 'border-box',
          cursor: 'pointer',
          transition: 'transform 0.2s ease, boxShadow 0.2s ease',
          border: '3px solid #111111'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.06)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <div style={{
          position: 'absolute',
          inset: '10px',
          borderRadius: '50%',
          border: '2px dashed #111111',
          pointerEvents: 'none'
        }} />

        <span style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: '1' }}>
          DUBTES?
        </span>
        <span style={{ fontSize: '22px', fontWeight: '900', margin: '10px 0 6px 0', letterSpacing: '1px' }}>
          640 543 624
        </span>
        <span style={{ fontSize: '15px', fontWeight: '800', opacity: 0.9, textTransform: 'uppercase' }}>
          (JOAN CARLES)
        </span>
      </a>
      
      {/* VERIFICACIÓ D'EDAT */}
      {!ageVerified && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.88)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            color: '#111111',
            borderRadius: '16px',
            padding: '40px 30px',
            maxWidth: '460px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <img
              src="/LOGO_NEGRE.png"
              alt="Celler Batea"
              style={{ width: '180px', height: 'auto', objectFit: 'contain', filter: 'brightness(0)' }}
            />
            <h3 style={{ fontSize: '22px', fontFamily: 'serif', margin: 0, fontWeight: 'bold', textTransform: 'uppercase' }}>
              BENVINGUT A ALLIBERA'M
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.5', color: '#444444', margin: 0 }}>
              L'accés a aquesta web està restringit a més de 18 anys. En continuar, confirmes que tens l'edat legal per consumir alcohol al teu país de residència.
            </p>
            <p style={{ fontSize: '15px', fontWeight: 'bold', margin: '5px 0', textTransform: 'uppercase' }}>
              TENS 18 ANYS O MÉS?
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', width: '100%' }}>
              <button
                onClick={() => { window.location.href = 'https://www.google.es'; }}
                style={{
                  backgroundColor: '#333333',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 35px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '15px',
                  textTransform: 'uppercase'
                }}
              >
                NO
              </button>
              <button
                onClick={handleAgeVerified}
                style={{
                  backgroundColor: '#333333',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 35px',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '15px',
                  textTransform: 'uppercase'
                }}
              >
                SÍ
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#2e7d32', fontWeight: '600', marginTop: '5px' }}>
              <span>✓</span> Recordarem la teva confirmació en aquest navegador
            </div>
          </div>
        </div>
      )}

      {/* FOTO DE FONDO */}
      <div style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}>
        <img
          src="/Botella_Fondo_Negro.jpg"
          alt="Fondo Botella El Cercle"
          style={{
            maxWidth: '148.5vw',
            maxHeight: '126.5vh',
            transform: 'scale(1.265)',
            objectFit: 'contain',
            objectPosition: 'center 20%',
            opacity: 0.38,
            filter: 'drop-shadow(0 0 45px rgba(255, 255, 255, 0.15))'
          }}
        />
      </div>

      {/* CONTENIDOR PRINCIPAL */}
      <div style={{
        width: '100%',
        maxWidth: '950px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 2,
        position: 'relative'
      }}>
        
        {/* CAPÇALERA */}
        <header style={{ width: '100%', textAlign: 'center', marginBottom: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src="/LOGO_NEGRE.png"
            alt="El Cercle"
            style={{ width: '336px', height: 'auto', objectFit: 'contain', marginBottom: '20px', filter: 'drop-shadow(0 10px 20px rgba(255,255,255,0.15))' }}
          />
          <h1 style={{ fontSize: '48px', fontFamily: 'serif', letterSpacing: '6px', margin: '0 0 8px 0', textTransform: 'uppercase', color: '#ffffff', fontWeight: 'bold' }}>
            ALLIBERA'M
          </h1>
          <p style={{ fontSize: '16px', letterSpacing: '3px', color: '#d4af37', textTransform: 'uppercase', margin: 0, fontWeight: 'bold', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>EDICIÓ LIMITADA NUMERADA DE 500 BOTELLES</span>
            <span>TERRA ALTA</span>
          </p>
        </header>

        {/* NAVEGACIÓ */}
        <div ref={navRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <nav style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '40px',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '16px 28px',
            borderRadius: '100px',
            borderTop: '2px solid rgba(255, 255, 255, 0.6)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {[1, 2, 3, 4, 5].map(step => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                style={{
                  ...glassCircleStyle,
                  fontSize: '22px',
                  fontWeight: '800',
                  color: '#ffffff',
                  opacity: currentStep === step ? 1 : 0.5,
                  transform: currentStep === step ? 'scale(1.1)' : 'scale(1)',
                  border: currentStep === step ? '2.5px solid rgba(255, 255, 255, 0.95)' : '2px solid rgba(255, 255, 255, 0.4)'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', WebkitFontSmoothing: 'antialiased' }}>{step}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* MAIN */}
        <main style={{ width: '100%' }}>

          {/* PAS 1 */}
          {currentStep === 1 && (
            <section style={{ ...glassCardStyle, padding: '48px 36px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
              <span style={{ padding: '10px 24px', backgroundColor: 'rgba(212,175,55,0.2)', color: '#d4af37', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '3px', borderRadius: '30px', fontWeight: 'bold', border: '1px solid rgba(212,175,55,0.4)' }}>
                BENVINGUT A ALLIBERA'M &bull; TERRA ALTA
              </span>
              <h2 style={{ fontSize: '36px', fontFamily: 'serif', color: '#ffffff', margin: 0, lineHeight: '1.3', textTransform: 'uppercase' }}>
                VI EXCLUSIU I DE LA TERRA<br />
                L'ESÈNCIA D'UNA TERRA LLIURE
              </h2>
              <p style={{ fontSize: '19px', color: '#dddddd', lineHeight: '1.8', maxWidth: '750px', margin: 0 }}>
                Us presentem una edició limitada i numerada de tan sols <strong>500 ampolles de col·lecció</strong> de la comarca de la <strong>Terra Alta</strong> (<strong>7,50 € / ampolla</strong> + <strong>5,50 € d'enviament</strong>). Cada ampolla és una peça única que duu el seu propi identificador i un codi QR exclusiu que desplega una experiència interactiva en <strong>Realitat Augmentada (WebAR)</strong> i el Certificat Oficial de Propietat en PDF.
              </p>

              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontSize: '18px', fontFamily: 'monospace', color: '#d4af37', backgroundColor: '#000000', padding: '16px 32px', borderRadius: '24px', border: '1px solid #333' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ color: '#aaa' }}>BOTELLES DISPONIBLES:</span>
                  <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '22px' }}>
                    {stock ? stock.available : '—'} / {stock ? stock.total : 500}
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#7a7a7a', letterSpacing: '1px' }}>
                  {stock ? `TIRADA ${stock.batch} · ${stock.totalSold} AMPOLLES VENUDES EN TOTAL` : 'CARREGANT DISPONIBILITAT...'}
                </span>
                {!salesOpen ? (
                  <span style={{ fontSize: '12px', color: '#f87171', fontWeight: 700 }}>
                    VENDES TEMPORALMENT TANCADES
                  </span>
                ) : null}
                {stockStale ? (
                  <span style={{ fontSize: '11px', color: '#facc15' }}>
                    No hem pogut actualitzar l_estoc. Es mostrarà el darrer valor conegut.
                  </span>
                ) : null}
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                style={{
                  ...glassButtonStyle,
                  marginTop: '12px',
                  padding: '22px 56px',
                  fontSize: '18px',
                  letterSpacing: '2px'
                }}
              >
                SEGÜENT: NOTES DE TAST
              </button>
            </section>
          )}

          {/* PAS 2 */}
          {currentStep === 2 && (
            <section style={{ ...glassCardStyle, padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: '36px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '14px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '3px', color: '#d4af37', fontWeight: 'bold' }}>PAS 2 DE 5</span>
                <h3 style={{ fontSize: '42px', fontFamily: 'serif', margin: '8px 0 8px 0', color: '#ffffff', textTransform: 'uppercase', fontWeight: 'bold', lineHeight: '1.2' }}>
                  NOTES DE TAST<br />TERRA ALTA
                </h3>
                <p style={{ fontSize: '18px', color: '#ccc', margin: 0, textTransform: 'uppercase' }}>CONÈIX LES CARACTERÍSTIQUES DEL NOSTRE VI BLANC I VI NEGRE</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                
                {/* FICHA VI BLANC */}
                <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #222', paddingBottom: '16px' }}>
                    <h4 style={{ fontSize: '48px', fontFamily: 'serif', color: '#d4af37', margin: 0, textTransform: 'uppercase', fontWeight: 'bold' }}>VI BLANC</h4>
                    <span style={{ backgroundColor: 'rgba(212,175,55,0.2)', color: '#d4af37', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', width: 'fit-content', textTransform: 'uppercase' }}>100% GARNATXA BLANCA</span>
                  </div>
                  <div style={{ fontSize: '15px', color: '#dddddd', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ margin: 0 }}><strong>COLOR:</strong> Groc pàl·lid amb ribets verdosos.</p>
                    <p style={{ margin: 0 }}><strong>AROMA:</strong> Intens, fresc, net amb tocs de cítrics barrejats amb fruita blanca com la pera, poma, préssec blanc i herba tallada. Fons tropical de pinya i plàtan.</p>
                    <p style={{ margin: 0 }}><strong>GUST:</strong> En boca vibrant combinació de cítrics amb fruita blanca i un toc tropical. Fresc, equilibrat amb bona acidesa i post-gust llarg.</p>
                    <p style={{ margin: 0 }}><strong>GRADUACIÓ:</strong> 13%</p>
                    <p style={{ margin: 0 }}><strong>MARIDATGE:</strong> Arrossos de peix, mixtes i orientals, fideuà, marisc, amanides verdes, pasta amb salses marineres, peix blanc, pizza, formatges fosos i xocolata.</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#d4af37', marginTop: '4px' }}><strong>PREMIS I MENCIONS:</strong> Medalla d'Argent (Grenaches du Monde 2026), Medalla d'Or (2025, 2024, 2022, 2021), Gran Or GIROVI (2023, 2021).</p>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center', paddingTop: '16px', borderTop: '1px solid #222' }}>
                    <img src="/Girovins.jpg" alt="GIROVI Premi" style={{ height: '65px', width: 'auto', objectFit: 'contain', borderRadius: '8px' }} />
                    <img src="/Gernaches.png" alt="Grenaches du Monde" style={{ height: '65px', width: 'auto', objectFit: 'contain', borderRadius: '8px' }} />
                  </div>
                </div>

                {/* FICHA VI NEGRE */}
                <div style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '24px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #222', paddingBottom: '16px' }}>
                    <h4 style={{ fontSize: '48px', fontFamily: 'serif', color: '#e57373', margin: 0, textTransform: 'uppercase', fontWeight: 'bold' }}>VI NEGRE</h4>
                    <span style={{ backgroundColor: 'rgba(229,115,115,0.2)', color: '#e57373', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold', width: 'fit-content', textTransform: 'uppercase' }}>100% GARNATXA NEGRA</span>
                  </div>
                  <div style={{ fontSize: '15px', color: '#dddddd', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <p style={{ margin: 0 }}><strong>COLOR:</strong> Roig cirera madura amb ribets violetes.</p>
                    <p style={{ margin: 0 }}><strong>AROMA:</strong> Intens que recorda fruites vermelles com maduixes, cireres i fruits silvestres amb fins matisos especiats i toc de regalèssia.</p>
                    <p style={{ margin: 0 }}><strong>GUST:</strong> En boca és carnós, saborós, tanins del raïm marcats i dolços, fons de fruita vermella madura i regalèssia. Bona acidesa i persistència.</p>
                    <p style={{ margin: 0 }}><strong>GRADUACIÓ:</strong> 14,5%</p>
                    <p style={{ margin: 0 }}><strong>MARIDATGE:</strong> Carns blanques amb salses fortes, xai a la planxa o forn, estofats i carns vermelles a la graella. Formatges d'ovella i amanides amb fruits secs.</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#e57373', marginTop: '4px' }}><strong>PREMIS I MENCIONS:</strong> Medalla d'Or (Grenaches du Monde 2026, 2024), Medalla Gran Or GIROVI (2025, 2024).</p>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'center', paddingTop: '16px', borderTop: '1px solid #222' }}>
                    <img src="/Girovins.jpg" alt="GIROVI Premi" style={{ height: '65px', width: 'auto', objectFit: 'contain', borderRadius: '8px' }} />
                    <img src="/Gernaches.png" alt="Grenaches du Monde" style={{ height: '65px', width: 'auto', objectFit: 'contain', borderRadius: '8px' }} />
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', paddingTop: '10px' }}>
                <button
                  onClick={() => setCurrentStep(1)}
                  style={{ ...glassButtonStyle, padding: '18px 36px', fontSize: '16px' }}
                >
                  ENRERE
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  style={{ ...glassButtonStyle, padding: '18px 36px', fontSize: '16px' }}
                >
                  SEGÜENT: TRIA LES ETIQUETES
                </button>
              </div>
            </section>
          )}

          {/* PAS 3 */}
          {currentStep === 3 && (
            <section style={{ ...glassCardStyle, padding: '40px 28px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '14px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '3px', color: '#d4af37', fontWeight: 'bold' }}>PAS 3 DE 5</span>
                <h3 style={{ fontSize: '34px', fontFamily: 'serif', margin: '8px 0 8px 0', color: '#ffffff', textTransform: 'uppercase' }}>SELECCIONA LES TEVES ETIQUETES</h3>
                <p style={{ fontSize: '16px', color: '#ccc', margin: 0, maxWidth: '780px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.5' }}>
                  Tria l&apos;etiqueta i tipus de vi (BLANC o NEGRE) per a cada ampolla (<strong style={{ color: '#d4af37' }}>7,50 €</strong> / AMPOLLA). Queden <strong style={{ color: '#ffffff' }}>{availableNow}</strong> ampolles en aquesta tirada.
                </p>
              </div>

              <div
                style={{
                  padding: '20px 24px',
                  borderRadius: '24px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '18px',
                  letterSpacing: '1px',
                  backgroundColor: isPersonalizedUnlocked ? 'rgba(34, 197, 94, 0.25)' : 'rgba(234, 179, 8, 0.25)',
                  color: isPersonalizedUnlocked ? '#4ade80' : '#facc15',
                  border: isPersonalizedUnlocked ? '2px solid #15803d' : '2px solid #a16207',
                  boxShadow: isPersonalizedUnlocked ? '0 0 30px rgba(34,197,94,0.45)' : '0 0 20px rgba(234,179,8,0.2)',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isPersonalizedUnlocked ? (
                  <span>ENHORABONA! TENS LA PERSONALITZACIÓ DE LA CONTRAETIQUETA TOTALMENT GRATUÏTA</span>
                ) : (
                  <span>QUEDEN {bottlesNeededForPersonalization} {bottlesNeededForPersonalization === 1 ? 'AMPOLLA' : 'AMPOLLES'} PER A DESBLOQUEJAR LA PERSONALITZACIÓ DE LA CONTRAETIQUETA (MÍNIM 6)</span>
                )}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '32px',
                width: '100%'
              }}>
                {LABELS.map(item => (
                  <div
                    key={item.id}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '14px'
                    }}
                  >
                    <div 
                      onClick={() => setSelectedImage(item.image)}
                      style={{ width: '100%', height: '280px', overflow: 'hidden', borderRadius: '20px', cursor: 'pointer', position: 'relative' }}
                      title="Clica per ampliar"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <h4 style={{ fontSize: '20px', fontFamily: 'serif', margin: 0, color: '#ffffff', textTransform: 'uppercase' }}>{item.name}</h4>
                    <p style={{ fontSize: '13px', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '2px', margin: 0, fontWeight: 'bold' }}>{item.location}</p>

                    <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleWineTypeChange(item.id, 'BLANC')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '10px',
                          border: wineTypes[item.id] === 'BLANC' ? '2px solid #d4af37' : '1px solid #444',
                          backgroundColor: wineTypes[item.id] === 'BLANC' ? 'rgba(212,175,55,0.2)' : '#111',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        VI BLANC
                      </button>
                      <button
                        onClick={() => handleWineTypeChange(item.id, 'NEGRE')}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '10px',
                          border: wineTypes[item.id] === 'NEGRE' ? '2px solid #e57373' : '1px solid #444',
                          backgroundColor: wineTypes[item.id] === 'NEGRE' ? 'rgba(229,115,115,0.2)' : '#111',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          cursor: 'pointer',
                          textTransform: 'uppercase'
                        }}
                      >
                        VI NEGRE
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'rgba(0, 0, 0, 0.6)', padding: '8px 16px', borderRadius: '100px', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                      <button
                        onClick={() => handleQuantityChange(item.id, -1)}
                        style={{ ...glassCircleStyle, width: '44px', height: '44px', minWidth: '44px', minHeight: '44px', fontSize: '22px' }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&minus;</span>
                      </button>
                      <span style={{ fontFamily: 'monospace', fontSize: '22px', width: '32px', color: '#ffffff', fontWeight: '800', textAlign: 'center' }}>
                        {quantities[item.id] || 0}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, 1)}
                        style={{ ...glassCircleStyle, width: '44px', height: '44px', minWidth: '44px', minHeight: '44px', fontSize: '22px' }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', paddingTop: '10px' }}>
                <button
                  onClick={() => setCurrentStep(2)}
                  style={{ ...glassButtonStyle, padding: '18px 36px', fontSize: '16px' }}
                >
                  ENRERE
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  disabled={totalBottles === 0 || !salesOpen}
                  style={{ ...glassButtonStyle, padding: '18px 36px', fontSize: '16px', opacity: totalBottles === 0 || !salesOpen ? 0.4 : 1, cursor: totalBottles === 0 || !salesOpen ? 'not-allowed' : 'pointer' }}
                >
                  SEGÜENT: DADES D'ENVIAMENT
                </button>
              </div>
            </section>
          )}

          {/* PAS 4: DADES DE CONTACTE, ENVIAMENT I FACTURACIÓ */}
          {currentStep === 4 && (
            <section style={{ ...glassCardStyle, padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '14px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '3px', color: '#d4af37', fontWeight: 'bold' }}>PAS 4 DE 5</span>
                <h3 style={{ fontSize: '34px', fontFamily: 'serif', margin: '8px 0 8px 0', color: '#ffffff', textTransform: 'uppercase' }}>DADES DE CONTACTE I ENVIAMENT</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {isPersonalizedUnlocked ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '12px',
                    backgroundColor: '#000000',
                    padding: '24px 20px',
                    borderRadius: '24px',
                    border: '2px solid #d4af37',
                    boxShadow: '0 0 20px rgba(212,175,55,0.2)',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}>
                    <div style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>
                      CONTRAETIQUETA PERSONALITZADA GRATUÏTA (MÍNIM 6 AMPOLLES DESBLOQUEJAT)
                    </div>
                    <label style={{ fontSize: '13px', color: '#cccccc', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', width: '100%' }}>
                      Posa el nom i cognoms exactes que vols que s'imprimeixin a la contraetiqueta del vi:
                    </label>
                    <input
                      type="text"
                      name="customName"
                      value={formData.customName}
                      onChange={handleInputChange}
                      placeholder="EX. FAMÍLIA BELTRÁN - ANIVERSARI 2026"
                      style={{
                        width: '100%',
                        maxWidth: '100%',
                        backgroundColor: '#141414',
                        border: '1px solid #d4af37',
                        borderRadius: '16px',
                        padding: '16px 18px',
                        color: '#ffffff',
                        fontSize: '18px',
                        outline: 'none',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ backgroundColor: '#111111', padding: '16px', borderRadius: '18px', border: '1px dashed #444444', textAlign: 'center', color: '#aaaaaa', fontSize: '14px', textTransform: 'uppercase' }}>
                    Si afegeixes {6 - totalBottles} ampolla(es) més al teu carret, podràs personalitzar la contraetiqueta amb el teu nom de franc.
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="NOM I COGNOMS *"
                    style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '18px', padding: '18px', color: '#ffffff', fontSize: '17px', outline: 'none', textTransform: 'uppercase', boxSizing: 'border-box' }}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="CORREU ELECTRÒNIC *"
                    style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '18px', padding: '18px', color: '#ffffff', fontSize: '17px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="ADREÇA D'ENVIAMENT *"
                  style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '18px', padding: '18px', color: '#ffffff', fontSize: '17px', outline: 'none', textTransform: 'uppercase', boxSizing: 'border-box' }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="POBLACIÓ *"
                    style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '18px', padding: '18px', color: '#ffffff', fontSize: '17px', outline: 'none', textTransform: 'uppercase', boxSizing: 'border-box' }}
                  />
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="CODI POSTAL *"
                    style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '18px', padding: '18px', color: '#ffffff', fontSize: '17px', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="TELÈFON *"
                    style={{ backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '18px', padding: '18px', color: '#ffffff', fontSize: '17px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {/* --- SECCIÓ DE DADES DE FACTURACIÓ --- */}
                <div style={{ marginTop: '10px', borderTop: '1px solid #333', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', color: '#d4af37', textTransform: 'uppercase' }}>
                    <input
                      type="checkbox"
                      name="needsInvoice"
                      checked={formData.needsInvoice}
                      onChange={handleInputChange}
                      style={{ width: '20px', height: '20px', accentColor: '#d4af37', cursor: 'pointer' }}
                    />
                    Necessito factura amb dades fiscals (Empresa / Autònom)
                  </label>

                  {formData.needsInvoice && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', backgroundColor: '#0a0a0a', padding: '20px', borderRadius: '18px', border: '1px solid #333' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <input
                          type="text"
                          name="invoiceName"
                          value={formData.invoiceName}
                          onChange={handleInputChange}
                          placeholder="RAÓ SOCIAL / NOM FISCAL *"
                          style={{ backgroundColor: '#141414', border: '1px solid #444', borderRadius: '14px', padding: '16px', color: '#ffffff', fontSize: '16px', outline: 'none', textTransform: 'uppercase', boxSizing: 'border-box' }}
                        />
                        <input
                          type="text"
                          name="taxId"
                          value={formData.taxId}
                          onChange={handleInputChange}
                          placeholder="NIF / CIF *"
                          style={{ backgroundColor: '#141414', border: '1px solid #444', borderRadius: '14px', padding: '16px', color: '#ffffff', fontSize: '16px', outline: 'none', textTransform: 'uppercase', boxSizing: 'border-box' }}
                        />
                      </div>
                      <input
                        type="text"
                        name="invoiceAddress"
                        value={formData.invoiceAddress}
                        onChange={handleInputChange}
                        placeholder="ADREÇA FISCAL (EMPRESA) *"
                        style={{ backgroundColor: '#141414', border: '1px solid #444', borderRadius: '14px', padding: '16px', color: '#ffffff', fontSize: '16px', outline: 'none', textTransform: 'uppercase', boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <input
                          type="text"
                          name="invoiceCity"
                          value={formData.invoiceCity}
                          onChange={handleInputChange}
                          placeholder="POBLACIÓ FISCAL *"
                          style={{ backgroundColor: '#141414', border: '1px solid #444', borderRadius: '14px', padding: '16px', color: '#ffffff', fontSize: '16px', outline: 'none', textTransform: 'uppercase', boxSizing: 'border-box' }}
                        />
                        <input
                          type="text"
                          name="invoicePostalCode"
                          value={formData.invoicePostalCode}
                          onChange={handleInputChange}
                          placeholder="CODI POSTAL FISCAL *"
                          style={{ backgroundColor: '#141414', border: '1px solid #444', borderRadius: '14px', padding: '16px', color: '#ffffff', fontSize: '16px', outline: 'none', textTransform: 'uppercase', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                {/* ----------------------------------- */}

              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', paddingTop: '10px' }}>
                <button
                  onClick={() => setCurrentStep(3)}
                  style={{ ...glassButtonStyle, padding: '18px 36px', fontSize: '16px' }}
                >
                  ENRERE
                </button>
                <button
                  onClick={() => setCurrentStep(5)}
                  disabled={!formData.fullName || !formData.email || !formData.address || !formData.phone || !formData.city || !formData.postalCode}
                  style={{
                    ...glassButtonStyle,
                    padding: '18px 36px',
                    fontSize: '16px',
                    opacity: (!formData.fullName || !formData.email || !formData.address || !formData.phone || !formData.city || !formData.postalCode) ? 0.4 : 1,
                    cursor: (!formData.fullName || !formData.email || !formData.address || !formData.phone || !formData.city || !formData.postalCode) ? 'not-allowed' : 'pointer'
                  }}
                >
                  SEGÜENT: RESUM DE LA COMANDA
                </button>
              </div>
            </section>
          )}

          {/* PAS 5 */}
          {currentStep === 5 && (
            <section style={{ ...glassCardStyle, padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '14px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '3px', color: '#d4af37', fontWeight: 'bold' }}>PAS 5 DE 5</span>
                <h3 style={{ fontSize: '34px', fontFamily: 'serif', margin: '8px 0 8px 0', color: '#ffffff', textTransform: 'uppercase' }}>RESUM DE LA COMANDA</h3>
              </div>

              <div style={{ backgroundColor: '#0a0a0a', borderRadius: '24px', padding: '28px', border: '1px solid #222', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '18px', textTransform: 'uppercase' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>AMPOLLES SELECCIONADES ({totalBottles} UNITATS):</span>
                  <span style={{ fontWeight: 'bold', color: '#ffffff' }}>{subtotal.toFixed(2)} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>DESPESES D'ENVIAMENT (ESPANYA):</span>
                  <span style={{ fontWeight: 'bold', color: '#ffffff' }}>{shippingCost.toFixed(2)} €</span>
                </div>

                {isPersonalizedUnlocked && (formData.customName || formData.fullName) && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#d4af37', fontSize: '14px', borderTop: '1px solid #222', paddingTop: '10px' }}>
                    <span>CONTRAETIQUETA PERSONALITZADA PER A:</span>
                    <span style={{ fontWeight: 'bold' }}>{formData.customName || formData.fullName}</span>
                  </div>
                )}

                {formData.needsInvoice && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#d4af37', fontSize: '14px', borderTop: '1px solid #222', paddingTop: '10px' }}>
                    <span>FACTURA A: <strong>{formData.invoiceName}</strong> (NIF/CIF: {formData.taxId})</span>
                    <span style={{ fontSize: '13px', color: '#aaa' }}>{formData.invoiceAddress}, {formData.invoicePostalCode} {formData.invoiceCity}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '26px', fontWeight: 'bold', borderTop: '1px solid #333', paddingTop: '20px', marginTop: '8px' }}>
                  <span>TOTAL A PAGAR:</span>
                  <span style={{ color: '#d4af37' }}>{grandTotal.toFixed(2)} €</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#0a0a0a', border: '1px solid #262626', borderRadius: '18px', padding: '20px' }}>
                <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', fontSize: '14px', color: '#d6d6d6', lineHeight: 1.6 }}>
                  <input
                    type="checkbox"
                    checked={acceptsTerms}
                    onChange={(event) => setAcceptsTerms(event.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: '#d4af37', marginTop: '2px', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span>
                    Accepto les{' '}
                    <a href="/condiciones" target="_blank" rel="noreferrer" style={{ color: '#d4af37' }}>condicions de compra</a>, la{' '}
                    <a href="/privacidad" target="_blank" rel="noreferrer" style={{ color: '#d4af37' }}>política de privacitat</a> i el{' '}
                    <a href="/desistimiento" target="_blank" rel="noreferrer" style={{ color: '#d4af37' }}>dret de desistiment</a>. Confirmo que sóc major de 18 anys.
                  </span>
                </label>
                <label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', fontSize: '14px', color: '#a9a9a9', lineHeight: 1.6 }}>
                  <input
                    type="checkbox"
                    checked={marketingConsent}
                    onChange={(event) => setMarketingConsent(event.target.checked)}
                    style={{ width: '20px', height: '20px', accentColor: '#d4af37', marginTop: '2px', cursor: 'pointer', flexShrink: 0 }}
                  />
                  <span>Vull rebre novetats d&apos;El Cercle i properes edicions (opcional).</span>
                </label>
              </div>

              {totalBottles > availableNow ? (
                <p style={{ margin: 0, color: '#f87171', fontSize: '13px', textAlign: 'center' }}>
                  Només queden {availableNow} ampolles. Redueix la quantitat abans de pagar.
                </p>
              ) : null}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <button
                  onClick={() => { setManualError(null); setBizumModal(true); }}
                  disabled={!acceptsTerms || !salesOpen}
                  style={{ ...glassButtonStyle, padding: '20px', fontSize: '18px', backgroundColor: 'rgba(0, 168, 150, 0.25)', border: '2px solid #00a896', opacity: !acceptsTerms || !salesOpen ? 0.45 : 1, cursor: !acceptsTerms || !salesOpen ? 'not-allowed' : 'pointer' }}
                >
                  PAGAR AMB BIZUM (MÒBIL: 640 543 624)
                </button>
                <button
                  onClick={handleStripeCheckout}
                  disabled={loadingPayment || !acceptsTerms || !salesOpen}
                  style={{ ...glassButtonStyle, padding: '20px', fontSize: '18px', opacity: loadingPayment || !acceptsTerms || !salesOpen ? 0.45 : 1, cursor: loadingPayment || !acceptsTerms || !salesOpen ? 'not-allowed' : 'pointer' }}
                >
                  {loadingPayment ? 'OBRINT PASARELA...' : 'PAGAR AMB APPLE PAY / GOOGLE PAY'}
                </button>
                <button
                  onClick={handleStripeCheckout}
                  disabled={loadingPayment || !acceptsTerms || !salesOpen}
                  style={{ ...glassButtonStyle, padding: '20px', fontSize: '18px', opacity: loadingPayment || !acceptsTerms || !salesOpen ? 0.45 : 1, cursor: loadingPayment || !acceptsTerms || !salesOpen ? 'not-allowed' : 'pointer' }}
                >
                  {loadingPayment ? 'OBRINT STRIPE...' : 'PAGAR AMB TARGETA DE CRÈDIT (STRIPE)'}
                </button>
                <a
                  href="/whatsapp"
                  style={{ ...glassButtonStyle, padding: '18px', fontSize: '15px', textAlign: 'center', textDecoration: 'none', display: 'block' }}
                >
                  PREFEREIXES DEMANAR PER WHATSAPP?
                </a>
                {!acceptsTerms ? (
                  <p style={{ margin: 0, color: '#8a8a8a', fontSize: '12px', textAlign: 'center' }}>
                    Marca la casella de condicions per activar el pagament.
                  </p>
                ) : null}
              </div>

              <button
                onClick={() => setCurrentStep(4)}
                style={{ ...glassButtonStyle, padding: '16px 32px', fontSize: '15px', alignSelf: 'center' }}
              >
                ENRERE
              </button>
            </section>
          )}

        </main>

        <SiteFooter />
      </div>

      {/* MODAL DE BIZUM */}
      {bizumModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{ ...glassCardStyle, padding: '40px 30px', maxWidth: '480px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span style={{ fontSize: '48px' }}>📲</span>
            <h4 style={{ fontSize: '28px', fontFamily: 'serif', margin: 0, color: manualOrder ? '#4ade80' : '#00a896', textTransform: 'uppercase' }}>
              {manualOrder ? 'COMANDA RESERVADA' : 'PAGAMENT AMB BIZUM'}
            </h4>

            {manualOrder ? (
              <>
                <p style={{ fontSize: '15px', color: '#dddddd', lineHeight: 1.6, margin: 0 }}>
                  Hem reservat les teves ampolles. Ara fes el Bizum de{' '}
                  <strong style={{ color: '#ffffff' }}>{(manualOrder.total / 100).toFixed(2).replace('.', ',')} €</strong>{' '}
                  al número:
                </p>
                <div style={{ backgroundColor: '#000', border: '2px solid #00a896', padding: '14px', borderRadius: '16px', fontSize: '24px', fontWeight: 'bold', color: '#00a896', letterSpacing: '2px' }}>
                  640 543 624
                </div>
                <div style={{ backgroundColor: '#111111', border: '1px solid #333333', borderRadius: '14px', padding: '14px', textAlign: 'left', fontSize: '13px', color: '#cccccc', lineHeight: 1.7 }}>
                  <div><strong style={{ color: '#d4af37' }}>Concepte:</strong> {manualOrder.id}</div>
                  <div><strong style={{ color: '#d4af37' }}>Import:</strong> {(manualOrder.total / 100).toFixed(2).replace('.', ',')} €</div>
                  <div><strong style={{ color: '#d4af37' }}>Referència:</strong> {manualOrder.id}</div>
                </div>
                <p style={{ fontSize: '13px', color: '#facc15', lineHeight: 1.6, margin: 0 }}>
                  Quan verifiquem l&apos;arribada del Bizum, assignarem els números de sèrie i t&apos;enviarem el certificat per correu. Si no el rebem en 48 h, la reserva caducarà.
                </p>
                <button
                  onClick={() => { setBizumModal(false); setManualOrder(null); setCurrentStep(1); setQuantities({ barcelona: 0, girona: 0, lleida: 0, segadors: 0, tarragona: 0, bruc: 0 }); }}
                  style={{ ...glassButtonStyle, padding: '16px', fontSize: '15px', marginTop: '4px' }}
                >
                  ENTESOS, TORNAR A L'INICI
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: '16px', color: '#ffffff', lineHeight: '1.6', margin: 0 }}>
                  Per finalitzar la comanda de <strong>{grandTotal.toFixed(2)} €</strong>, realitza un Bizum al següent número de mòbil:
                </p>
                <div style={{ backgroundColor: '#000', border: '2px solid #00a896', padding: '16px', borderRadius: '16px', fontSize: '24px', fontWeight: 'bold', color: '#00a896', letterSpacing: '2px' }}>
                  640 543 624
                </div>
                <div style={{ backgroundColor: '#111111', border: '1px solid #333333', borderRadius: '14px', padding: '14px', textAlign: 'left', fontSize: '13px', color: '#cccccc', lineHeight: 1.7 }}>
                  <div><strong style={{ color: '#d4af37' }}>Import:</strong> {grandTotal.toFixed(2).replace('.', ',')} €</div>
                  <div><strong style={{ color: '#d4af37' }}>Concepte:</strong> {formData.fullName || 'EL TEU NOM I COGNOMS'}</div>
                </div>
                <p style={{ fontSize: '13px', color: '#facc15', fontWeight: 'bold', margin: 0, lineHeight: 1.6 }}>
                  Molt important: posa el teu NOM I COGNOMS COMPLETS al concepte del Bizum. La comanda no s&apos;enviarà fins que verifiquem manualment el pagament.
                </p>
                {manualError ? (
                  <p style={{ fontSize: '13px', color: '#f87171', margin: 0 }}>{manualError}</p>
                ) : null}
                <button
                  onClick={handleManualOrder}
                  disabled={manualLoading}
                  style={{ ...glassButtonStyle, padding: '16px', fontSize: '15px', marginTop: '4px', opacity: manualLoading ? 0.6 : 1 }}
                >
                  {manualLoading ? 'RESERVANT COMANDA...' : 'HE FET EL BIZUM - RESERVAR COMANDA'}
                </button>
                <button
                  onClick={() => setBizumModal(false)}
                  style={{ background: 'transparent', border: '1px solid #444444', color: '#aaaaaa', padding: '12px', borderRadius: '100px', cursor: 'pointer', fontSize: '13px', textTransform: 'uppercase' }}
                >
                  Enrere
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE ZOOM DE ETIQUETA */}
      {selectedImage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '-50px',
                right: '0',
                background: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.8)',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Etiqueta Ampliada"
              style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '16px', border: '2px solid #444' }}
            />
          </div>
        </div>
      )}

      {/* MODAL FINAL */}
      {orderComplete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
          <div style={{ ...glassCardStyle, padding: '48px 36px', maxWidth: '500px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px', textTransform: 'uppercase' }}>
            <span style={{ fontSize: '64px' }}>🍷</span>
            <h4 style={{ fontSize: '32px', fontFamily: 'serif', margin: 0, color: '#ffffff' }}>MOLTES GRÀCIES!</h4>
            <p style={{ fontSize: '18px', color: '#cccccc', lineHeight: '1.6', margin: 0 }}>
              La teva comanda d'<strong>ALLIBERA'M</strong> ha estat confirmada amb èxit. S'han assignat les teves botelles de l'edició limitada i rebràs el comprovant i certificat al teu correu electrònic.
            </p>
            <button
              onClick={() => { setOrderComplete(false); setCurrentStep(1); }}
              style={{ ...glassButtonStyle, padding: '20px 40px', fontSize: '16px' }}
            >
              TANCAR I TORNAR A L'INICI
            </button>
          </div>
        </div>
      )}

      {/* BANNER DE COOKIES */}
      {!cookiesChoice && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#0a0a0a',
          borderTop: '1px solid #333333',
          padding: '24px 30px',
          zIndex: 9000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.9)'
        }}>
          <p style={{ fontSize: '15px', color: '#dddddd', margin: 0, maxWidth: '900px', lineHeight: '1.6', textAlign: 'center' }}>
            Aquest lloc web utilitza cookies pròpies i de tercers per recopilar informació amb la finalitat de millorar els nostres serveis. Podeu acceptar totes les cookies prement el botó «ACCEPTA» o configurar-les fent clic a «CONFIGURACIÓ», o rebutjar el seu ús fent clic a «REBUTJA».
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleCookies('all')}
              style={{
                backgroundColor: '#1565c0',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '24px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              ACCEPTA
            </button>
            <button
              onClick={() => handleCookies('necessary')}
              style={{
                backgroundColor: '#1565c0',
                color: '#ffffff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '24px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              REBUTJA
            </button>
            <button
              onClick={() => handleCookies('necessary')}
              style={{
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1px solid #666666',
                padding: '12px 28px',
                borderRadius: '24px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              CONFIGURACIÓ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}