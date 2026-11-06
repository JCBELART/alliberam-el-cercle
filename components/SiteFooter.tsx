import React from 'react';
import Link from 'next/link';

const legalLinks = [
  { href: '/aviso-legal', label: 'Avís legal' },
  { href: '/privacidad', label: 'Privacitat' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/condiciones', label: 'Condicions' },
  { href: '/desistimiento', label: 'Desistiment' },
];

export default function SiteFooter() {
  return (
    <footer
      style={{
        width: '100%',
        marginTop: '36px',
        paddingTop: '26px',
        borderTop: '1px solid #242424',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '14px',
        color: '#6f6f6f',
        fontSize: '12px',
        lineHeight: 1.7,
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {legalLinks.map((link) => (
          <Link key={link.href} href={link.href} style={{ color: '#8a8a8a', textDecoration: 'none' }}>
            {link.label}
          </Link>
        ))}
      </div>
      <div>
        <p style={{ margin: 0 }}>
          DELIFUSION FOOD &amp; DRINK S.L. · NIF B16449233 · Calle Moriles 8 Casa 25, 29740 Vélez-Málaga (Málaga)
        </p>
        <p style={{ margin: '4px 0 0 0' }}>
          640 543 624 · hola@alliberamelcercle.digital
        </p>
        <p style={{ margin: '8px 0 0 0', color: '#4f4f4f' }}>
          Consum responsable. Venda exclusiva a persones majors de 18 anys. © 2026 Allibera&apos;m · El Cercle.
        </p>
      </div>
    </footer>
  );
}
