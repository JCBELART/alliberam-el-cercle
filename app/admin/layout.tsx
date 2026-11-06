import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Panell · El Cercle',
  robots: { index: false, follow: false },
};

const NAV = [
  { href: '/admin', label: 'Resum' },
  { href: '/admin/comandes', label: 'Comandes' },
  { href: '/admin/campanya', label: 'Campanya' },
  { href: '/admin/contactes', label: 'Contactes' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0b0b0b',
        color: '#eeeeee',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <header
        style={{
          borderBottom: '1px solid #222222',
          background: 'rgba(10,10,10,0.95)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            maxWidth: '1180px',
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/admin"
            style={{
              color: '#d4af37',
              textDecoration: 'none',
              fontWeight: 800,
              letterSpacing: '2px',
              fontSize: '15px',
            }}
          >
            EL CERCLE · ADMIN
          </Link>
          <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  color: '#cfcfcf',
                  textDecoration: 'none',
                  fontSize: '13px',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  border: '1px solid #2a2a2a',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '14px' }}>
            <Link
              href="/"
              target="_blank"
              style={{ color: '#8a8a8a', textDecoration: 'none', fontSize: '12px' }}
            >
              Veure web ↗
            </Link>
          </div>
        </div>
      </header>
      <main style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 24px 80px 24px' }}>
        {children}
      </main>
    </div>
  );
}
