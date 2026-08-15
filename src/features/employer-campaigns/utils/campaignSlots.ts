import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import type {
  CampaignSlotRequest,
  CampaignSlotResponse,
} from '../types/campaign.api.types';

type SlotFormValues = {
  startsAt: string;
  endsAt: string;
  capacity: string;
};

export type SlotValidationCode =
  | 'startsRequired'
  | 'endsRequired'
  | 'endsAfterStart'
  | 'capacityPositiveInteger'
  | 'capacityBelowAssigned';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key] ?? record[key[0].toUpperCase() + key.slice(1)];
  return typeof value === 'string' ? value : '';
}

function readCount(record: Record<string, unknown>, key: string): number {
  const value = record[key] ?? record[key[0].toUpperCase() + key.slice(1)];
  const number = typeof value === 'string' ? Number(value) : value;
  return typeof number === 'number' && Number.isFinite(number) ? number : 0;
}

export function parseCampaignSlot(value: unknown): CampaignSlotResponse | null {
  const record = asRecord(value);
  if (!record) return null;
  const id = readString(record, 'id');
  const startsAt = readString(record, 'startsAt');
  const endsAt = readString(record, 'endsAt');
  if (!id || !startsAt || !endsAt) return null;
  return {
    id,
    startsAt,
    endsAt,
    capacity: readCount(record, 'capacity'),
    assignedCount: readCount(record, 'assignedCount'),
    startedCount: readCount(record, 'startedCount'),
  };
}

export function parseCampaignSlots(value: unknown): CampaignSlotResponse[] {
  const root = asRecord(value);
  const raw = Array.isArray(value)
    ? value
    : Array.isArray(root?.data)
      ? root.data
      : Array.isArray(root?.items)
        ? root.items
        : [];
  return raw.map(parseCampaignSlot).filter((slot): slot is CampaignSlotResponse => Boolean(slot));
}

export function validateCampaignSlot(
  values: SlotFormValues,
  assignedCount = 0,
): SlotValidationCode | null {
  if (!values.startsAt || Number.isNaN(new Date(values.startsAt).getTime())) return 'startsRequired';
  if (!values.endsAt || Number.isNaN(new Date(values.endsAt).getTime())) return 'endsRequired';
  if (new Date(values.endsAt).getTime() <= new Date(values.startsAt).getTime()) {
    return 'endsAfterStart';
  }
  const capacity = Number(values.capacity);
  if (!Number.isInteger(capacity) || capacity <= 0) return 'capacityPositiveInteger';
  if (capacity < assignedCount) return 'capacityBelowAssigned';
  return null;
}

export function toCampaignSlotRequest(values: SlotFormValues): CampaignSlotRequest {
  return {
    startsAt: new Date(values.startsAt).toISOString(),
    endsAt: new Date(values.endsAt).toISOString(),
    capacity: Number(values.capacity),
  };
}

export function toSlotDatetimeLocal(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function campaignSlotCapacity(slots: CampaignSlotResponse[]) {
  return slots.reduce(
    (summary, slot) => ({
      total: summary.total + slot.capacity,
      available: summary.available + Math.max(0, slot.capacity - slot.assignedCount),
    }),
    { total: 0, available: 0 },
  );
}

export function getCampaignSlotErrorKey(
  error: unknown,
  action: 'load' | 'create' | 'update' | 'delete',
): string {
  const localStatus =
    error && typeof error === 'object' && 'status' in error && typeof error.status === 'number'
      ? error.status
      : undefined;
  const status = getApiStatusCode(error) ?? localStatus;
  const message = (getApiErrorMessage(error, '') || (error instanceof Error ? error.message : '')).toLowerCase();
  if (status === 404) return 'employer.campaigns.slots.errors.notFound';
  if (status === 409 && action === 'delete') return 'employer.campaigns.slots.errors.deleteRunning';
  if (status === 409) return 'employer.campaigns.slots.errors.overlap';
  if (status === 400 && (message.includes('assign') || message.includes('capacity'))) {
    return 'employer.campaigns.slots.validation.capacityBelowAssigned';
  }
  if (status === 400) return 'employer.campaigns.slots.errors.invalid';
  return `employer.campaigns.slots.errors.${action}`;
}
