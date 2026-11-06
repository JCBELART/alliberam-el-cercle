export type WineType = 'BLANC' | 'NEGRE';

export type OrderStatus =
  | 'pending_payment'
  | 'pending_bizum'
  | 'paid'
  | 'confirmed'
  | 'shipped'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'stripe' | 'bizum' | 'whatsapp';

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface InvoiceData {
  name: string;
  taxId: string;
  address: string;
  city: string;
  postalCode: string;
}

export interface OrderItem {
  labelId: string;
  labelName: string;
  wineType: WineType;
  serial: number;
  batch: number;
  token: string;
}

export interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customer: CustomerData;
  invoice: InvoiceData | null;
  quantities: Record<string, number>;
  wineTypes: Record<string, WineType>;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: 'EUR';
  personalizedName: string | null;
  acceptsTerms: boolean;
  marketingConsent: boolean;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paidAt?: string;
  confirmedAt?: string;
  shippedAt?: string;
  cancelledAt?: string;
  refundedAt?: string;
  emailSentAt?: string;
  emailError?: string;
  adminNotes?: string;
}

export interface OrderSummary {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerEmail: string;
  total: number;
  bottleCount: number;
  batch: number | null;
  serialFrom: number | null;
  serialTo: number | null;
  emailSentAt?: string;
}

export interface CampaignState {
  campaignId: string;
  batch: number;
  batchSize: number;
  soldInBatch: number;
  totalSold: number;
  salesOpen: boolean;
  updatedAt: string;
}

export interface TokenRecord {
  token: string;
  orderId: string;
  labelId: string;
  labelName: string;
  wineType: WineType;
  serial: number;
  batch: number;
  ownerName: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  consent: boolean;
}

export interface StockInfo {
  available: number;
  total: number;
  batch: number;
  sold: number;
  totalSold: number;
  salesOpen: boolean;
}
