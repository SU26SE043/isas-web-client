/** Platform roles returned by the Auth admin directory contract. */
export type AdminDirectoryRole =
  | 'Candidate'
  | 'Employer'
  | 'Admin'
  | 'NoRole'
  // Transitional values accepted while older Auth records are being migrated.
  | 'OrgAdmin'
  | 'HrMember';
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
