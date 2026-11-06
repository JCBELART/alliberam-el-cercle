import 'server-only';

import { randomBytes } from 'crypto';
import { BATCH_SIZE } from './pricing';
import { readJson, updateJson } from './storage';
import type { CampaignState, OrderItem, StockInfo, WineType } from './types';

const CAMPAIGN_PATH = 'state/campaign.json';

export class SalesClosedError extends Error {
  constructor(message = 'Les vendes estan temporalment tancades.') {
    super(message);
    this.name = 'SalesClosedError';
  }
}

export function defaultCampaign(): CampaignState {
  return {
    campaignId: 'el-cercle-2026',
    batch: 1,
    batchSize: BATCH_SIZE,
    soldInBatch: 0,
    totalSold: 0,
    salesOpen: true,
    updatedAt: new Date().toISOString(),
  };
}

export async function getCampaign(): Promise<CampaignState> {
  const stored = await readJson<CampaignState>(CAMPAIGN_PATH);
  return stored?.data ?? defaultCampaign();
}

export async function getStock(): Promise<StockInfo> {
  const campaign = await getCampaign();
  return {
    available: Math.max(0, campaign.batchSize - campaign.soldInBatch),
    total: campaign.batchSize,
    batch: campaign.batch,
    sold: campaign.soldInBatch,
    totalSold: campaign.totalSold,
    salesOpen: campaign.salesOpen,
  };
}

export function newToken(): string {
  return randomBytes(18).toString('base64url');
}

export interface AllocationInput {
  labelId: string;
  labelName: string;
  wineType: WineType;
}

/**
 * Asigna números de serie correlativos y tokens únicos.
 *
 * Cuando se agota una tirada de 500, la siguiente ampolla empieza una nueva
 * tirada (batch) y vuelve al número 001. Cada botella conserva su batch para
 * que la trazabilidad interna nunca se pierda.
 */
export async function allocateItems(inputs: AllocationInput[]): Promise<OrderItem[]> {
  if (inputs.length === 0) return [];

  const tokens = inputs.map(() => newToken());

  const items: OrderItem[] = [];
  let cursor = 0;

  await updateJson<CampaignState>(
    CAMPAIGN_PATH,
    defaultCampaign(),
    (current) => {
      if (!current.salesOpen) throw new SalesClosedError();

      cursor = 0;
      items.length = 0;

      for (const input of inputs) {
        if (current.soldInBatch >= current.batchSize) {
          current.batch += 1;
          current.soldInBatch = 0;
        }

        const serial = current.soldInBatch + 1;
        current.soldInBatch += 1;
        current.totalSold += 1;

        items.push({
          labelId: input.labelId,
          labelName: input.labelName,
          wineType: input.wineType,
          serial,
          batch: current.batch,
          token: tokens[cursor],
        });

        cursor += 1;

        if (current.soldInBatch >= current.batchSize) {
          current.batch += 1;
          current.soldInBatch = 0;
        }
      }

      current.updatedAt = new Date().toISOString();
      return current;
    }
  );

  if (items.length !== inputs.length) {
    throw new Error('No se han podido asignar todos los números de serie.');
  }

  return items;
}

export async function setSalesOpen(salesOpen: boolean): Promise<CampaignState> {
  return updateJson<CampaignState>(CAMPAIGN_PATH, defaultCampaign(), (current) => {
    current.salesOpen = salesOpen;
    current.updatedAt = new Date().toISOString();
    return current;
  });
}

export async function startNewBatch(): Promise<CampaignState> {
  return updateJson<CampaignState>(CAMPAIGN_PATH, defaultCampaign(), (current) => {
    current.batch += 1;
    current.soldInBatch = 0;
    current.updatedAt = new Date().toISOString();
    return current;
  });
}
