import type { UserRoleType } from '@/features/auth/types/auth.types';

export type AdminDirectoryRole = Exclude<UserRoleType, 'guest'>;
export type AdminDirectoryRoleFilter = 'all' | AdminDirectoryRole;

export interface AdminOrganization {
  id: string;
  name: string;
  taxCode?: string;
  createdAt: string;
  memberCount: number;
}

export interface AdminDirectoryUser {
  id: string;
  email: string;
  fullName: string;
  role: AdminDirectoryRole;
  orgId?: string;
  orgName?: string;
  orgRole?: string;
  createdAt: string;
  bannedAt?: string;
  banReason?: string;
}

export interface AdminDirectoryPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface GetAdminOrganizationsParams {
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface GetAdminUsersParams extends GetAdminOrganizationsParams {
  role?: AdminDirectoryRole;
}

export interface AdminBanUserInput {
  reason?: string;
}

export interface AdminResetUserPasswordInput {
  newPassword: string;
}
