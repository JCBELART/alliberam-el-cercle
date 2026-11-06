import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'La teva experiència · El Cercle',
  description: 'Descobreix la teva ampolla numerada i viu-la en realitat augmentada.',
  robots: { index: false, follow: false },
};

export default function ExperienciaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
