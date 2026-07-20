import { describe, expect, it } from 'vitest';
import {
  countInvitationsByStatus,
  filterAndSortInvitations,
  mergeInvitationsById,
  parseCampaignInvitationsPage,
  readNextCursorHeader,
} from './campaignInvitationsApi';
import type { CampaignInvitation } from '../types/campaign.api.types';

const sample = (partial: Partial<CampaignInvitation> & Pick<CampaignInvitation, 'id' | 'email'>): CampaignInvitation => ({
  status: 'Sent',
  createdAt: '2026-07-01T00:00:00Z',
  expiresAt: '2026-07-08T00:00:00Z',
  emailSentAt: '2026-07-01T01:00:00Z',
  joinedAt: null,
  ...partial,
});

describe('campaignInvitationsApi', () => {
  it('reads X-Next-Cursor with lowercase header key', () => {
    expect(readNextCursorHeader({ 'x-next-cursor': 'abc' })).toBe('abc');
    expect(readNextCursorHeader({ 'X-Next-Cursor': 'xyz' })).toBe('xyz');
    expect(readNextCursorHeader({})).toBeNull();
  });

  it('parses invitation list and next cursor from headers', () => {
    const page = parseCampaignInvitationsPage(
      [
        {
          id: '1',
          email: 'A@X.com',
          status: 'Queued',
          createdAt: '2026-07-01T00:00:00Z',
          expiresAt: '2026-07-10T00:00:00Z',
        },
      ],
      { 'x-next-cursor': 'cursor-1' },
    );
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.email).toBe('a@x.com');
    expect(page.items[0]?.status).toBe('Queued');
    expect(page.nextCursor).toBe('cursor-1');
  });

  it('merges by invitation id and keeps same-email rows', () => {
    const merged = mergeInvitationsById(
      [sample({ id: 'old', email: 'a@x.com', status: 'Revoked' })],
      [sample({ id: 'new', email: 'a@x.com', status: 'Queued' })],
    );
    expect(merged).toHaveLength(2);
    expect(merged.map((item) => item.id).sort()).toEqual(['new', 'old']);
  });

  it('filters and sorts client-side without changing status', () => {
    const items = [
      sample({ id: '1', email: 'b@x.com', status: 'Joined', createdAt: '2026-07-02T00:00:00Z' }),
      sample({ id: '2', email: 'a@x.com', status: 'Queued', createdAt: '2026-07-03T00:00:00Z' }),
    ];
    const filtered = filterAndSortInvitations(items, {
      search: 'a@',
      status: 'all',
      sort: 'newest',
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('2');
    expect(countInvitationsByStatus(items).Joined).toBe(1);
  });
});
