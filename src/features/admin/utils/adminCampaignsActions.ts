import { getApiStatusCode } from '@/shared/api/apiError';
import { DEFAULT_PAGE_SIZE } from '@/components/ui/app-pagination';
import type {
  AdminCampaignListItem,
  AdminCampaignStatus,
  AdminCampaignStatusFilter,
  GetAdminCampaignsParams,
} from '../types/adminCampaigns.types';

export function buildAdminCampaignQueryParams(
  params: GetAdminCampaignsParams,
): Record<string, string | number> {
  const query: Record<string, string | number> = {
    limit: params.limit ?? DEFAULT_PAGE_SIZE,
  };
  if (params.status) query.status = params.status;
  if (params.orgId?.trim()) query.orgId = params.orgId.trim();
  if (params.cursor?.trim()) query.cursor = params.cursor.trim();
  return query;
}

export function toAdminCampaignApiParams(options: {
  status: AdminCampaignStatusFilter;
  orgId: string;
  cursor: string | null;
  limit: number;
}): GetAdminCampaignsParams {
  return {
    status: options.status === 'all' ? undefined : options.status,
    orgId: options.orgId.trim() || undefined,
    cursor: options.cursor || undefined,
    limit: options.limit,
  };
}

export function filterAdminCampaignsLocally(
  items: AdminCampaignListItem[],
  search: string,
): AdminCampaignListItem[] {
  const query = search.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) => {
    const haystack = [
      item.title,
      item.organizationName,
      item.orgId,
      item.domain,
      item.id,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function shortenId(value: string | null | undefined, size = 8): string {
  if (!value?.trim()) return '—';
  const trimmed = value.trim();
  if (trimmed.length <= size + 4) return trimmed;
  return `${trimmed.slice(0, 4)}…${trimmed.slice(-4)}`;
}

export function formatAdminCampaignDate(
  value: string | null | undefined,
  locale: string,
): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    dateStyle: 'medium',
  }).format(date);
}

export function campaignTimelineLabel(
  item: AdminCampaignListItem,
  now = Date.now(),
): 'upcoming' | 'ended' | 'running' | 'unknown' {
  const start = item.startsAt ? new Date(item.startsAt).getTime() : NaN;
  const end = item.expiresAt ? new Date(item.expiresAt).getTime() : NaN;
  if (Number.isFinite(start) && now < start) return 'upcoming';
  if (Number.isFinite(end) && now > end) return 'ended';
  if (Number.isFinite(start) || Number.isFinite(end)) return 'running';
  return 'unknown';
}

export function getAdminCampaignErrorKey(error: unknown): string {
  const status = getApiStatusCode(error);
  if (status === 403) return 'admin.campaignsManage.errors.forbidden';
  return 'admin.campaignsManage.errors.loadFailed';
}

export const ADMIN_CAMPAIGN_STATUS_OPTIONS: AdminCampaignStatus[] = [
  'Draft',
  'Active',
  'Closed',
  'Archived',
];

