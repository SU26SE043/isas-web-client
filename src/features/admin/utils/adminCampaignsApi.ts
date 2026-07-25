import type {
  AdminCampaignListItem,
  AdminCampaignPage,
  AdminCampaignStatus,
} from '../types/adminCampaigns.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function pickString(record: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

export function readNextCursorHeader(headers: unknown): string | null {
  if (!headers || typeof headers !== 'object') return null;
  const record = headers as Record<string, unknown> & {
    get?: (name: string) => unknown;
  };
  let raw: unknown;
  if (typeof record.get === 'function') {
    raw = record.get('x-next-cursor') ?? record.get('X-Next-Cursor');
  } else {
    raw = record['x-next-cursor'] ?? record['X-Next-Cursor'];
  }
  if (Array.isArray(raw)) {
    const first = raw[0];
    return typeof first === 'string' && first.trim() ? first.trim() : null;
  }
  return typeof raw === 'string' && raw.trim() ? raw.trim() : null;
}

export function normalizeAdminCampaignStatus(value: string | null | undefined): AdminCampaignStatus | null {
  if (!value?.trim()) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'draft') return 'Draft';
  if (normalized === 'active' || normalized === 'published' || normalized === 'open') return 'Active';
  if (normalized === 'closed') return 'Closed';
  if (normalized === 'archived') return 'Archived';
  return null;
}

export function parseAdminCampaignListItem(raw: unknown): AdminCampaignListItem | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record, 'id', 'Id');
  const status = normalizeAdminCampaignStatus(pickString(record, 'status', 'Status'));
  if (!id || !status) return null;

  const title =
    pickString(record, 'title', 'Title', 'name', 'Name') ?? '';

  return {
    id,
    title,
    status,
    orgId:
      pickString(record, 'orgId', 'OrgId', 'organizationId', 'OrganizationId') ?? null,
    organizationName:
      pickString(
        record,
        'organizationName',
        'OrganizationName',
        'orgName',
        'OrgName',
        'company',
        'Company',
      ) ?? null,
    domain: pickString(record, 'domain', 'Domain') ?? null,
    maxCandidates:
      pickNumber(record, 'maxCandidates', 'MaxCandidates', 'capacity', 'Capacity') ?? null,
    totalCandidates:
      pickNumber(
        record,
        'totalCandidates',
        'TotalCandidates',
        'applicantCount',
        'ApplicantCount',
        'applicants',
        'Applicants',
      ) ?? null,
    startsAt: pickString(record, 'startsAt', 'StartsAt') ?? null,
    expiresAt:
      pickString(record, 'expiresAt', 'ExpiresAt', 'deadline', 'Deadline', 'endDate', 'EndDate') ??
      null,
    createdAt: pickString(record, 'createdAt', 'CreatedAt') ?? null,
    updatedAt: pickString(record, 'updatedAt', 'UpdatedAt') ?? null,
  };
}

function unwrapListPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const root = asRecord(data);
  if (!root) return [];
  if (Array.isArray(root.data)) return root.data;
  if (Array.isArray(root.items)) return root.items;
  if (Array.isArray(root.campaigns)) return root.campaigns;
  const nested = asRecord(root.data);
  if (nested) {
    if (Array.isArray(nested.items)) return nested.items;
    if (Array.isArray(nested.campaigns)) return nested.campaigns;
  }
  return [];
}

export function parseAdminCampaignPage(data: unknown, headers: unknown): AdminCampaignPage {
  const items = unwrapListPayload(data)
    .map(parseAdminCampaignListItem)
    .filter((item): item is AdminCampaignListItem => item != null);
  return {
    items,
    nextCursor: readNextCursorHeader(headers),
  };
}
