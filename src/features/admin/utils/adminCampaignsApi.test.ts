import { describe, expect, it } from 'vitest';
import {
  buildAdminCampaignQueryParams,
  filterAdminCampaignsLocally,
  toAdminCampaignApiParams,
} from './adminCampaignsActions';
import {
  normalizeAdminCampaignStatus,
  parseAdminCampaignListItem,
  parseAdminCampaignPage,
  readNextCursorHeader,
} from './adminCampaignsApi';

describe('adminCampaignsApi', () => {
  it('reads X-Next-Cursor from headers', () => {
    expect(readNextCursorHeader({ 'x-next-cursor': 'next-1' })).toBe('next-1');
    expect(readNextCursorHeader({ 'X-Next-Cursor': 'next-2' })).toBe('next-2');
  });

  it('normalizes campaign status values', () => {
    expect(normalizeAdminCampaignStatus('active')).toBe('Active');
    expect(normalizeAdminCampaignStatus('Draft')).toBe('Draft');
    expect(normalizeAdminCampaignStatus('paused')).toBeNull();
  });

  it('parses list items and page cursor from header only', () => {
    const item = parseAdminCampaignListItem({
      id: 'c1',
      title: 'Backend Hiring',
      status: 'Active',
      organizationId: 'org-1',
      organizationName: 'Acme',
      totalCandidates: 12,
      maxCandidates: 50,
    });
    expect(item?.orgId).toBe('org-1');
    expect(item?.totalCandidates).toBe(12);

    const page = parseAdminCampaignPage([item], { 'x-next-cursor': 'cursor-a' });
    expect(page.items).toHaveLength(1);
    expect(page.nextCursor).toBe('cursor-a');
  });
});

describe('adminCampaignsActions', () => {
  it('omits empty query params', () => {
    expect(
      buildAdminCampaignQueryParams({
        status: undefined,
        orgId: '',
        cursor: undefined,
        limit: 20,
      }),
    ).toEqual({ limit: 20 });

    expect(
      toAdminCampaignApiParams({
        status: 'all',
        orgId: '  ',
        cursor: null,
        limit: 10,
      }),
    ).toEqual({ status: undefined, orgId: undefined, cursor: undefined, limit: 10 });
  });

  it('filters locally by title or organization', () => {
    const rows = [
      {
        id: '1',
        title: 'Frontend',
        status: 'Active' as const,
        organizationName: 'Acme',
      },
      {
        id: '2',
        title: 'Backend',
        status: 'Draft' as const,
        organizationName: 'Beta',
      },
    ];
    expect(filterAdminCampaignsLocally(rows, 'acme')).toHaveLength(1);
  });
});
