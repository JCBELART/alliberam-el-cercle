export const BOTTLE_PRICE_CENTS = 750;
export const SHIPPING_CENTS = 550;
export const BATCH_SIZE = 500;
export const MAX_BOTTLES_PER_ORDER = 120;
export const CURRENCY = 'EUR';

export function formatEuros(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + ' €';
}

export function calculateTotals(bottleCount: number): {
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
} {
  const subtotalCents = bottleCount * BOTTLE_PRICE_CENTS;
  const shippingCents = bottleCount > 0 ? SHIPPING_CENTS : 0;
  return {
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };
}
