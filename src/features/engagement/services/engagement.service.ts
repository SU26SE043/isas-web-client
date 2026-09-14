import { authEndpoints } from '@/features/auth/services/authEndpoints';
import { apiClient } from '@/shared/api';
import { pickAuthString, unwrapAuthPayload } from '@/shared/api/authPayload';
import type {
  TeamInviteInput,
  TeamMember,
  TeamRole,
  TeamRoleUpdateInput,
  Organization,
  OrganizationUpdateInput,
} from '../types/engagement.types';

function parseTeamRole(value: unknown): TeamRole {
  if (value === 'OrgAdmin' || value === 'HrMember') return value;
  throw new Error(`Invalid organization role: ${String(value)}`);
}

export function parseOrgMember(raw: unknown): TeamMember {
  const member = unwrapAuthPayload<Record<string, unknown>>(raw);
  if (!member || typeof member !== 'object') {
    throw new Error('Invalid organization member payload');
  }
  const userId = pickAuthString(member, 'userId', 'UserId');
  const email = pickAuthString(member, 'email', 'Email');
  const joinedAt = pickAuthString(member, 'joinedAt', 'JoinedAt');
  if (!userId || !email || !joinedAt) {
    throw new Error('Organization member response missing required fields');
  }

  return {
    userId,
    email,
    fullName: pickAuthString(member, 'fullName', 'FullName') ?? '',
    orgRole: parseTeamRole(member.orgRole ?? member.OrgRole),
    joinedAt,
  };
}

export function parseOrganization(raw: unknown): Organization {
  const organization = unwrapAuthPayload<Record<string, unknown>>(raw);
  if (!organization || typeof organization !== 'object') {
    throw new Error('Invalid organization payload');
  }

  const id = pickAuthString(organization, 'id', 'Id');
  const name = pickAuthString(organization, 'name', 'Name');
  const createdAt = pickAuthString(organization, 'createdAt', 'CreatedAt');
  const rawMemberCount = organization.memberCount ?? organization.MemberCount;
  const memberCount = typeof rawMemberCount === 'number'
    ? rawMemberCount
    : typeof rawMemberCount === 'string' && rawMemberCount.trim()
      ? Number(rawMemberCount)
      : Number.NaN;

  if (!id || !name || !createdAt || !Number.isInteger(memberCount) || memberCount < 0) {
    throw new Error('Organization response missing required fields');
  }

  return {
    id,
    name,
    taxCode: pickAuthString(organization, 'taxCode', 'TaxCode') ?? undefined,
    createdAt,
    memberCount,
  };
}

/**
 * Chỉ còn hai nhóm gọi BE thật: thành viên org (`/auth/org/members`, A6/A6b) và hồ sơ tổ chức (`/auth/org`).
 * Thông báo / preferences / help / support ticket từng là fixture in-memory — gỡ 2026-09-13.
 */
export const engagementService = {
  async listTeam(): Promise<TeamMember[]> {
    const { data } = await apiClient.get(authEndpoints.orgMembers);
    const members = unwrapAuthPayload<unknown>(data);
    if (!Array.isArray(members)) {
      throw new Error('Invalid organization members response');
    }
    return members.map(parseOrgMember);
  },

  async inviteTeamMember(input: TeamInviteInput): Promise<TeamMember> {
    const { data } = await apiClient.post(authEndpoints.orgMembers, input);
    return parseOrgMember(data);
  },

  async updateTeamMemberRole(
    userId: string,
    input: TeamRoleUpdateInput,
  ): Promise<TeamMember> {
    const { data } = await apiClient.patch(authEndpoints.orgMember(userId), input);
    return parseOrgMember(data);
  },

  async removeTeamMember(userId: string): Promise<void> {
    await apiClient.delete(authEndpoints.orgMember(userId));
  },

  async getOrganization(): Promise<Organization> {
    const { data } = await apiClient.get(authEndpoints.org);
    return parseOrganization(data);
  },

  async updateOrganization(input: OrganizationUpdateInput): Promise<Organization> {
    const { data } = await apiClient.put(authEndpoints.org, input);
    return parseOrganization(data);
  },
};
