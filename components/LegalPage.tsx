import React from 'react';
import Link from 'next/link';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export default function LegalPage({
  title,
  subtitle,
  updatedAt,
  sections,
}: {
  title: string;
  subtitle?: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#050505',
        color: '#e6e6e6',
        padding: '48px 20px 90px 20px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#d4af37', fontSize: '13px', fontWeight: 700 }}>
            ← Tornar a El Cercle
          </Link>
          <h1 style={{ fontFamily: 'serif', fontSize: '36px', margin: 0, lineHeight: 1.2 }}>{title}</h1>
          {subtitle ? <p style={{ margin: 0, color: '#9a9a9a', fontSize: '15px', lineHeight: 1.6 }}>{subtitle}</p> : null}
          <p style={{ margin: 0, color: '#6f6f6f', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Darrera actualització: {updatedAt}
          </p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
          {sections.map((section) => (
            <section key={section.heading} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', margin: 0, color: '#ffffff' }}>{section.heading}</h2>
              {section.paragraphs.map((paragraph, index) => (
                <p key={index} style={{ margin: 0, color: '#c2c2c2', fontSize: '14.5px', lineHeight: 1.75 }}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <footer style={{ borderTop: '1px solid #222222', paddingTop: '22px', display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '13px' }}>
          <Link href="/aviso-legal" style={{ color: '#8a8a8a', textDecoration: 'none' }}>Avís legal</Link>
          <Link href="/privacidad" style={{ color: '#8a8a8a', textDecoration: 'none' }}>Privacitat</Link>
          <Link href="/cookies" style={{ color: '#8a8a8a', textDecoration: 'none' }}>Cookies</Link>
          <Link href="/condiciones" style={{ color: '#8a8a8a', textDecoration: 'none' }}>Condicions de compra</Link>
          <Link href="/desistimiento" style={{ color: '#8a8a8a', textDecoration: 'none' }}>Desistiment</Link>
        </footer>
      </div>
    </main>
  );
}
