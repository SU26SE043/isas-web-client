import type {
  CampaignInvitation,
  CampaignInvitationStatus,
  CampaignInvitationsPage,
} from '../types/campaign.api.types';

const STATUS_SET = new Set<CampaignInvitationStatus>([
  'Queued',
  'Sent',
  'Joined',
  'Expired',
  'Revoked',
]);

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

function pickString(record: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function pickOptionalString(
  record: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = record[key];
    if (value == null) continue;
    if (typeof value === 'string') return value.trim() || null;
  }
  return null;
}

function normalizeStatus(value: string): CampaignInvitationStatus | null {
  const trimmed = value.trim();
  if (STATUS_SET.has(trimmed as CampaignInvitationStatus)) {
    return trimmed as CampaignInvitationStatus;
  }
  const lower = trimmed.toLowerCase();
  if (lower === 'queued') return 'Queued';
  if (lower === 'sent') return 'Sent';
  if (lower === 'joined') return 'Joined';
  if (lower === 'expired') return 'Expired';
  if (lower === 'revoked') return 'Revoked';
  return null;
}

export function parseCampaignInvitation(raw: unknown): CampaignInvitation | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const id = pickString(record, 'id', 'Id');
  const email = pickString(record, 'email', 'Email').toLowerCase();
  const statusRaw = pickString(record, 'status', 'Status');
  const status = normalizeStatus(statusRaw);
  const createdAt = pickString(record, 'createdAt', 'CreatedAt');
  const expiresAt = pickString(record, 'expiresAt', 'ExpiresAt');
  if (!id || !email || !status || !createdAt || !expiresAt) return null;

  return {
    id,
    email,
    status,
    createdAt,
    expiresAt,
    emailSentAt: pickOptionalString(record, 'emailSentAt', 'EmailSentAt'),
    joinedAt: pickOptionalString(record, 'joinedAt', 'JoinedAt'),
  };
}

export function parseCampaignInvitationsPage(
  data: unknown,
  headers: unknown,
): CampaignInvitationsPage {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)
      ? ((data as { data: unknown[] }).data)
      : data && typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)
        ? ((data as { items: unknown[] }).items)
        : [];

  const items = list
    .map(parseCampaignInvitation)
    .filter((item): item is CampaignInvitation => item != null);

  return {
    items,
    nextCursor: readNextCursorHeader(headers),
  };
}

/** Merge by invitation id (not email) — reissue keeps both old and new rows. */
export function mergeInvitationsById(
  current: readonly CampaignInvitation[],
  incoming: readonly CampaignInvitation[],
): CampaignInvitation[] {
  const map = new Map<string, CampaignInvitation>();
  for (const item of current) map.set(item.id, item);
  for (const item of incoming) map.set(item.id, item);
  return Array.from(map.values());
}

export type InvitationSortMode = 'newest' | 'oldest' | 'expiringSoon' | 'emailAsc';

export function filterAndSortInvitations(
  items: readonly CampaignInvitation[],
  options: {
    search: string;
    status: CampaignInvitationStatus | 'all';
    sort: InvitationSortMode;
  },
): CampaignInvitation[] {
  const search = options.search.trim().toLowerCase();
  let next = items.filter((item) => {
    if (options.status !== 'all' && item.status !== options.status) return false;
    if (search && !item.email.includes(search)) return false;
    return true;
  });

  next = [...next].sort((a, b) => {
    switch (options.sort) {
      case 'oldest':
        return a.createdAt.localeCompare(b.createdAt);
      case 'expiringSoon':
        return a.expiresAt.localeCompare(b.expiresAt);
      case 'emailAsc':
        return a.email.localeCompare(b.email);
      case 'newest':
      default:
        return b.createdAt.localeCompare(a.createdAt);
    }
  });

  return next;
}

export function countInvitationsByStatus(
  items: readonly CampaignInvitation[],
): Record<CampaignInvitationStatus, number> {
  const counts: Record<CampaignInvitationStatus, number> = {
    Queued: 0,
    Sent: 0,
    Joined: 0,
    Expired: 0,
    Revoked: 0,
  };
  for (const item of items) {
    counts[item.status] += 1;
  }
  return counts;
}
