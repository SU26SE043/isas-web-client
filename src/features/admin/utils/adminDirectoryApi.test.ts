/* @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { adminDirectoryEndpoints } from '../services/adminDirectory.endpoints';
import { adminDirectoryService } from '../services/adminDirectory.service';
import {
  buildAdminOrganizationParams,
  parseAdminDirectoryUser,
  parseAdminOrganization,
} from './adminDirectoryApi';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const mockedApi = vi.mocked(apiClient);

describe('Admin Auth directory APIs', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lists organizations and reads X-Next-Cursor', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{
        id: 'org-1',
        name: 'ISAS Labs',
        taxCode: 'TAX-001',
        createdAt: '2026-07-20T00:00:00.000Z',
        memberCount: 3,
      }],
      headers: { 'x-next-cursor': 'org-next' },
    });

    await expect(adminDirectoryService.getAdminOrganizations({
      search: '  ISAS  ',
      limit: 999,
    })).resolves.toMatchObject({
      items: [{ id: 'org-1', name: 'ISAS Labs', memberCount: 3 }],
      nextCursor: 'org-next',
    });
    expect(mockedApi.get).toHaveBeenCalledWith(
      adminDirectoryEndpoints.organizations,
      { params: { search: 'ISAS', limit: 500 } },
    );
  });

  it('lists users with role, search, cursor, and limit query parameters', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{
        id: 'user-1',
        email: 'owner@isas.dev',
        fullName: 'Organization Owner',
        role: 'OrgAdmin',
        orgId: 'org-1',
        orgName: 'ISAS Labs',
        orgRole: 'OrgAdmin',
        createdAt: '2026-07-20T00:00:00.000Z',
        bannedAt: '2026-07-28T00:00:00.000Z',
        banReason: 'Policy violation',
      }],
      headers: { 'X-Next-Cursor': 'user-next' },
    });

    await expect(adminDirectoryService.getAdminUsers({
      role: 'OrgAdmin',
      search: 'owner',
      cursor: 'cursor-1',
      limit: 50,
    })).resolves.toMatchObject({
      items: [{
        id: 'user-1',
        role: 'OrgAdmin',
        orgName: 'ISAS Labs',
        banReason: 'Policy violation',
      }],
      nextCursor: 'user-next',
    });
    expect(mockedApi.get).toHaveBeenCalledWith(
      adminDirectoryEndpoints.users,
      { params: { search: 'owner', cursor: 'cursor-1', limit: 50, role: 'OrgAdmin' } },
    );
  });

  it('normalizes wrapped PascalCase payloads', () => {
    expect(parseAdminOrganization({
      Id: 'org-1',
      Name: 'ISAS Labs',
      CreatedAt: '2026-07-20T00:00:00.000Z',
      MemberCount: '3',
    })).toMatchObject({ id: 'org-1', memberCount: 3 });
    expect(parseAdminDirectoryUser({
      Id: 'user-1',
      Email: 'candidate@isas.dev',
      FullName: 'Candidate',
      Role: 'Candidate',
      CreatedAt: '2026-07-20T00:00:00.000Z',
    })).toMatchObject({ id: 'user-1', role: 'Candidate' });
  });

  it('rejects malformed items and clamps invalid limits', () => {
    expect(() => parseAdminOrganization({ id: 'org-1' }))
      .toThrow('missing required fields');
    expect(() => parseAdminDirectoryUser({ id: 'user-1' }))
      .toThrow('missing required fields');
    expect(() => parseAdminDirectoryUser({
      id: 'user-1',
      email: 'legacy@isas.dev',
      fullName: 'Legacy User',
      role: 'Employer',
      createdAt: '2026-07-20T00:00:00.000Z',
    })).toThrow('missing required fields');
    expect(buildAdminOrganizationParams({ limit: -10 })).toEqual({ limit: 1 });
  });
});
