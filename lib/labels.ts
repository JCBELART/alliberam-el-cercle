import type { WineType } from './types';

export interface LabelOption {
  id: string;
  name: string;
  location: string;
  image: string;
  defaultWineType: WineType;
}

export const LABELS: LabelOption[] = [
  { id: 'barcelona', name: 'Montserrat', location: 'Barcelona', image: '/BARCELONA.jpg', defaultWineType: 'BLANC' },
  { id: 'girona', name: 'Costa Brava', location: 'Girona', image: '/GIRONA.jpg', defaultWineType: 'BLANC' },
  { id: 'lleida', name: 'Seu Vella', location: 'Lleida', image: '/LLEIDA.jpg', defaultWineType: 'BLANC' },
  { id: 'segadors', name: 'Els Segadors', location: 'Camp Català', image: '/SEGADORS.jpg', defaultWineType: 'BLANC' },
  { id: 'tarragona', name: 'Catedral de Tarragona', location: 'Tarragona', image: '/TARRAGONA.jpg', defaultWineType: 'BLANC' },
  { id: 'bruc', name: 'El Timbaler del Bruc', location: 'El Bruc', image: '/TAMBOLIRE_BRUC.jpg', defaultWineType: 'BLANC' },
];

export function getLabel(id: string): LabelOption | undefined {
  return LABELS.find((label) => label.id === id);
}

export function labelName(id: string): string {
  return getLabel(id)?.name ?? id;
}
