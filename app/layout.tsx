import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "EL CERCLE • ALLIBERA'M",
  description: "Edició Limitada Numerada de 500 Botelles",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ca">
      <body className="bg-[#0a0a0a] text-[#e5e5e5] antialiased">
        {children}
      </body>
    </html>
  );
}