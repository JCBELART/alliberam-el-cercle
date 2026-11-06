import 'server-only';

import { randomBytes } from 'crypto';
import { readJson, updateJson, writeJson, listJson, AlreadyExistsError } from './storage';
import type {
  Lead,
  Order,
  OrderItem,
  OrderSummary,
  TokenRecord,
} from './types';

const ORDER_PREFIX = 'orders/';
const INDEX_PATH = 'state/orders-index.json';
const SESSION_PREFIX = 'sessions/';
const TOKEN_PREFIX = 'tokens/';
const LEAD_PREFIX = 'leads/';
const WEBHOOK_PREFIX = 'webhook-events/';

const ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function newOrderId(): string {
  const bytes = randomBytes(6);
  let suffix = '';
  for (let index = 0; index < bytes.length; index += 1) {
    suffix += ID_ALPHABET[bytes[index] % ID_ALPHABET.length];
  }
  return `ALB-2026-${suffix}`;
}

function orderPath(id: string): string {
  return `${ORDER_PREFIX}${id}.json`;
}

export function summarizeOrder(order: Order): OrderSummary {
  const serials = order.items.map((item) => item.serial);
  return {
    id: order.id,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    status: order.status,
    paymentMethod: order.paymentMethod,
    customerName: order.customer.name,
    customerEmail: order.customer.email,
    total: order.total,
    bottleCount: order.items.length,
    batch: order.items[0]?.batch ?? null,
    serialFrom: serials.length ? Math.min(...serials) : null,
    serialTo: serials.length ? Math.max(...serials) : null,
    emailSentAt: order.emailSentAt,
  };
}

async function updateIndex(order: Order): Promise<void> {
  const summary = summarizeOrder(order);
  await updateJson<OrderSummary[]>(INDEX_PATH, [], (current) => {
    const next = current.filter((entry) => entry.id !== summary.id);
    next.push(summary);
    next.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return next;
  });
}

export async function createOrder(
  input: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Order> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const now = new Date().toISOString();
    const order: Order = {
      ...input,
      id: newOrderId(),
      createdAt: now,
      updatedAt: now,
    };
    try {
      await writeJson(orderPath(order.id), order, { createOnly: true });
      await updateIndex(order);
      return order;
    } catch (error) {
      if (error instanceof AlreadyExistsError) continue;
      throw error;
    }
  }
  throw new Error('No se ha podido generar un identificador de pedido único.');
}

export async function getOrder(id: string): Promise<Order | null> {
  if (!/^ALB-2026-[A-Z0-9]{4,10}$/.test(id)) return null;
  const stored = await readJson<Order>(orderPath(id));
  return stored?.data ?? null;
}

export async function updateOrder(
  id: string,
  mutator: (order: Order) => Order,
  attempts = 12
): Promise<Order> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const stored = await readJson<Order>(orderPath(id));
    if (!stored) throw new Error(`Pedido ${id} no encontrado.`);
    const next = mutator(structuredClone(stored.data));
    next.updatedAt = new Date().toISOString();
    try {
      await writeJson(orderPath(id), next, { etag: stored.etag });
      await updateIndex(next);
      return next;
    } catch (error) {
      if ((error as { name?: string })?.name === 'PreconditionFailedError') continue;
      throw error;
    }
  }
  throw new Error('No se ha podido actualizar el pedido por concurrencia.');
}

export async function listOrders(): Promise<OrderSummary[]> {
  const stored = await readJson<OrderSummary[]>(INDEX_PATH);
  return stored?.data ?? [];
}

export async function rebuildOrderIndex(): Promise<OrderSummary[]> {
  const documents = await listJson<Order>(ORDER_PREFIX);
  const summaries = documents.map((document) => summarizeOrder(document.data));
  summaries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  await writeJson(INDEX_PATH, summaries, { etag: (await readJson<OrderSummary[]>(INDEX_PATH))?.etag });
  return summaries;
}

export async function getOrderByStripeSession(sessionId: string): Promise<Order | null> {
  if (!sessionId) return null;
  const stored = await readJson<{ orderId: string }>(`${SESSION_PREFIX}${sessionId}.json`);
  if (!stored) return null;
  return getOrder(stored.data.orderId);
}

export async function linkStripeSession(sessionId: string, orderId: string): Promise<void> {
  await writeJson(
    `${SESSION_PREFIX}${sessionId}.json`,
    { orderId, createdAt: new Date().toISOString() },
    { createOnly: true }
  );
}

export async function createTokenRecords(order: Order): Promise<void> {
  await Promise.all(
    order.items.map(async (item) => {
      const record: TokenRecord = {
        token: item.token,
        orderId: order.id,
        labelId: item.labelId,
        labelName: item.labelName,
        wineType: item.wineType,
        serial: item.serial,
        batch: item.batch,
        ownerName: order.personalizedName || order.customer.name,
        createdAt: new Date().toISOString(),
      };
      await writeJson(`${TOKEN_PREFIX}${item.token}.json`, record, { createOnly: true }).catch(
        (error) => {
          if ((error as { name?: string })?.name !== 'AlreadyExistsError') throw error;
        }
      );
    })
  );
}

export async function getTokenRecord(token: string): Promise<TokenRecord | null> {
  if (!token || !/^[A-Za-z0-9_-]{16,64}$/.test(token)) return null;
  const stored = await readJson<TokenRecord>(`${TOKEN_PREFIX}${token}.json`);
  return stored?.data ?? null;
}

export function itemForDisplay(item: OrderItem) {
  return {
    labelId: item.labelId,
    labelName: item.labelName,
    wineType: item.wineType,
    serial: item.serial,
    batch: item.batch,
    token: item.token,
  };
}

export function publicOrder(order: Order) {
  return {
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    customerName: order.customer.name,
    personalizedName: order.personalizedName,
    total: order.total,
    emailSentAt: order.emailSentAt,
    items: order.items.map(itemForDisplay),
  };
}

export async function hasWebhookEvent(eventId: string): Promise<boolean> {
  const stored = await readJson<{ receivedAt: string }>(`${WEBHOOK_PREFIX}${eventId}.json`);
  return Boolean(stored);
}

export async function markWebhookEvent(eventId: string, type: string): Promise<void> {
  await writeJson(
    `${WEBHOOK_PREFIX}${eventId}.json`,
    { receivedAt: new Date().toISOString(), type },
    { createOnly: true }
  );
}

export async function createLead(input: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> {
  const lead: Lead = {
    ...input,
    id: `LEAD-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString('hex').toUpperCase()}`,
    createdAt: new Date().toISOString(),
  };
  await writeJson(`${LEAD_PREFIX}${lead.id}.json`, lead, { createOnly: true });
  return lead;
}

export async function listLeads(): Promise<Lead[]> {
  const documents = await listJson<Lead>(LEAD_PREFIX);
  return documents
    .map((document) => document.data)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
