/* @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authEndpoints } from '@/features/auth/services/authEndpoints';
import { apiClient } from '@/shared/api';
import { engagementService } from './engagement.service';

vi.mock('@/shared/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApi = vi.mocked(apiClient);
const memberDto = {
  userId: 'user-1',
  email: 'hr@isas.dev',
  fullName: 'HR Member',
  orgRole: 'HrMember',
  joinedAt: '2026-07-28T00:00:00.000Z',
};

describe('engagementService organization members', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists the unpaginated organization member response', async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [memberDto] });

    await expect(engagementService.listTeam()).resolves.toEqual([memberDto]);
    expect(mockedApi.get).toHaveBeenCalledWith(authEndpoints.orgMembers);
  });

  it('creates an HrMember without sending a password or role', async () => {
    mockedApi.post.mockResolvedValueOnce({ data: memberDto });
    const input = { email: 'hr@isas.dev', fullName: 'HR Member' };

    await expect(engagementService.inviteTeamMember(input)).resolves.toEqual(memberDto);
    expect(mockedApi.post).toHaveBeenCalledWith(authEndpoints.orgMembers, input);
  });

  it('updates only the requested organization role', async () => {
    const updated = { ...memberDto, orgRole: 'OrgAdmin' };
    mockedApi.patch.mockResolvedValueOnce({ data: updated });

    await expect(
      engagementService.updateTeamMemberRole('user/1', { orgRole: 'OrgAdmin' }),
    ).resolves.toEqual(updated);
    expect(mockedApi.patch).toHaveBeenCalledWith(
      '/api/v1/auth/org/members/user%2F1',
      { orgRole: 'OrgAdmin' },
    );
  });

  it('removes only the organization membership with no request body', async () => {
    mockedApi.delete.mockResolvedValueOnce({ status: 204, data: undefined });

    await expect(engagementService.removeTeamMember('user/1')).resolves.toBeUndefined();
    expect(mockedApi.delete).toHaveBeenCalledWith(
      '/api/v1/auth/org/members/user%2F1',
    );
  });

  it('rejects unsupported organization roles from the API', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ ...memberDto, orgRole: 'Admin' }],
    });

    await expect(engagementService.listTeam()).rejects.toThrow(
      'Invalid organization role',
    );
  });

  it('rejects members missing required identity or membership fields', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ email: 'hr@isas.dev', orgRole: 'HrMember' }],
    });

    await expect(engagementService.listTeam()).rejects.toThrow(
      'missing required fields',
    );
  });
});
