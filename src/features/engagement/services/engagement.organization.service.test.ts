/* @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authEndpoints } from '@/features/auth/services/authEndpoints';
import { apiClient } from '@/shared/api';
import { engagementService, parseOrganization } from './engagement.service';

vi.mock('@/shared/api', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

const mockedApi = vi.mocked(apiClient);
const organizationDto = {
  id: 'org-1',
  name: 'ISAS Labs',
  taxCode: 'TAX-001',
  createdAt: '2026-07-20T00:00:00.000Z',
  memberCount: 3,
};

describe('engagementService organization profile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('gets the current organization with the exact Auth endpoint', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: organizationDto });

    await expect(engagementService.getOrganization()).resolves.toEqual(organizationDto);
    expect(mockedApi.get).toHaveBeenCalledWith(authEndpoints.org);
  });

  it('updates only the supplied organization fields', async () => {
    const input = { name: 'ISAS Vietnam', taxCode: '' };
    mockedApi.put.mockResolvedValueOnce({
      data: { ...organizationDto, name: input.name, taxCode: undefined },
    });

    await expect(engagementService.updateOrganization(input)).resolves.toEqual({
      ...organizationDto,
      name: input.name,
      taxCode: undefined,
    });
    expect(mockedApi.put).toHaveBeenCalledWith(authEndpoints.org, input);
  });

  it('accepts a wrapped PascalCase response', () => {
    expect(parseOrganization({
      data: {
        Id: 'org-1',
        Name: 'ISAS Labs',
        CreatedAt: organizationDto.createdAt,
        MemberCount: 3,
      },
    })).toEqual({ ...organizationDto, taxCode: undefined });
  });

  it('rejects a response missing required fields', () => {
    expect(() => parseOrganization({ id: 'org-1', name: 'ISAS Labs' }))
      .toThrow('missing required fields');
  });
});
