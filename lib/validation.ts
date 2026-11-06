import { LABELS, getLabel } from './labels';
import { MAX_BOTTLES_PER_ORDER } from './pricing';
import type { CustomerData, InvoiceData, WineType } from './types';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

function text(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function email(value: unknown): string {
  const normalized = text(value, 180).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)) {
    throw new ValidationError('El correu electrònic no és vàlid.');
  }
  return normalized;
}

function phone(value: unknown): string {
  const normalized = text(value, 30).replace(/[^\d+().\s-]/g, '');
  if (normalized.replace(/\D/g, '').length < 6) {
    throw new ValidationError('El telèfon no és vàlid.');
  }
  return normalized;
}

function postalCode(value: unknown): string {
  const normalized = text(value, 12).toUpperCase();
  if (!/^[A-Z0-9 -]{4,12}$/.test(normalized)) {
    throw new ValidationError('El codi postal no és vàlid.');
  }
  return normalized;
}

function required(value: unknown, field: string, maxLength = 120): string {
  const normalized = text(value, maxLength);
  if (normalized.length < 2) throw new ValidationError(`Falta ${field}.`);
  return normalized;
}

function parseQuantities(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new ValidationError('No has seleccionat cap ampolla.');
  }

  const quantities: Record<string, number> = {};
  let total = 0;

  for (const label of LABELS) {
    const value = Number((raw as Record<string, unknown>)[label.id] ?? 0);
    if (!Number.isInteger(value) || value < 0) {
      throw new ValidationError('La quantitat d’ampolles no és vàlida.');
    }
    quantities[label.id] = value;
    total += value;
  }

  if (total === 0) throw new ValidationError('Has de seleccionar almenys una ampolla.');
  if (total > MAX_BOTTLES_PER_ORDER) {
    throw new ValidationError(
      `Per a comandes de més de ${MAX_BOTTLES_PER_ORDER} ampolles, contacta directament amb nosaltres.`
    );
  }

  return quantities;
}

function parseWineTypes(raw: unknown): Record<string, WineType> {
  const result: Record<string, WineType> = {};
  for (const label of LABELS) {
    const value = (raw as Record<string, unknown> | undefined)?.[label.id];
    result[label.id] = value === 'NEGRE' ? 'NEGRE' : label.defaultWineType;
  }
  return result;
}

function parseCustomer(raw: unknown): CustomerData {
  const source = (raw ?? {}) as Record<string, unknown>;
  return {
    name: required(source.name, 'el nom i cognoms', 120).toUpperCase(),
    email: email(source.email),
    phone: phone(source.phone),
    address: required(source.address, 'l’adreça', 200),
    city: required(source.city, 'la població', 100).toUpperCase(),
    postalCode: postalCode(source.postalCode),
    country: text(source.country, 2).toUpperCase() || 'ES',
  };
}

function parseInvoice(raw: unknown, customer: CustomerData, needed: boolean): InvoiceData | null {
  if (!needed) return null;
  const source = (raw ?? {}) as Record<string, unknown>;
  const name = required(source.invoiceName ?? source.name, 'la raó social de la factura', 160);
  const taxId = text(source.taxId, 20).toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9-]{5,19}$/.test(taxId)) {
    throw new ValidationError('El NIF/CIF de la factura no és vàlid.');
  }
  return {
    name,
    taxId,
    address: text(source.invoiceAddress, 200) || customer.address,
    city: (text(source.invoiceCity, 100) || customer.city).toUpperCase(),
    postalCode: text(source.invoicePostalCode, 12).toUpperCase() || customer.postalCode,
  };
}

export interface CheckoutInput {
  quantities: Record<string, number>;
  wineTypes: Record<string, WineType>;
  customer: CustomerData;
  invoice: InvoiceData | null;
  needsInvoice: boolean;
  personalizedName: string | null;
  acceptsTerms: boolean;
  marketingConsent: boolean;
  totalBottles: number;
}

export function parseCheckoutBody(body: unknown): CheckoutInput {
  const source = (body ?? {}) as Record<string, unknown>;
  const quantities = parseQuantities(source.quantities ?? source.selectedBottles);
  const wineTypes = parseWineTypes(source.wineTypes ?? source.selectedWineTypes);
  const customer = parseCustomer(source.customer ?? source);
  const needsInvoice = source.needsInvoice === true;
  const invoice = parseInvoice(source.invoice ?? source.invoiceData ?? source, customer, needsInvoice);
  const totalBottles = Object.values(quantities).reduce((sum, value) => sum + value, 0);
  const custom = text(source.personalizedName ?? source.buyerCustomName ?? source.customName, 70);

  if (source.acceptsTerms !== true) {
    throw new ValidationError('Has d’acceptar les condicions de compra i la política de privacitat.');
  }

  return {
    quantities,
    wineTypes,
    customer,
    invoice,
    needsInvoice,
    personalizedName: totalBottles >= 6 && custom ? custom.toUpperCase() : null,
    acceptsTerms: true,
    marketingConsent: source.marketingConsent === true,
    totalBottles,
  };
}

export function buildAllocationInputs(
  quantities: Record<string, number>,
  wineTypes: Record<string, WineType>
) {
  const inputs: Array<{ labelId: string; labelName: string; wineType: WineType }> = [];
  for (const label of LABELS) {
    const count = quantities[label.id] ?? 0;
    for (let index = 0; index < count; index += 1) {
      inputs.push({
        labelId: label.id,
        labelName: getLabel(label.id)?.name ?? label.name,
        wineType: wineTypes[label.id] ?? label.defaultWineType,
      });
    }
  }
  return inputs;
}

export function parseLeadBody(body: unknown) {
  const source = (body ?? {}) as Record<string, unknown>;
  return {
    name: required(source.name, 'el nom', 120).toUpperCase(),
    email: email(source.email),
    phone: source.phone ? phone(source.phone) : undefined,
    source: text(source.source, 60) || 'web',
    consent: source.consent === true,
  };
}
